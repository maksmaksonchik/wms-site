# shellcheck shell=bash
# Общие шаги для обеих ролей. Подключается из setup.sh, отдельно не запускается.

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

confirm() {
  [[ ${ASSUME_YES:-0} == 1 ]] && return 0
  local answer
  read -r -p "$1 [y/N] " answer
  [[ $answer == [yYдД]* ]]
}

# ip_in_nets <ip> <cidr>... — входит ли адрес хотя бы в одну из сетей
ip_in_nets() {
  python3 - "$@" <<'PY'
import ipaddress, sys
ip = ipaddress.ip_address(sys.argv[1])
nets = [ipaddress.ip_network(n.strip(','), strict=False) for n in sys.argv[2:]]
sys.exit(0 if any(ip.version == n.version and ip in n for n in nets) else 1)
PY
}

preflight() {
  [[ $EUID -eq 0 ]] || die "Запускайте от root: sudo $0 $ROLE"
  # shellcheck disable=SC1091
  . /etc/os-release
  if [[ $ID != ubuntu || $VERSION_ID != 24.04 ]]; then
    warn "Скрипт рассчитан на Ubuntu 24.04, а здесь $PRETTY_NAME"
    confirm "Всё равно продолжить?" || exit 1
  fi

  local env_file="$SCRIPT_DIR/vm.env"
  [[ -f $env_file ]] || die "Нет $env_file: cp vm.env.example vm.env и заполните"
  # shellcheck source=vm.env.example
  . "$env_file"
  : "${ADMIN_USER:?не задан в vm.env}" "${LAN_NET:?}" "${VPN_NET:?}" "${SSH_ALLOW_FROM:?}"

  PUB_IF=${PUB_IF:-$(ip -4 route show default | awk '{print $5; exit}')}
  [[ -n $PUB_IF ]] || die "Не нашёл публичный интерфейс (нет маршрута по умолчанию), задайте PUB_IF"

  if [[ -z ${LAN_IF:-} ]]; then
    local ifname addr
    while read -r ifname addr; do
      if ip_in_nets "${addr%/*}" "$LAN_NET"; then LAN_IF=$ifname; break; fi
    done < <(ip -o -4 addr show | awk '{print $2, $4}')
  fi
  if [[ -z ${LAN_IF:-} ]]; then
    warn "Нет интерфейса с адресом из $LAN_NET. Подключите ВМ к локальной сети в панели NetAngels"
    confirm "Продолжить без LAN?" || exit 1
  fi
  info "Публичный интерфейс: $PUB_IF, внутренний: ${LAN_IF:-нет}"
}

setup_packages() {
  log "Обновление системы и базовые пакеты"
  export DEBIAN_FRONTEND=noninteractive
  # needrestart только показывает, что перезапустить, а не перезапускает ssh посреди работы
  export NEEDRESTART_MODE=l
  apt-get update -q
  # confold: при вопросах о конфигах оставлять локальную версию
  apt-get -y -q -o Dpkg::Options::=--force-confold upgrade
  apt-get -y -q install ufw unattended-upgrades needrestart iptables curl git ca-certificates python3
}

setup_system() {
  log "Часовой пояс, журнал, swap, sysctl"
  [[ -n ${TIMEZONE:-} ]] && timedatectl set-timezone "$TIMEZONE"

  install -d /etc/systemd/journald.conf.d
  printf '[Journal]\nSystemMaxUse=%s\n' "${JOURNAL_MAX:-500M}" > /etc/systemd/journald.conf.d/90-zmsh.conf
  systemctl restart systemd-journald

  if [[ -n ${SWAP_SIZE:-} && -z $(swapon --noheadings) ]]; then
    fallocate -l "$SWAP_SIZE" /swapfile
    chmod 600 /swapfile
    mkswap /swapfile >/dev/null
    swapon /swapfile
    grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
    info "Создан swap $SWAP_SIZE"
  fi

  # /etc/sysctl.conf новые systemd читают всё менее охотно, поэтому только sysctl.d
  cat > /etc/sysctl.d/90-zmsh-hardening.conf <<'EOF'
# setup.sh: базовое усиление сетевого стека
net.ipv4.tcp_syncookies = 1
# loose-режим: корректно работает при асимметричной маршрутизации VPN
net.ipv4.conf.all.rp_filter = 2
net.ipv4.conf.default.rp_filter = 2
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
vm.swappiness = 10
EOF
  sysctl --system >/dev/null
}

setup_unattended() {
  log "Автоматические обновления безопасности (без автоперезагрузки)"
  cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
  systemctl enable --now unattended-upgrades >/dev/null
}

