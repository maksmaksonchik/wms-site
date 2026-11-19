# shellcheck shell=bash
# Автоматические бэкапы. Подключается из setup.sh, отдельно не запускается.
#
#   ВМ сайта: wms-backup.timer каждую ночь запускает scripts/backup.sh от ADMIN_USER,
#             копии лежат в BACKUP_DIR. Шлюз читает их под пользователем
#             wms-backup-pull, которому разрешён только rrsync -ro этого каталога.
#   Шлюз:     wms-backup-pull.timer через час забирает копии к себе (backup-pull.sh).

BACKUP_GROUP=wms-backup
BACKUP_PULL_USER=wms-backup-pull
PULL_LOCAL_USER=wms-backup
PULL_HOME=/var/lib/wms-backup

require_rrsync() {
  command -v rrsync >/dev/null && return
  # В Ubuntu 24.04 rrsync идёт в пакете rsync; на всякий случай — из документации
  local doc=/usr/share/doc/rsync/scripts/rrsync
  if [[ -f $doc ]]; then
    install -m 755 "$doc" /usr/local/bin/rrsync
  elif [[ -f $doc.gz ]]; then
    gzip -dc "$doc.gz" > /usr/local/bin/rrsync && chmod 755 /usr/local/bin/rrsync
  else
    die "Не нашёл rrsync (должен быть в пакете rsync)"
  fi
}

