# Настройка ВМ с нуля

Скрипты, которые повторяют ручную настройку двух ВМ NetAngels (Ubuntu 24.04)
и сразу закрывают найденные в ней дыры.

| Файл | Что делает |
|---|---|
| `setup.sh vpn` | WireGuard-шлюз: ufw, пересылка VPN → LAN, sshd, автообновления |
| `setup.sh app` | ВМ сайта: Docker из официального репозитория, `daemon.json`, ufw, клон репозитория в `/opt/wms-site` |
| `setup.sh finish` | убирает временное правило SSH с белого IP, которое ставится при первом запуске |
| `setup.sh backup` | только автоматические бэкапы на уже работающей ВМ, остальное не трогает (см. ниже) |
| `setup.sh autodeploy` | только автодеплой из `origin/main` на уже работающей ВМ сайта (таймер `wms-autodeploy`, см. [README](../../README.md#последующие-обновления-автодеплой)) |
| `backup-pull.sh` | на шлюзе: забирает бэкапы с ВМ сайта (ставится `setup.sh vpn`, см. ниже) |
| `wg-peer.sh` | на шлюзе: `list`, `add`, `rotate`, `remove`, `keep`, `label` для клиентов WireGuard, применяется на лету (см. ниже) |
| `audit.sh` | только читает: снимок текущей настройки для сверки (ключи WireGuard не печатает) |
| `vm.env.example` | все параметры; скопировать в `vm.env` (он в `.gitignore`) |

Повторный запуск безопасен: шаги идемпотентны, существующий конфиг WireGuard не перезаписывается,
`daemon.json` с чужим содержимым не трогается, блок в `before.rules` заменяется, а не дублируется.

## Что настраивается на обеих ролях

- обновление системы, `unattended-upgrades` (только security, **без** автоперезагрузки);
- пользователь `ADMIN_USER` с ключом и паролем для sudo; скрипт остановится, если ключа нет;
- `sshd_config.d/00-hardening.conf`: без root, без паролей, `AllowUsers`, без `ssh-rsa`.
  Имя сортируется раньше `00-netangels.conf`, поэтому перебивает настройки образа хостера;
  после записи скрипт проверяет итог через `sshd -T`;
- ufw: запрет входящих, SSH только из `LAN_NET` и `VPN_NET`;
- `sysctl.d/90-zmsh-hardening.conf`: syncookies, `rp_filter=2`, запрет redirects и source route;
- journald до 500 МБ, swap (по умолчанию 1 ГБ, если swap нет), часовой пояс.

## Клиенты VPN

Один человек — один конфиг с понятным именем. Источник правды — `/etc/wireguard/<WG_IF>.conf`;
`wg-peer.sh` перед каждой правкой кладёт копию в `/etc/wireguard/backup/` и применяет
изменения через `wg syncconf`: подключённые клиенты не отваливаются, удалённые теряют доступ сразу.

```bash
sudo ./wg-peer.sh list                 # кто есть и когда подключался
sudo ./wg-peer.sh add editor-ivanov    # новый клиент: ключи + PresharedKey, конфиг в /root/wg-clients/
sudo ./wg-peer.sh rotate editor-ivanov # потерял ноутбук / ушёл: новые ключи, старый конфиг мёртв
sudo ./wg-peer.sh remove editor-ivanov # доступ больше не нужен
```

Конфиг передавать по защищённому каналу (не в общий чат), после передачи — `shred -u` на сервере.
По умолчанию конфиг — split tunnel (VPN, LAN, IP сайта); `--full-tunnel` — весь трафик через шлюз.

## Порядок переезда

Главный риск — отрезать себе доступ: SSH открыт только из VPN, а VPN на новой машине ещё не поднят.
Поэтому сначала шлюз, потом сайт, и всегда с открытой VNC-консолью в панели NetAngels.

**0. На старых машинах.** Снять снимок и данные:

```bash
sudo ./infra/vm/audit.sh > audit-$(hostname).txt        # на обеих ВМ — сверить с vm.env
sudo cp /etc/wireguard/<WG_IF>.conf ~/                   # шлюз: ключи сервера, чтобы клиенты остались
cd /opt/wms-site && npm run prod:backup                  # сайт: база, загрузки, секреты одним каталогом
```

Каталог `/var/backups/wms-site/<дата>_<время>/` с ВМ сайта скопировать к себе: он понадобится на шаге 2.
В нём `secrets.tar.gz` с паролем базы и ключом TLS, поэтому только по SSH, не через общие чаты.
История бэкапов на старом шлюзе (`/var/backups/wms-site`) сама не переедет: если она нужна,
перенесите её на новый шлюз в тот же каталог (владелец `wms-backup`).

Заранее снизить TTL A-записи `zmsh.space` в reg.ru (например до 300), чтобы переключение DNS было быстрым.

**1. Новый шлюз.** Создать ВМ, включить её в локальную сеть в панели, зайти по белому IP:

```bash
git clone https://github.com/maksmaksonchik/wms-site.git && cd wms-site/infra/vm
cp vm.env.example vm.env && nano vm.env      # WG_IF и WG_RESTORE_CONF — по audit
sudo ./setup.sh vpn
```

В конце `setup.sh vpn` печатает строку `BACKUP_PULL_PUBKEY="ssh-ed25519 …"` — сохранить её для шага 2.

Клиентам заменить `Endpoint` на новый IP, подключиться, проверить `ssh <user>@192.168.0.2`.
Потом `sudo ./setup.sh finish`.

**2. Новая ВМ сайта.** Зайти на неё уже через VPN (`ssh <user>@<её LAN-адрес>`), вписать в `vm.env`
строку `BACKUP_PULL_PUBKEY` с шага 1 и запустить `sudo ./setup.sh app`. Перезайти (группа docker)
и восстановить данные из каталога с шага 0:

```bash
cd /opt/wms-site
npm run prod:restore -- --secrets ~/<дата>_<время>   # секреты, база, загрузки; проверяет суммы
nano nginx/allowed-ips.conf                           # белый IP старого шлюза → новый, иначе админка 403
npm run prod
```

Что делает `restore.sh` и что делать, если секретов нет, — в [README](../../README.md#бэкап-и-восстановление).

Если на сайт пришлось заходить по белому IP — потом `sudo ./setup.sh finish`.

**3. DNS.** Сменить A-запись, дождаться, проверить сайт и админку через VPN.
Если `certbot/conf` не переносили — `npm run acme-challenge` уже после смены DNS.

**4. Бэкапы.** На сайте `sudo systemctl start wms-backup`, на шлюзе `sudo systemctl start wms-backup-pull`,
затем `journalctl -u wms-backup-pull -n 20`: должно быть «Последний бэкап: …». Если новой стала
только ВМ сайта, а шлюз старый, у сайта новый ключ хоста, и шлюз откажется подключаться:
`sudo -u wms-backup ssh-keygen -R 192.168.0.1`.

## Автоматические бэкапы

| Где | Что | Когда |
|---|---|---|
| ВМ сайта | `wms-backup.timer` → `scripts/backup.sh` от `ADMIN_USER`, копии в `/var/backups/wms-site` | 02:30 (Екб) |
| Шлюз | `wms-backup-pull.timer` → `/usr/local/sbin/wms-backup-pull` от `wms-backup`, копии в `/var/backups/wms-site` | 03:30 (Екб) |

Оба места хранят копии `BACKUP_KEEP_DAYS` дней (14), но последние `BACKUP_MIN_KEEP` (3) не удаляются
никогда: если бэкапы перестанут делаться, старые копии не исчезнут вслед за сроком хранения.
Пропущенный запуск (ВМ была выключена) выполняется сразу после старта.

Копии **забирает шлюз**, а не отправляет сайт. ВМ сайта смотрит в интернет. Если её взломают,
то, что уже лежит на шлюзе, она не сотрёт и не подменит: у неё нет доступа к шлюзу, а шлюз
забирает новое без `--delete`. Со своей стороны ВМ сайта пускает шлюз под пользователем
`wms-backup-pull` только из `LAN_NET`, и только на чтение каталога бэкапов (`rrsync -ro` в
`authorized_keys`, `restrict`, файл ключей принадлежит root).

Проверка:

```bash
systemctl list-timers 'wms-backup*'            # когда был и будет запуск
journalctl -u wms-backup -n 30                 # на сайте
journalctl -u wms-backup-pull -n 30            # на шлюзе
systemctl --failed                             # упавший бэкап виден здесь
```

### Включить на уже работающих ВМ

`setup.sh vpn|app` заодно обновляет систему, переделывает ufw и sshd. Чтобы поставить только
бэкапы, есть `setup.sh backup`. Роль он определяет сам: шлюз — если есть
`/etc/wireguard/<WG_IF>.conf`, сайт — если есть `APP_DIR/docker-compose.yml`. Пакеты не обновляет
(ставит только `rsync`), ufw не трогает. В sshd добавляет одну строку `AllowUsers` в отдельный
`10-zmsh-backup.conf` и только если `AllowUsers` уже где-то задан: строки из разных файлов sshd
складывает, а без `AllowUsers` пускает всех и так.

```bash
# 0. На ВМ сайта код должен быть с scripts/backup.sh: cd /opt/wms-site && git pull
# 1. Шлюз
git clone https://github.com/maksmaksonchik/wms-site.git && cd wms-site/infra/vm   # или git pull
cp vm.env.example vm.env && nano vm.env      # ADMIN_USER, WG_IF, BACKUP_PULL_HOST
sudo ./setup.sh backup                       # печатает BACKUP_PULL_PUBKEY="ssh-ed25519 …"
# 2. ВМ сайта
cd /opt/wms-site/infra/vm
cp vm.env.example vm.env && nano vm.env      # ADMIN_USER, APP_DIR и BACKUP_PULL_PUBKEY с шага 1
sudo ./setup.sh backup                       # таймер, доступ для шлюза, предложит сразу сделать бэкап
# 3. Шлюз: проверить забор
sudo systemctl start wms-backup-pull && journalctl -u wms-backup-pull -n 20
```

Повторный запуск безопасен. Позже полный `setup.sh vpn|app` поверх этого тоже ничего не сломает.

`wms-backup-pull` падает, если последнему бэкапу больше 36 часов или его контрольные суммы не сходятся.
Уведомлений нет, поэтому `systemctl --failed` стоит смотреть при каждом заходе на шлюз (его показывает
и `audit.sh`). Место: одна копия сейчас ≈ 56 МБ (почти всё — картинки), 14 копий ≈ 0,8 ГБ на диске
шлюза 10 ГБ. С ростом медиатеки пересчитать `BACKUP_KEEP_DAYS`.

Достать копию со шлюза (файлы там доступны только `wms-backup`):

```bash
sudo cp -r /var/backups/wms-site/<дата>_<время> ~ && sudo chown -R "$USER:" ~/<дата>_<время>
```

Обе ВМ стоят у одного хостера. Для защиты от потери аккаунта или дата-центра время от времени
забирайте свежую копию к себе на ноутбук.

## Автодеплой (ВМ сайта)

`sudo ./setup.sh app` ставит его сам. На уже работающей ВМ:

```bash
cd /opt/wms-site && git pull && npm run prod   # первый деплой образов из CI — вручную
sudo infra/vm/setup.sh autodeploy              # таймер wms-autodeploy, раз в 2 минуты
journalctl -u wms-autodeploy -f
```

Таймер запускает `scripts/autodeploy.sh` от `ADMIN_USER` (группа docker). Состояние лежит
в `/var/lib/wms-autodeploy`. Как он работает и когда стоит на паузе — в
[README](../../README.md#последующие-обновления-автодеплой).

## Лимит соединений и Netdata (ВМ сайта)

`sudo ./setup.sh app` делает это сам. На уже работающей ВМ — отдельно:

```bash
cd /opt/wms-site && git pull
sudo infra/vm/setup.sh firewall
npm run monitoring:up
```

- Служба `zmsh-connlimit` после каждого запуска docker ставит в `DOCKER-USER` правило:
  не больше `CONNLIMIT_PER_IP` (256) одновременных TCP-соединений с одного IP к 80/443
  на публичном интерфейсе. Это защита от медленных клиентов, которых nginx не видит,
  пока не пришли заголовки. Проверка: `sudo iptables -S DOCKER-USER | grep zmsh-connlimit`.
  Лимит — в `/etc/default/zmsh-connlimit`, после правки `systemctl restart zmsh-connlimit`.
- UFW открывает 19999 (Netdata) только для `LAN_NET`. VPN-клиенты приходят оттуда с адреса
  шлюза. Netdata работает в сети хоста, поэтому UFW для него действует, в отличие от
  портов, опубликованных через `ports:`.

## Сверка с тем, что сделано сейчас

Источник: память проекта, репозиторий, разделы 5–8 ВКР, исходники `wg_deploy`.

| Что | Статус | Комментарий |
|---|---|---|
| ufw `default deny`, SSH только из LAN и VPN | ✅ оставить | В скрипте. На ВМ сайта правило для `10.161.0.0/24` по факту не срабатывает: шлюз маскарадит клиентов, и они приходят с `192.168.0.2`. Оставлено как страховка |
| `ufw allow <порт WG>/udp` | ✅ критично | Без него однажды пропал доступ к шлюзу. Скрипт добавляет правило до `ufw enable` |
| Пересылка `wg0 ↔ eth1` в `before.rules` | ❌ не работало | Интерфейс называется `bay_srv`, правила с `wg0` ни разу не сработали. VPN работал, потому что транзит был открыт целиком (`DEFAULT_FORWARD_POLICY="ACCEPT"`, `allow (routed)`), то есть шлюз пересылал любой трафик. Скрипт ставит `deny routed` и правила с настоящим именем интерфейса, плюс MSS clamping и явную пересылку наружу (`WG_FORWARD_TO_INTERNET`). Правило `eth1 → wg` лишнее: обратный трафик пропускает стандартное `RELATED,ESTABLISHED` |
| `ip_forward` | ✅ уточнено | На шлюзе ставится из `PostUp` конфига `wg_deploy`, а не из `/etc/sysctl.conf`. В скрипте — `sysctl.d` |
| Права `/etc/wireguard/bay_srv.conf` | ❌ было 644 | Приватный ключ сервера читали все пользователи. Скрипт ставит 600 |
| journald на шлюзе | ⚠️ без лимита | 893 МБ на диске 10 ГБ. Скрипт ограничивает |
| sshd: root и пароли запрещены | ❌ не работало | `00-netangels.conf` перебивал основной конфиг: `PermitRootLogin yes`, `PasswordAuthentication yes`. Исправлено drop-in файлом `00-hardening.conf` |
| fail2ban в цепочке `DOCKER-USER` | ✅ оставить | Уже в репозитории |
| Доступ к админке по `allowed-ips.conf` | ⚠️ при переезде | Админ заходит по домену через VPN и приходит с **белого IP шлюза** (это написано в `fail2ban/jail.local`), а не из `10.161.0.0/24`, как в листинге 7.1 ВКР. Новый шлюз — новый IP в `allowed-ips.conf` |
| `log-driver: local`, journald 500 МБ | ✅ оставить | В скрипте |
| `unattended-upgrades` | ➕ добавлено | Не был установлен |
| syncookies, `rp_filter=2` | ✅ оставить | И так значения Ubuntu по умолчанию; в скрипте заданы явно вместе с запретом redirects |

## Рекомендации (в скрипт не вошли)

1. **Бэкап вне NetAngels.** Ежесуточные бэкапы теперь есть (см. выше), но сайт и шлюз у одного хостера.
   Следующий шаг — копия во внешнее хранилище (S3-совместимое, шифрованная) или хотя бы регулярно
   на ноутбук.
2. **Лишние клиенты WireGuard.** `wg_deploy` заводит 254 peer-а и хранит приватные ключи всех клиентов
   в `wg_deploy/configs/` на шлюзе. Оставить в серверном конфиге только выданные peer-ы, а клиентские
   конфиги с сервера удалить. `audit.sh` показывает, где они лежат.
3. **Порты Docker мимо ufw.** Любой новый `ports:` в compose сразу открыт в интернет, ufw его не
   остановит. Служебные порты публиковать только как `127.0.0.1:порт:порт`.
4. **HSTS** в `nginx/nginx.conf` (`add_header Strict-Transport-Security "max-age=31536000" always;`),
   как и предлагалось в 8.5 ВКР.
5. **Закрепить версии образов** `certbot/certbot:latest` и `crazymax/fail2ban:latest`: иначе одна и та же
   команда на новой ВМ может собрать другой стенд.
6. **Мелочи в репозитории:** `NGINX_ADMIN_SUBNET` в `.env` нигде не используется;
   в локальном `nginx/allowed-ips.conf` указано `172.18.0.0/12` — nginx поймёт это как `172.16.0.0/12`.
7. **Снапшот в панели NetAngels** перед любыми работами с ufw, sshd и обновлениями релиза.
