#!/usr/bin/env python3
"""Управление клиентами WireGuard на шлюзе. Запускается через wg-peer.sh.

Источник правды — /etc/wireguard/<WG_IF>.conf. Любое изменение:
  1) сохраняет копию конфига в /etc/wireguard/backup/,
  2) атомарно переписывает конфиг (права 600),
  3) применяет его к живому интерфейсу через `wg syncconf` — без перезапуска,
     уже подключённые клиенты не отваливаются, а удалённые отключаются сразу.
"""
import argparse
import datetime as dt
import ipaddress
import os
import re
import subprocess
import sys
import tempfile
import time

WG_IF = os.environ.get("WG_IF") or "bay_srv"
CONF = f"/etc/wireguard/{WG_IF}.conf"
BACKUP_DIR = "/etc/wireguard/backup"
OUT_DIR = os.environ.get("WG_CLIENTS_DIR") or "/root/wg-clients"
NET = ipaddress.ip_network(os.environ.get("VPN_NET") or "10.161.0.0/24")


def default_allowed_ips():
    if os.environ.get("WG_CLIENT_ALLOWED_IPS"):
        return os.environ["WG_CLIENT_ALLOWED_IPS"]
    nets = [str(NET)]
    if os.environ.get("LAN_NET"):
        nets.append(os.environ["LAN_NET"])
    if os.environ.get("APP_PUBLIC_IP"):
        nets.append(os.environ["APP_PUBLIC_IP"] + "/32")
    return ", ".join(nets)


def sh(*args, inp=None):
    return subprocess.run(args, input=inp, capture_output=True, text=True, check=True).stdout.strip()


def die(msg):
    print(f"[x] {msg}", file=sys.stderr)
    sys.exit(1)


# --- разбор конфига ---------------------------------------------------------

KV = re.compile(r"^\s*([A-Za-z]+)\s*=\s*(.*?)\s*$")
NAME = re.compile(r"^\s*#\s*name\s*=\s*(.*?)\s*$")


class Section:
    def __init__(self, header):
        self.header = header
        self.lines = []

    def get(self, key):
        for line in self.lines:
            m = KV.match(line)
            if m and m.group(1).lower() == key.lower():
                return m.group(2)
        return None

    def set(self, key, value):
        for i, line in enumerate(self.lines):
            m = KV.match(line)
            if m and m.group(1).lower() == key.lower():
                self.lines[i] = f"{key} = {value}"
                return
        self.lines.append(f"{key} = {value}")

    @property
    def name(self):
        for line in self.lines:
            m = NAME.match(line)
            if m:
                return m.group(1)
        return ""

    @name.setter
    def name(self, value):
        self.lines = [line for line in self.lines if not NAME.match(line)]
        self.lines.insert(0, f"# name = {value}")

    @property
    def ip(self):
        allowed = self.get("AllowedIPs") or ""
        first = allowed.split(",")[0].strip()
        return first.split("/")[0] if first else ""

    @property
    def label(self):
        return self.name or f"peer-{self.ip.split('.')[-1]}"


def load():
    if not os.path.exists(CONF):
        die(f"Нет {CONF}. Имя интерфейса задаётся WG_IF в vm.env")
    sections, head = [], []
    with open(CONF) as f:
        for raw in f.read().splitlines():
            if raw.strip().startswith("["):
                sections.append(Section(raw.strip()))
            elif sections:
                sections[-1].lines.append(raw)
            else:
                head.append(raw)
    for s in sections:
        while s.lines and not s.lines[-1].strip():
            s.lines.pop()
    iface = [s for s in sections if s.header.lower() == "[interface]"]
    if len(iface) != 1:
        die(f"В {CONF} должна быть ровно одна секция [Interface]")
    return head, iface[0], [s for s in sections if s.header.lower() == "[peer]"]


def save(head, iface, peers, reason):
    os.makedirs(BACKUP_DIR, mode=0o700, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    backup = f"{BACKUP_DIR}/{WG_IF}.conf.{stamp}"
    with open(CONF) as src, open(os.open(backup, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), "w") as dst:
        dst.write(src.read())

    parts = []
    if any(line.strip() for line in head):
        parts.append("\n".join(head).strip())
    for s in [iface, *peers]:
        parts.append("\n".join([s.header, *s.lines]))
    text = "\n\n".join(parts) + "\n"

    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(CONF), prefix=f".{WG_IF}.")
    with os.fdopen(fd, "w") as f:
        f.write(text)
    os.chmod(tmp, 0o600)
    os.replace(tmp, CONF)
    os.chmod(CONF, 0o600)
    print(f"    {reason}. Копия прежнего конфига: {backup}")
    apply_live()