# Пустить шлюз по SSH. Отдельным файлом, а не в 00-hardening.conf: так это работает и на
# ВМ, где hardening не применялся (setup.sh backup). Строки AllowUsers из разных файлов
# sshd складывает, поэтому файл пишется, только если AllowUsers уже где-то задан:
# иначе sshd и так пускает всех, а одинокий AllowUsers закрыл бы вход остальным
backup_sshd_allow() {
  local f=/etc/ssh/sshd_config.d/10-zmsh-backup.conf want="$BACKUP_PULL_USER@$LAN_NET"
  install -d -m 755 /run/sshd
  local had_file=0
  [[ -f $f ]] && { had_file=1; mv "$f" "$f.prev"; }
  local -a before
  mapfile -t before < <(sshd -T 2>/dev/null | awk '$1 == "allowusers" {for (i = 2; i <= NF; i++) print $i}')
  if [[ ${#before[@]} -eq 0 ]]; then
    rm -f "$f.prev"
    info "AllowUsers в sshd не задан — $BACKUP_PULL_USER и так может войти (по ключу)"
    [[ $had_file == 1 ]] && systemctl try-reload-or-restart ssh.service
    return
  fi
  printf '# setup.sh (lib/backup.sh): вход шлюза за бэкапами, только из LAN\nAllowUsers %s\n' "$want" > "$f"
  if ! sshd -t; then
    rm -f "$f"; [[ -f $f.prev ]] && mv "$f.prev" "$f"
    die "sshd -t не прошёл с $f — конфиг возвращён как был"
  fi
  rm -f "$f.prev"
  local after u
  after=$(sshd -T | awk '$1 == "allowusers" {for (i = 2; i <= NF; i++) print $i}')
  for u in "${before[@]}" "$want"; do
    grep -qxF "$u" <<<"$after" || die "После правки sshd -T не показывает AllowUsers $u — проверьте $f"
  done
  systemctl try-reload-or-restart ssh.service
  info "AllowUsers: $(tr '\n' ' ' <<<"$after")"
}

setup_backup_app() {
  local dir=${BACKUP_DIR:-/var/backups/wms-site}
  log "Бэкапы: wms-backup.timer, копии в $dir"
  [[ -f $APP_DIR/scripts/backup.sh ]] || die "Нет $APP_DIR/scripts/backup.sh: обновите код (git pull)"
  id -nG "$ADMIN_USER" | grep -qw docker \
    || warn "$ADMIN_USER не в группе docker — бэкап от его имени не сможет работать с контейнерами"
  getent group "$BACKUP_GROUP" >/dev/null || addgroup --system "$BACKUP_GROUP" >/dev/null
  # setgid: новые бэкапы получают группу wms-backup, и шлюз может их читать
  install -d -m 2750 -o "$ADMIN_USER" -g "$BACKUP_GROUP" "$dir"

  cat > /etc/systemd/system/wms-backup.service <<EOF
# setup.sh: бэкап сайта (scripts/backup.sh). Ручной запуск: sudo systemctl start wms-backup
[Unit]
Description=Бэкап сайта ЗМШ: база, загрузки, секреты
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=$ADMIN_USER
WorkingDirectory=$APP_DIR
Environment=BACKUP_DIR=$dir BACKUP_KEEP_DAYS=${BACKUP_KEEP_DAYS:-14} BACKUP_MIN_KEEP=${BACKUP_MIN_KEEP:-3}
ExecStart=/usr/bin/bash $APP_DIR/scripts/backup.sh
Nice=10
IOSchedulingClass=idle
EOF
  cat > /etc/systemd/system/wms-backup.timer <<'EOF'
# setup.sh: каждую ночь; пропущенный (ВМ была выключена) запуск — сразу после старта
[Unit]
Description=Ежесуточный бэкап сайта ЗМШ

[Timer]
OnCalendar=*-*-* 02:30 Asia/Yekaterinburg
RandomizedDelaySec=10min
Persistent=true

[Install]
WantedBy=timers.target
EOF
  systemctl daemon-reload
  systemctl enable --now wms-backup.timer >/dev/null

  if [[ -z ${BACKUP_PULL_PUBKEY:-} ]]; then
    warn "BACKUP_PULL_PUBKEY пуст: копии будут только на этой ВМ. Ключ печатает sudo ./setup.sh vpn на шлюзе"
    return
  fi
  [[ $BACKUP_PULL_PUBKEY =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+(\ .*)?$ ]] \
    || die "BACKUP_PULL_PUBKEY не похож на ключ ssh-ed25519 (его печатает setup.sh vpn)"
  require_rrsync
  local home=/var/lib/$BACKUP_PULL_USER
  if ! id "$BACKUP_PULL_USER" &>/dev/null; then
    # Нужен настоящий shell: принудительную команду sshd запускает через него
    adduser --system --ingroup "$BACKUP_GROUP" --home "$home" --no-create-home \
      --shell /bin/sh "$BACKUP_PULL_USER" >/dev/null
  fi
  # '*' вместо '!': заблокированный пароль, но не заблокированная учётка (вход только по ключу)
  usermod -p '*' "$BACKUP_PULL_USER"
  # Каталог и ключи — root: пользователь не может поменять собственные ограничения
  install -d -m 755 -o root -g root "$home" "$home/.ssh"
  printf 'restrict,from="%s",command="%s -ro %s" %s\n' \
    "$LAN_NET" "$(command -v rrsync)" "$dir" "$BACKUP_PULL_PUBKEY" > "$home/.ssh/authorized_keys"
  chmod 644 "$home/.ssh/authorized_keys"
  backup_sshd_allow
  info "Шлюзу разрешено читать $dir (пользователь $BACKUP_PULL_USER, только из $LAN_NET)"
}

setup_backup_pull() {
  if [[ -z ${BACKUP_PULL_HOST:-} ]]; then
    info "BACKUP_PULL_HOST пуст — забор бэкапов с сайта не настраиваю"
    return
  fi
  local dest=${BACKUP_PULL_DIR:-/var/backups/wms-site}
  log "Бэкапы: забирать с $BACKUP_PULL_HOST в $dest"
  apt-get -y -q install rsync >/dev/null
  local free_mb
  free_mb=$(df -Pm "$(dirname "$dest")" | awk 'NR == 2 {print $4}')
  # 14 копий по ~56 МБ — около 0,8 ГБ, с запасом на рост медиатеки
  [[ $free_mb -ge 2048 ]] || warn "Свободно всего $free_mb МБ: копий за ${BACKUP_KEEP_DAYS:-14} дней может не хватить места"
  if ! id "$PULL_LOCAL_USER" &>/dev/null; then
    adduser --system --group --home "$PULL_HOME" --shell /usr/sbin/nologin "$PULL_LOCAL_USER" >/dev/null
  fi
  install -d -m 700 -o "$PULL_LOCAL_USER" -g "$PULL_LOCAL_USER" "$PULL_HOME/.ssh" "$dest"
  if [[ ! -f $PULL_HOME/.ssh/id_ed25519 ]]; then
    sudo -u "$PULL_LOCAL_USER" ssh-keygen -q -t ed25519 -N '' -C "wms-backup@$(hostname)" \
      -f "$PULL_HOME/.ssh/id_ed25519"
  fi

  install -m 755 "$SCRIPT_DIR/backup-pull.sh" /usr/local/sbin/wms-backup-pull
  cat > /etc/default/wms-backup-pull <<EOF
# setup.sh: настройки /usr/local/sbin/wms-backup-pull
PULL_FROM=$BACKUP_PULL_USER@$BACKUP_PULL_HOST
DEST=$dest
KEEP_DAYS=${BACKUP_KEEP_DAYS:-14}
MIN_KEEP=${BACKUP_MIN_KEEP:-3}
MAX_AGE_HOURS=36
EOF
  cat > /etc/systemd/system/wms-backup-pull.service <<EOF
# setup.sh: забрать бэкапы сайта. Ручной запуск: sudo systemctl start wms-backup-pull
[Unit]
Description=Забрать бэкапы сайта ЗМШ на шлюз
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
User=$PULL_LOCAL_USER
EnvironmentFile=/etc/default/wms-backup-pull
ExecStart=/usr/local/sbin/wms-backup-pull
Nice=10
IOSchedulingClass=idle
EOF
  cat > /etc/systemd/system/wms-backup-pull.timer <<'EOF'
# setup.sh: через час после бэкапа на сайте (02:30)
[Unit]
Description=Ежесуточный забор бэкапов сайта ЗМШ

[Timer]
OnCalendar=*-*-* 03:30 Asia/Yekaterinburg
RandomizedDelaySec=10min
Persistent=true

[Install]
WantedBy=timers.target
EOF
  systemctl daemon-reload
  systemctl enable --now wms-backup-pull.timer >/dev/null

  info "Ключ шлюза — вписать в BACKUP_PULL_PUBKEY в vm.env на ВМ сайта и запустить там"
  info "sudo ./setup.sh app (на уже работающей ВМ — sudo ./setup.sh backup):"
  printf '\n    BACKUP_PULL_PUBKEY="%s"\n\n' "$(cat "$PULL_HOME/.ssh/id_ed25519.pub")"
  info "Проверка после этого: sudo systemctl start wms-backup-pull && journalctl -u wms-backup-pull -n 20"
}

# setup.sh backup: только бэкапы на уже работающей ВМ — без обновления системы,
# ufw и усиления sshd. Роль определяется по тому, что на машине уже есть
role_backup() {
  local wg_conf=/etc/wireguard/${WG_IF:-wg0}.conf app_compose=${APP_DIR:?}/docker-compose.yml
  local is_vpn=0 is_app=0
  [[ -f $wg_conf ]] && is_vpn=1
  [[ -f $app_compose ]] && is_app=1
  case $is_vpn$is_app in
    10)
      info "Есть $wg_conf — это шлюз: настраиваю забор бэкапов с ${BACKUP_PULL_HOST:-?}"
      [[ -n ${BACKUP_PULL_HOST:-} ]] || die "BACKUP_PULL_HOST пуст в vm.env"
      setup_backup_pull
      ;;
    01)
      info "Есть $app_compose — это ВМ сайта: настраиваю ночной бэкап"
      apt-get -y -q install rsync >/dev/null
      setup_backup_app
      if confirm "Сделать первый бэкап сейчас?"; then
        systemctl start wms-backup.service || true
        journalctl -u wms-backup.service -n 15 --no-pager -o cat
        systemctl is-failed -q wms-backup.service && die "Бэкап не удался (журнал выше)"
      fi
      if [[ -n ${BACKUP_PULL_PUBKEY:-} ]]; then
        info "Проверьте забор на шлюзе: sudo systemctl start wms-backup-pull && journalctl -u wms-backup-pull -n 20"
      fi
      ;;
    11) die "Здесь и $wg_conf, и $app_compose — не понимаю, шлюз это или сайт" ;;
    *)  die "Нет ни $wg_conf (шлюз, проверьте WG_IF), ни $app_compose (сайт, проверьте APP_DIR)" ;;
  esac
}
