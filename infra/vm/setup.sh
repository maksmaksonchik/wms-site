#!/usr/bin/env bash
# Настройка чистой ВМ Ubuntu 24.04 под одну из ролей.
#   sudo ./setup.sh vpn      — WireGuard-шлюз во внутреннюю сеть
#   sudo ./setup.sh app      — ВМ с сайтом (Docker)
#   sudo ./setup.sh finish   — убрать временный доступ по SSH с белого IP
# Флаг -y отвечает «да» на вопросы. Настройки — в vm.env рядом.
# Повторный запуск безопасен: шаги идемпотентны.
# Запуск через sh (dash) ломается на bash-синтаксисе: перезапускаемся в bash
if [ -z "${BASH_VERSION:-}" ]; then exec bash "$0" "$@"; fi
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ASSUME_YES=0
ROLE=""
for arg in "$@"; do
  case $arg in
    -y|--yes) ASSUME_YES=1 ;;
    vpn|app|finish) ROLE=$arg ;;
    *) echo "Использование: sudo $0 [-y] vpn|app|finish" >&2; exit 2 ;;
  esac
done
[[ -n $ROLE ]] || { echo "Использование: sudo $0 [-y] vpn|app|finish" >&2; exit 2; }

# shellcheck source=lib/common.sh
. "$SCRIPT_DIR/lib/common.sh"
# shellcheck source=lib/vpn.sh
. "$SCRIPT_DIR/lib/vpn.sh"
# shellcheck source=lib/app.sh
. "$SCRIPT_DIR/lib/app.sh"

preflight

if [[ $ROLE == finish ]]; then
  remove_bootstrap_rules
  exit 0
fi

setup_packages
setup_system
setup_unattended
setup_admin_user
setup_sshd
setup_ufw_base
case $ROLE in
  vpn) role_vpn ;;
  app) role_app ;;
esac
summary
