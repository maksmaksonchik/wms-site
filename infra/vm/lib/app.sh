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
  4. npm run prod
EOF
}