def apply_live():
    if subprocess.run(["wg", "show", WG_IF], capture_output=True).returncode != 0:
        print(f"[!] Интерфейс {WG_IF} не поднят — изменения применятся при старте wg-quick@{WG_IF}")
        return
    stripped = sh("wg-quick", "strip", WG_IF)
    fd, tmp = tempfile.mkstemp(prefix="wg-strip.")
    try:
        with os.fdopen(fd, "w") as f:
            f.write(stripped + "\n")
        sh("wg", "syncconf", WG_IF, tmp)
    finally:
        os.unlink(tmp)
    print(f"    Применено к {WG_IF} на лету (wg syncconf)")


# --- помощники --------------------------------------------------------------

def handshakes():
    try:
        out = sh("wg", "show", WG_IF, "latest-handshakes")
    except subprocess.CalledProcessError:
        return {}
    result = {}
    for line in out.splitlines():
        pub, ts = line.split("\t")
        result[pub] = int(ts)
    return result


def ago(ts):
    if not ts:
        return "не подключался"
    sec = int(time.time()) - ts
    for unit, size in (("д", 86400), ("ч", 3600), ("мин", 60)):
        if sec >= size:
            return f"{sec // size} {unit} назад"
    return f"{sec} с назад"


def resolve(peers, ident):
    """Клиент по имени, IP, последнему октету (100) или публичному ключу."""
    if ident.isdigit():
        ident = str(NET.network_address + int(ident))
    found = [p for p in peers if ident in (p.name, p.ip, p.get("PublicKey"))]
    if not found:
        die(f"Не нашёл клиента «{ident}» (wg-peer.sh list покажет всех)")
    if len(found) > 1:
        die(f"«{ident}» подходит под нескольких клиентов — укажите IP")
    return found[0]


def confirm(question, assume_yes):
    if assume_yes:
        return True
    try:
        return input(f"{question} [y/N] ").strip().lower().startswith(("y", "д"))
    except EOFError:
        return False


def server_ip(iface):
    addr = (iface.get("Address") or "").split(",")[0].strip()
    return addr.split("/")[0] if addr else str(next(NET.hosts()))


def endpoint(iface):
    host = os.environ.get("VPN_PUBLIC_IP") or sh("sh", "-c", "ip -4 route get 1.1.1.1 | sed -n 's/.* src \\([0-9.]*\\).*/\\1/p'")
    port = iface.get("ListenPort") or "51820"
    return f"{host}:{port}"


def new_keys():
    priv = sh("wg", "genkey")
    return priv, sh("wg", "pubkey", inp=priv), sh("wg", "genpsk")


def write_client(iface, peer, priv, psk, full_tunnel):
    allowed = "0.0.0.0/0" if full_tunnel else default_allowed_ips()
    lines = ["[Interface]", f"PrivateKey = {priv}", f"Address = {peer.ip}/{NET.prefixlen}"]
    dns = os.environ.get("WG_CLIENT_DNS") or ("1.1.1.1" if full_tunnel else "")
    if dns:
        lines.append(f"DNS = {dns}")
    lines += [
        "",
        "[Peer]",
        f"PublicKey = {sh('wg', 'pubkey', inp=iface.get('PrivateKey'))}",
        f"PresharedKey = {psk}",
        f"Endpoint = {endpoint(iface)}",
        f"AllowedIPs = {allowed}",
        "PersistentKeepalive = 25",
    ]
    os.makedirs(OUT_DIR, mode=0o700, exist_ok=True)
    path = f"{OUT_DIR}/{peer.label}.conf"
    with open(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"\nКлиентский конфиг: {path}")
    if subprocess.run(["sh", "-c", "command -v qrencode"], capture_output=True).returncode == 0:
        subprocess.run(["qrencode", "-t", "ansiutf8", "-r", path])
    print("Передайте его по защищённому каналу и удалите с сервера: shred -u " + path)


# --- команды ----------------------------------------------------------------

def cmd_list(args):
    _, iface, peers = load()
    hs = handshakes()
    print(f"Интерфейс {WG_IF}, сервер {server_ip(iface)}, клиентов: {len(peers)}\n")
    print(f"{'IP':<15} {'имя':<20} {'последнее подключение':<22} ключ")
    rows = sorted(peers, key=lambda p: ipaddress.ip_address(p.ip) if p.ip else ipaddress.ip_address("0.0.0.0"))
    for p in rows:
        ts = hs.get(p.get("PublicKey"), 0)
        if args.active and not ts:
            continue
        print(f"{p.ip:<15} {p.name or '—':<20} {ago(ts):<22} {(p.get('PublicKey') or '')[:10]}…")
    if not args.active:
        print("\nВремя подключения — с последнего старта интерфейса (после перезагрузки обнуляется)")


