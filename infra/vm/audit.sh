#!/usr/bin/env bash
# Снимок текущей настройки ВМ: только чтение, ничего не меняет.
# Нужен, чтобы сверить живые машины с setup.sh перед переездом.
#   sudo ./audit.sh > audit-$(hostname).txt
# Приватные ключи WireGuard в вывод не попадают.
# Запуск через sh (dash) ломается на bash-синтаксисе: перезапускаемся в bash
if [ -z "${BASH_VERSION:-}" ]; then exec bash "$0" "$@"; fi
set -uo pipefail

[[ $EUID -eq 0 ]] || { echo "Запускайте от root: sudo $0" >&2; exit 1; }

section() { printf '\n===== %s =====\n' "$*"; }
run() { printf '$ %s\n' "$*"; "$@" 2>&1; }

section "Система"
run hostnamectl
run uptime
grep -E '^(PRETTY_NAME|VERSION_ID)=' /etc/os-release
run uname -r
run timedatectl show -p Timezone
run df -h /
run free -h
run swapon --show
[[ -f /var/run/reboot-required ]] && echo "!!! нужна перезагрузка: $(tr '\n' ' ' < /var/run/reboot-required.pkgs 2>/dev/null)"

section "Сеть"
run ip -br addr
run ip -4 route
run ss -tulnpH

section "sysctl"
sysctl net.ipv4.ip_forward net.ipv4.tcp_syncookies net.ipv4.conf.all.rp_filter \
  net.ipv4.conf.all.accept_redirects net.ipv4.conf.all.send_redirects vm.swappiness 2>&1
run grep -rHv -e '^#' -e '^$' /etc/sysctl.conf /etc/sysctl.d/ /etc/ufw/sysctl.conf

section "sshd"
install -d -m 755 /run/sshd 2>/dev/null
run sshd -t
sshd -T 2>/dev/null | grep -Ei '^(port|listenaddress|permitrootlogin|passwordauthentication|kbdinteractiveauthentication|pubkeyauthentication|pubkeyacceptedalgorithms|allowusers|maxauthtries|x11forwarding) '
run ls -l /etc/ssh/sshd_config.d/
for f in /etc/ssh/sshd_config.d/*.conf; do [[ -f $f ]] && { echo "--- $f"; grep -v '^#' "$f" | grep -v '^$'; }; done
run systemctl is-active ssh.socket ssh.service

section "Пользователи с shell и sudo"
awk -F: '$7 !~ /(nologin|false)$/ {print $1, $6, $7}' /etc/passwd
run getent group sudo docker
for h in /root /home/*; do
  [[ -f $h/.ssh/authorized_keys ]] && echo "$h: $(awk '{print $1}' "$h/.ssh/authorized_keys" | sort | uniq -c | tr '\n' ' ')"
done

section "UFW"
run ufw status verbose
grep -E '^(DEFAULT_FORWARD_POLICY|IPV6)=' /etc/default/ufw
echo "--- нестандартное в /etc/ufw/before.rules (forward, nat, wg):"
grep -nE 'ufw-before-forward -i|ufw-before-forward -o|^\*nat|POSTROUTING|MASQUERADE|TCPMSS|wg|bay_srv' /etc/ufw/before.rules
echo "--- отличия before.rules от шаблона пакета (/usr/share/ufw/before.rules):"
diff -u /usr/share/ufw/before.rules /etc/ufw/before.rules && echo "нет отличий"

section "iptables"
run iptables -S FORWARD
run iptables -S ufw-before-forward
run iptables -t nat -S POSTROUTING
if docker inspect wms_fail2ban >/dev/null 2>&1; then
  run iptables -S DOCKER-USER
  # Цепочка появляется только при первом бане — её отсутствие нормально
  run iptables -S f2b-nginx-flood
  echo "--- fail2ban изнутри контейнера (там может быть другой бэкенд iptables)"
  run docker exec wms_fail2ban fail2ban-client status nginx-flood
  run docker exec wms_fail2ban iptables -V
  run docker exec wms_fail2ban iptables -S DOCKER-USER
  run docker exec wms_fail2ban sh -c 'iptables-legacy -S DOCKER-USER 2>&1; iptables-nft -S DOCKER-USER 2>&1'
  run docker logs --since 24h wms_fail2ban 2>&1 | grep -Ei 'error|ban ' | tail -20
fi

section "WireGuard"
run ls -l /etc/wireguard/
for f in /etc/wireguard/*.conf; do
  [[ -f $f ]] || continue
  echo "--- $f (без ключей)"
  grep -vE '^(PrivateKey|PresharedKey)' "$f" | awk '/^\[Peer\]/ {peers++; next} peers == 0 {print}'
  echo "Peer-ов в конфиге: $(grep -c '^\[Peer\]' "$f")"
done
run systemctl list-units --all --no-legend 'wg-quick@*'
# wg show не печатает приватный ключ сервера
wg show 2>/dev/null | grep -E '^(interface|  listening port|peer|  allowed ips|  latest handshake)' | head -40
echo "Peer-ов с рукопожатием: $(wg show all latest-handshakes 2>/dev/null | awk '$3 > 0' | wc -l)"
echo "--- клиентские конфиги wg_deploy с приватными ключами на сервере:"
find / -xdev -name 'bay_clt_*.conf' -printf '%h\n' 2>/dev/null | sort | uniq -c

section "Docker"
if command -v docker >/dev/null; then
  run docker --version
  run docker compose version
  run cat /etc/docker/daemon.json
  docker ps --format '{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
  run docker system df
else
  echo "не установлен"
fi

section "Бэкапы"
run systemctl list-timers --all --no-pager 'wms-backup*'
for u in wms-backup wms-backup-pull; do
  systemctl cat "$u.service" >/dev/null 2>&1 || continue
  run systemctl show -p Result -p ExecMainExitTimestamp "$u.service"
  journalctl -u "$u.service" -n 5 --no-pager 2>&1
done
d=/var/backups/wms-site
if [[ -d $d ]]; then
  echo "--- $d: $(find "$d" -mindepth 1 -maxdepth 1 -type d ! -name '*.partial' | wc -l) копий, $(du -sh "$d" | cut -f1)"
  find "$d" -mindepth 1 -maxdepth 1 -type d -printf '%TY-%Tm-%Td %TH:%TM  %f\n' | sort | tail -3
fi
[[ -f /var/lib/wms-backup-pull/.ssh/authorized_keys ]] && \
  echo "--- ключ шлюза для бэкапов: $(awk '{print $NF}' /var/lib/wms-backup-pull/.ssh/authorized_keys)"

section "Автодеплой"
if systemctl cat wms-autodeploy.service >/dev/null 2>&1; then
  run systemctl is-enabled wms-autodeploy.timer
  run systemctl show -p Result -p ExecMainExitTimestamp wms-autodeploy.service
  journalctl -u wms-autodeploy.service -n 8 --no-pager -o short-iso 2>&1
  [[ -f /var/lib/wms-autodeploy/failed ]] && echo "--- не задеплоился: $(cat /var/lib/wms-autodeploy/failed)"
else
  echo "не настроен (sudo ./setup.sh autodeploy)"
fi

section "Обновления и журнал"
run systemctl is-enabled unattended-upgrades
run cat /etc/apt/apt.conf.d/20auto-upgrades
run grep -rh -v '^#' /etc/systemd/journald.conf.d/
run journalctl --disk-usage

section "Входы по SSH за 30 дней (password/keyboard-interactive)"
journalctl -u ssh --since -30d --no-pager 2>/dev/null | grep -E 'Accepted (password|keyboard-interactive)' | tail -20
echo "(пусто — хорошо)"
