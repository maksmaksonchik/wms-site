# shellcheck shell=bash
# Роль vpn: WireGuard-шлюз в локальную сеть ВМ. Подключается из setup.sh.

wg_generate() {
  local conf=$1 out=/root/wg-clients
  local endpoint=${VPN_PUBLIC_IP:-$(ip -4 -o addr show dev "$PUB_IF" | awk '{print $4}' | cut -d/ -f1 | head -1)}
  [[ -n $endpoint ]] || die "Не определил публичный IP шлюза, задайте VPN_PUBLIC_IP"

  # Первый адрес сети — сервер, следующие WG_CLIENTS — клиенты
  local prefix hosts
  prefix=${VPN_NET#*/}
  mapfile -t hosts < <(python3 -c '
import ipaddress, sys
n = ipaddress.ip_network(sys.argv[1])
print(*list(n.hosts())[: int(sys.argv[2]) + 1], sep="\n")' "$VPN_NET" "${WG_CLIENTS:-5}")

  umask 077
  install -d -m 700 "$out"
  local srv_priv srv_pub
  srv_priv=$(wg genkey)
  srv_pub=$(wg pubkey <<<"$srv_priv")

  cat > "$conf" <<EOF
[Interface]
Address = ${hosts[0]}/$prefix
ListenPort = $WG_PORT
PrivateKey = $srv_priv
# Маскарадинг как в wg_deploy: на других ВМ клиенты видны с LAN-адреса шлюза
PostUp = iptables -t nat -A POSTROUTING -s $VPN_NET -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s $VPN_NET -j MASQUERADE
EOF

  local i cli_priv cli_pub
  for ((i = 1; i < ${#hosts[@]}; i++)); do
    cli_priv=$(wg genkey)
    cli_pub=$(wg pubkey <<<"$cli_priv")
    printf '\n[Peer]\n# name = client-%d\nPublicKey = %s\nAllowedIPs = %s/32\n' "$i" "$cli_pub" "${hosts[i]}" >> "$conf"
    {
      printf '[Interface]\nPrivateKey = %s\nAddress = %s/%s\n' "$cli_priv" "${hosts[i]}" "$prefix"
      [[ -n ${WG_CLIENT_DNS:-} ]] && printf 'DNS = %s\n' "$WG_CLIENT_DNS"
      printf '\n[Peer]\nPublicKey = %s\nEndpoint = %s:%s\nAllowedIPs = %s\nPersistentKeepalive = 25\n' \
        "$srv_pub" "$endpoint" "$WG_PORT" "${WG_CLIENT_ALLOWED_IPS:-$VPN_NET, $LAN_NET}"
    } > "$out/client-$i.conf"
  done
  umask 022
  info "Сгенерировано клиентов: $(( ${#hosts[@]} - 1 )), конфиги в $out"
  info "Раздайте их и удалите с сервера: приватным ключам клиентов на шлюзе не место"
}

# Правила пересылки в /etc/ufw/before.rules между маркерами, чтобы повторный
# запуск заменял блок, а не дублировал его
ufw_forward_block() {
  local f=/etc/ufw/before.rules
  local begin='# BEGIN zmsh-vpn-forward' end='# END zmsh-vpn-forward'
  local block
  block="$begin (setup.sh, руками не править: перезапишется)
# MTU у некоторых провайдеров: подрезаем MSS на SYN, иначе виснут большие ответы
-A ufw-before-forward -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu"
  [[ -n ${LAN_IF:-} ]] && block+="
-A ufw-before-forward -i $WG_IF -o $LAN_IF -j ACCEPT"
  case ${WG_FORWARD_TO_INTERNET:-all} in
    all)  block+="
-A ufw-before-forward -i $WG_IF -o $PUB_IF -j ACCEPT" ;;
    app)  block+="
-A ufw-before-forward -i $WG_IF -o $PUB_IF -d ${APP_PUBLIC_IP:?нужен для WG_FORWARD_TO_INTERNET=app} -j ACCEPT" ;;
    none) ;;
    *)    die "WG_FORWARD_TO_INTERNET: ожидается all, app или none" ;;
  esac
  # Обратный трафик пропускает стандартное правило RELATED,ESTABLISHED из before.rules
  block+="
$end"

  if grep -qE "^-A ufw-before-forward -i $WG_IF " <(sed "/^$begin/,/^$end\$/d" "$f"); then
    warn "В $f уже есть ручные правила для $WG_IF вне блока setup.sh — проверьте, не дублируются ли"
  fi

  local tmp
  tmp=$(mktemp)
  # Блок вставляется перед COMMIT именно секции *filter
  sed "/^$begin/,/^$end\$/d" "$f" \
    | BLOCK="$block" awk '/^\*filter/ {inf = 1} inf && !done && /^COMMIT/ {print ENVIRON["BLOCK"]; done = 1} {print}' \
    > "$tmp"
  if ! cmp -s "$tmp" "$f"; then
    cp -a "$f" "$f.bak-$(date +%Y%m%d-%H%M%S)"
    cat "$tmp" > "$f"
    info "Обновлён $f (резервная копия рядом)"
  fi
  rm -f "$tmp"
}

role_vpn() {
  : "${WG_IF:?}" "${WG_PORT:?}"
  log "WireGuard"
  apt-get -y -q install wireguard-tools

  local conf=/etc/wireguard/$WG_IF.conf
  if [[ -f $conf ]]; then
    info "$conf уже есть — не трогаю"
  elif [[ -n ${WG_RESTORE_CONF:-} ]]; then
    [[ -f $WG_RESTORE_CONF ]] || die "Нет файла $WG_RESTORE_CONF"
    install -m 600 "$WG_RESTORE_CONF" "$conf"
    info "Восстановлен конфиг со старого сервера: клиентам нужно сменить только Endpoint"
  else
    wg_generate "$conf"
  fi
  chmod 600 "$conf"

  # Порт берём из самого конфига: при восстановлении он мог отличаться
  local port
  port=$(awk -F' *= *' '/^ListenPort/ {print $2; exit}' "$conf")
  WG_PORT=${port:-$WG_PORT}

  log "Форвардинг и UFW"
  echo 'net.ipv4.ip_forward = 1' > /etc/sysctl.d/91-zmsh-forward.conf
  sysctl --system >/dev/null
  # Без этого правила после ufw enable пропадает и VPN, и доступ (было однажды)
  ufw allow "$WG_PORT/udp" comment 'wireguard' >/dev/null
  ufw_forward_block
  ufw_enable

  systemctl enable "wg-quick@$WG_IF" >/dev/null
  systemctl restart "wg-quick@$WG_IF"
  wg show "$WG_IF" | head -5
}