def cmd_add(args):
    head, iface, peers = load()
    if any(p.name == args.name for p in peers):
        die(f"Клиент «{args.name}» уже есть. Новые ключи для него — rotate {args.name}")
    used = {p.ip for p in peers} | {server_ip(iface)}
    free = next((str(h) for h in NET.hosts() if str(h) not in used), None)
    if not free:
        die(f"В {NET} не осталось свободных адресов")
    priv, pub, psk = new_keys()
    peer = Section("[Peer]")
    peer.lines = [
        f"# name = {args.name}",
        f"# added = {dt.date.today()}",
        f"PublicKey = {pub}",
        f"PresharedKey = {psk}",
        f"AllowedIPs = {free}/32",
    ]
    save(head, iface, [*peers, peer], f"Добавлен {args.name} ({free})")
    write_client(iface, peer, priv, psk, args.full_tunnel)


def cmd_rotate(args):
    head, iface, peers = load()
    peer = resolve(peers, args.id)
    if args.name:
        peer.name = args.name
    priv, pub, psk = new_keys()
    peer.set("PublicKey", pub)
    peer.set("PresharedKey", psk)
    peer.lines = [line for line in peer.lines if not line.strip().startswith("# rotated")]
    peer.lines.append(f"# rotated = {dt.date.today()}")
    save(head, iface, peers, f"Новые ключи для {peer.label} ({peer.ip}); старый конфиг больше не подключится")
    write_client(iface, peer, priv, psk, args.full_tunnel)


def cmd_remove(args):
    head, iface, peers = load()
    victims = {id(resolve(peers, i)) for i in args.ids}
    gone = [p for p in peers if id(p) in victims]
    for p in gone:
        print(f"    удалить: {p.ip} {p.name}")
    if not confirm(f"Отключить и удалить {len(gone)}?", args.yes):
        die("Отменено")
    save(head, iface, [p for p in peers if id(p) not in victims], f"Удалено клиентов: {len(gone)}")


def cmd_keep(args):
    head, iface, peers = load()
    keep = {id(resolve(peers, i)) for i in args.ids}
    kept = [p for p in peers if id(p) in keep]
    for p in kept:
        print(f"    оставить: {p.ip} {p.name}")
    if not confirm(f"Оставить {len(kept)}, удалить остальных {len(peers) - len(kept)}?", args.yes):
        die("Отменено")
    save(head, iface, kept, f"Оставлено {len(kept)}, удалено {len(peers) - len(kept)}")


def cmd_label(args):
    head, iface, peers = load()
    peer = resolve(peers, args.id)
    if any(p.name == args.name and p is not peer for p in peers):
        die(f"Имя «{args.name}» уже занято")
    peer.name = args.name
    save(head, iface, peers, f"{peer.ip} теперь называется {args.name}")


def main():
    if os.geteuid() != 0:
        die("Нужен root: sudo ./wg-peer.sh ...")
    ap = argparse.ArgumentParser(prog="wg-peer.sh", description=f"Клиенты WireGuard в {CONF}")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("list", help="все клиенты и время последнего подключения")
    p.add_argument("--active", action="store_true", help="только подключавшиеся")
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("add", help="выдать новый конфиг")
    p.add_argument("name")
    p.add_argument("--full-tunnel", action="store_true", help="весь трафик клиента через VPN")
    p.set_defaults(func=cmd_add)

    p = sub.add_parser("rotate", help="новые ключи тому же клиенту (адрес сохраняется, старый конфиг перестаёт работать)")
    p.add_argument("id", help="имя, IP, последний октет или публичный ключ")
    p.add_argument("--name", help="заодно задать имя")
    p.add_argument("--full-tunnel", action="store_true")
    p.set_defaults(func=cmd_rotate)

    p = sub.add_parser("remove", help="отключить и удалить клиентов")
    p.add_argument("ids", nargs="+")
    p.add_argument("-y", "--yes", action="store_true")
    p.set_defaults(func=cmd_remove)

    p = sub.add_parser("keep", help="оставить только перечисленных, остальных удалить")
    p.add_argument("ids", nargs="+")
    p.add_argument("-y", "--yes", action="store_true")
    p.set_defaults(func=cmd_keep)

    p = sub.add_parser("label", help="дать клиенту имя")
    p.add_argument("id")
    p.add_argument("name")
    p.set_defaults(func=cmd_label)

    args = ap.parse_args()
    try:
        args.func(args)
    except subprocess.CalledProcessError as e:
        die(f"{' '.join(e.cmd)}: {e.stderr.strip()}")


if __name__ == "__main__":
    main()
