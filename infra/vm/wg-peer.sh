#!/usr/bin/env bash
# Клиенты WireGuard на шлюзе: выдать, перевыпустить, отозвать.
#   sudo ./wg-peer.sh list [--active]
#   sudo ./wg-peer.sh add <имя> [--full-tunnel]
#   sudo ./wg-peer.sh rotate <имя|IP|октет> [--name <имя>]
#   sudo ./wg-peer.sh remove <имя|IP|октет>...
#   sudo ./wg-peer.sh keep <имя|IP|октет>...     # всех остальных удалить
#   sudo ./wg-peer.sh label <имя|IP|октет> <имя>
# Настройки (WG_IF, VPN_NET, WG_CLIENT_ALLOWED_IPS, ...) берутся из vm.env, если он есть.
if [ -z "${BASH_VERSION:-}" ]; then exec bash "$0" "$@"; fi
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
if [[ -f $SCRIPT_DIR/vm.env ]]; then
  set -a
  # shellcheck source=vm.env.example
  . "$SCRIPT_DIR/vm.env"
  set +a
fi
exec python3 "$SCRIPT_DIR/lib/wg_peer.py" "$@"
