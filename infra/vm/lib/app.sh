# shellcheck shell=bash
# Роль app: ВМ с сайтом (Docker Compose из этого репозитория). Подключается из setup.sh.

install_docker() {
  if command -v docker >/dev/null && docker compose version >/dev/null 2>&1; then
    info "Docker уже установлен: $(docker --version)"
    return
  fi
  # Официальный репозиторий Docker: https://docs.docker.com/engine/install/ubuntu/
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  # shellcheck disable=SC1091
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get -y -q install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

setup_docker_daemon() {
  local f=/etc/docker/daemon.json
  local want='{
  "log-driver": "local",
  "log-opts": { "max-size": "10m", "max-file": "5" }
}'
  if [[ -f $f ]] && ! cmp -s <(echo "$want") "$f"; then
    warn "$f уже существует и отличается — не трогаю. Нужно: log-driver local"
    return
  fi
  install -d /etc/docker
  echo "$want" > "$f"
  systemctl restart docker
}

# Лимит одновременных TCP-соединений с одного IP к сайту и порт Netdata для LAN.
# nginx не видит соединение, пока клиент не прислал заголовки, поэтому медленных
# клиентов (slowloris) режем ещё в ядре: правило в DOCKER-USER (через неё идёт трафик
# к опубликованным портам контейнеров, UFW его не видит). Правило ставит служба
# zmsh-connlimit после каждого запуска docker
setup_app_firewall() {
  log "Лимит соединений с одного IP (${CONNLIMIT_PER_IP:-256}) и доступ к Netdata из LAN"
  command -v docker >/dev/null || die "Нет docker — сначала sudo ./setup.sh app"

  cat > /etc/default/zmsh-connlimit <<EOF
# setup.sh: настройки службы zmsh-connlimit. После правки: systemctl restart zmsh-connlimit
# Браузер держит 1–6 соединений, у школы за NAT — десятки; k6 — по одному на VU
CONNLIMIT=${CONNLIMIT_PER_IP:-256}
PUB_IF=$PUB_IF
EOF

  cat > /usr/local/sbin/zmsh-connlimit <<'EOF'
#!/bin/sh
# setup.sh: не больше $CONNLIMIT одновременных TCP-соединений с одного IP к 80/443
set -eu
: "${CONNLIMIT:?}" "${PUB_IF:?}"
rule() {
  iptables "$1" DOCKER-USER -i "$PUB_IF" -p tcp --syn -m multiport --dports 80,443 \
    -m connlimit --connlimit-above "$CONNLIMIT" --connlimit-mask 32 \
    -m comment --comment zmsh-connlimit -j REJECT --reject-with tcp-reset
}
# Удаляем все наши правила (в том числе со старым лимитом) по комментарию
clear_rules() {
  iptables -S DOCKER-USER | grep -- '--comment zmsh-connlimit' | sed 's/^-A /-D /' |
    while read -r r; do eval "iptables $r"; done
}
case ${1:-} in
  start) clear_rules; rule -I ;;
  stop)  clear_rules ;;
  *) echo "Использование: $0 start|stop" >&2; exit 2 ;;
esac
EOF
  chmod 755 /usr/local/sbin/zmsh-connlimit

  cat > /etc/systemd/system/zmsh-connlimit.service <<'EOF'
# setup.sh. Цепочку DOCKER-USER создаёт docker, поэтому запускаемся после него
# и перезапускаемся вместе с ним (PartOf)
[Unit]
Description=ZMSH: limit concurrent TCP connections per IP to the site
After=docker.service
PartOf=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
EnvironmentFile=/etc/default/zmsh-connlimit
ExecStart=/usr/local/sbin/zmsh-connlimit start
ExecStop=/usr/local/sbin/zmsh-connlimit stop

[Install]
WantedBy=docker.service
EOF
  systemctl daemon-reload
  systemctl enable zmsh-connlimit.service >/dev/null
  systemctl restart zmsh-connlimit.service
  iptables -S DOCKER-USER | grep zmsh-connlimit | sed 's/^/    /'

  # Netdata (docker-compose-monitoring.yml) работает в сети хоста, так что тут UFW
  # действует. VPN-клиенты приходят из LAN с адреса шлюза
  ufw allow from "$LAN_NET" to any port 19999 proto tcp comment 'netdata' >/dev/null
  info "Netdata: http://<LAN-адрес этой ВМ>:19999 (через VPN)"
}

role_app() {
  log "Docker"
  install_docker
  setup_docker_daemon
  systemctl enable --now docker >/dev/null
  # npm нужен только как запускалка сценариев из package.json (npm run prod и т.п.)
  command -v npm >/dev/null || apt-get -y -q install nodejs npm
  # Группа docker = фактически root. Удобно для npm run prod без sudo, но это осознанный выбор
  usermod -aG docker "$ADMIN_USER"

  log "UFW"
  # Docker публикует порты мимо UFW (свои правила в FORWARD/DOCKER), так что эти
  # правила скорее документация. Следствие: любой новый ports: в compose сразу
  # открыт в интернет — публикуйте служебные порты только на 127.0.0.1
  ufw allow 80/tcp comment 'http' >/dev/null
  ufw allow 443/tcp comment 'https' >/dev/null
  ufw_enable
  setup_app_firewall

  log "Репозиторий в $APP_DIR"
  if [[ -d $APP_DIR/.git ]]; then
    info "Уже склонирован — не трогаю"
  else
    install -d -o "$ADMIN_USER" -g "$ADMIN_USER" "$APP_DIR"
    sudo -u "$ADMIN_USER" git clone "$REPO_URL" "$APP_DIR"
  fi
  sudo -u "$ADMIN_USER" mkdir -p "$APP_DIR/nginx/logs" "$APP_DIR/fail2ban/db"

  cat <<EOF

Дальше вручную (см. infra/vm/README.md, раздел «Порядок переезда»):
  1. Перезайти под $ADMIN_USER, cd $APP_DIR
  2. npm run prod:restore -- --secrets ~/<каталог бэкапа>
     (без бэкапа секретов — README.md, «Если секретов нет»)
  3. В nginx/allowed-ips.conf — белый IP VPN-шлюза, иначе админка будет 403
  4. npm run prod — скачает образы из ghcr.io (если пакеты wms-site-* приватные,
     сначала docker login ghcr.io с токеном read:packages)
EOF
}