setup_admin_user() {
  log "Пользователь $ADMIN_USER"
  if ! id "$ADMIN_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" "$ADMIN_USER" >/dev/null
  fi
  usermod -aG sudo "$ADMIN_USER"

  local home ak
  home=$(getent passwd "$ADMIN_USER" | cut -d: -f6)
  ak="$home/.ssh/authorized_keys"
  install -d -m 700 -o "$ADMIN_USER" -g "$ADMIN_USER" "$home/.ssh"
  touch "$ak"
  if [[ -n ${ADMIN_PUBKEY:-} ]]; then
    grep -qxF "$ADMIN_PUBKEY" "$ak" || echo "$ADMIN_PUBKEY" >> "$ak"
  elif [[ ! -s $ak && -s /root/.ssh/authorized_keys ]]; then
    cp /root/.ssh/authorized_keys "$ak"
    info "Ключи скопированы из /root/.ssh/authorized_keys"
  fi
  chown "$ADMIN_USER:$ADMIN_USER" "$ak"
  chmod 600 "$ak"
  grep -qE '^(ssh-|ecdsa-|sk-)' "$ak" \
    || die "У $ADMIN_USER нет SSH-ключей — после усиления sshd вы не войдёте. Задайте ADMIN_PUBKEY"

  # Пароль нужен для sudo (по SSH паролем войти будет нельзя)
  if [[ $(passwd -S "$ADMIN_USER" | awk '{print $2}') != P ]]; then
    if [[ -t 0 ]]; then
      info "Задайте пароль $ADMIN_USER для sudo:"
      passwd "$ADMIN_USER"
    else
      warn "У $ADMIN_USER нет пароля, sudo работать не будет: выполните passwd $ADMIN_USER"
    fi
  fi
}

setup_sshd() {
  log "Усиление sshd"
  # Файл должен идти по алфавиту раньше 00-netangels.conf: sshd берёт первое
  # встреченное значение, а образы NetAngels включают там вход root и пароли
  local f=/etc/ssh/sshd_config.d/00-hardening.conf
  cat > "$f" <<EOF
# setup.sh. Имя должно сортироваться раньше 00-netangels.conf (sshd берёт первое значение)
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no
PubkeyAuthentication yes
PubkeyAcceptedAlgorithms -ssh-rsa
AllowUsers ${SSH_ALLOW_USERS:-$ADMIN_USER}
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
EOF
  # При socket activation (ssh.socket) каталога может не быть, и sshd -t падает
  install -d -m 755 /run/sshd
  if ! sshd -t; then
    rm -f "$f"
    die "sshd -t не прошёл, файл $f удалён, конфиг не изменён"
  fi
  local eff
  eff=$(sshd -T)
  local want
  for want in 'permitrootlogin no' 'passwordauthentication no' 'kbdinteractiveauthentication no'; do
    grep -qx "$want" <<<"$eff" || die "После правки sshd -T не показывает '$want' — что-то перебивает настройки"
  done
  systemctl try-reload-or-restart ssh.service
  info "Готово. Не закрывайте эту сессию, пока не войдёте как $ADMIN_USER по ключу из другого терминала"
}

setup_ufw_base() {
  log "UFW: запрет входящих, SSH только из ${SSH_ALLOW_FROM}"
  ufw default deny incoming >/dev/null
  ufw default allow outgoing >/dev/null
  local net
  for net in $SSH_ALLOW_FROM; do
    ufw allow from "$net" to any port 22 proto tcp comment 'ssh' >/dev/null
  done

  # Чистая ВМ: заходим ещё по белому IP, а не через VPN. Чтобы не отрезать себя,
  # временно разрешаем адреса текущих SSH-сессий; убрать — setup.sh finish
  local peer
  while read -r peer; do
    [[ -z $peer ]] && continue
    # shellcheck disable=SC2086
    ip_in_nets "$peer" $SSH_ALLOW_FROM && continue
    ufw allow from "$peer" to any port 22 proto tcp comment 'bootstrap-temp' >/dev/null
    warn "Временно разрешил SSH с $peer (текущая сессия). Уберите после проверки VPN: sudo ./setup.sh finish"
  done < <(ss -tnH state established '( sport = :22 )' \
             | awk '{print $4}' | sed -E 's/:[0-9]+$//; s/^\[//; s/\]$//; s/^::ffff://' | sort -u)
}

ufw_enable() {
  ufw --force enable >/dev/null
  ufw reload >/dev/null
  ufw status verbose
}

remove_bootstrap_rules() {
  log "Удаляю временные правила SSH (bootstrap-temp)"
  local n removed=0
  while n=$(ufw status numbered | awk -F'[][]' '/bootstrap-temp/ {gsub(/ /, "", $2); print $2; exit}'); [[ -n $n ]]; do
    ufw --force delete "$n" >/dev/null
    removed=$((removed + 1))
  done
  info "Удалено правил: $removed"
  ufw status verbose
}

summary() {
  log "Итог"
  sshd -T | grep -Ei '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|allowusers|pubkeyacceptedalgorithms) '
  echo
  if [[ -f /var/run/reboot-required ]]; then
    warn "Нужна перезагрузка (обновилось ядро или системные библиотеки)"
  fi
  needrestart -r l -q 2>/dev/null || true
}
