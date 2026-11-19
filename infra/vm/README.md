# Настройка ВМ с нуля

Скрипты, которые повторяют ручную настройку двух ВМ NetAngels (Ubuntu 24.04)
и сразу закрывают найденные в ней дыры.

| Файл | Что делает |
|---|---|
| `setup.sh vpn` | WireGuard-шлюз: ufw, пересылка VPN → LAN, sshd, автообновления |
| `setup.sh app` | ВМ сайта: Docker из официального репозитория, `daemon.json`, ufw, клон репозитория в `/opt/wms-site` |
| `setup.sh finish` | убирает временное правило SSH с белого IP, которое ставится при первом запуске |
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

## Порядок переезда

Главный риск — отрезать себе доступ: SSH открыт только из VPN, а VPN на новой машине ещё не поднят.
Поэтому сначала шлюз, потом сайт, и всегда с открытой VNC-консолью в панели NetAngels.

**0. На старых машинах.** Снять снимок и данные:

```bash
sudo ./infra/vm/audit.sh > audit-$(hostname).txt        # на обеих ВМ — сверить с vm.env
sudo cp /etc/wireguard/<WG_IF>.conf ~/                   # шлюз: ключи сервера, чтобы клиенты остались
cd /opt/wms-site                                         # сайт:
docker exec wms_strapi_db sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > strapi-$(date +%F).dump
docker run --rm -v wms-site_strapi-uploads:/data:ro -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tgz -C /data .
tar czf secrets-$(date +%F).tgz .env backend/.env frontend/.env nginx/allowed-ips.conf certbot/conf
```

Заранее снизить TTL A-записи `zmsh.space` в reg.ru (например до 300), чтобы переключение DNS было быстрым.

**1. Новый шлюз.** Создать ВМ, включить её в локальную сеть в панели, зайти по белому IP:

```bash
git clone https://github.com/maksmaksonchik/wms-site.git && cd wms-site/infra/vm
cp vm.env.example vm.env && nano vm.env      # WG_IF и WG_RESTORE_CONF — по audit
sudo ./setup.sh vpn
```

Клиентам заменить `Endpoint` на новый IP, подключиться, проверить `ssh <user>@192.168.0.2`.
Потом `sudo ./setup.sh finish`.

**2. Новая ВМ сайта.** Зайти на неё уже через VPN (`ssh <user>@<её LAN-адрес>`) и `sudo ./setup.sh app`.
Затем перенести данные:

```bash
cd /opt/wms-site
tar xzf ~/secrets-*.tgz
# В nginx/allowed-ips.conf заменить белый IP старого шлюза на новый — иначе админка ответит 403
docker compose up --no-start                 # создаёт тома
docker compose start strapi-db
docker exec -i wms_strapi_db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < ~/strapi-*.dump
docker run --rm -v wms-site_strapi-uploads:/data -v ~:/backup alpine tar xzf /backup/uploads-<дата>.tgz -C /data
npm run prod
```

Если на сайт пришлось заходить по белому IP — потом `sudo ./setup.sh finish`.

**3. DNS.** Сменить A-запись, дождаться, проверить сайт и админку через VPN.
Если `certbot/conf` не переносили — `npm run acme-challenge` уже после смены DNS.

## Сверка с тем, что сделано сейчас

Источник: память проекта, репозиторий, разделы 5–8 ВКР, исходники `wg_deploy`.

| Что | Статус | Комментарий |
|---|---|---|
| ufw `default deny`, SSH только из LAN и VPN | ✅ оставить | В скрипте. На ВМ сайта правило для `10.161.0.0/24` по факту не срабатывает: шлюз маскарадит клиентов, и они приходят с `192.168.0.2`. Оставлено как страховка |
| `ufw allow <порт WG>/udp` | ✅ критично | Без него однажды пропал доступ к шлюзу. Скрипт добавляет правило до `ufw enable` |
| Пересылка `wg ↔ eth1` в `before.rules` | ✅ уточнено | Правило `eth1 → wg0` лишнее: обратный трафик и так пропускает стандартное `RELATED,ESTABLISHED`. Добавлены MSS clamping (совет из README `wg_deploy`) и явная пересылка наружу (`WG_FORWARD_TO_INTERNET`) |
| `net.ipv4.ip_forward = 1` в `/etc/sysctl.conf` | ⚠️ перенести | Перенесено в `sysctl.d`: новые systemd перестают читать `/etc/sysctl.conf` |
| Интерфейс `wg0` | ❓ проверить | `wg_deploy` создаёт `bay_srv` (`wg-quick@bay_srv`), в дипломе и `before.rules` — `wg0`. `audit.sh` покажет, что на самом деле |
| sshd: root и пароли запрещены | ❌ не работало | `00-netangels.conf` перебивал основной конфиг: `PermitRootLogin yes`, `PasswordAuthentication yes`. Исправлено drop-in файлом `00-hardening.conf` |
| fail2ban в цепочке `DOCKER-USER` | ✅ оставить | Уже в репозитории |
| Доступ к админке по `allowed-ips.conf` | ⚠️ при переезде | Админ заходит по домену через VPN и приходит с **белого IP шлюза** (это написано в `fail2ban/jail.local`), а не из `10.161.0.0/24`, как в листинге 7.1 ВКР. Новый шлюз — новый IP в `allowed-ips.conf` |
| `log-driver: local`, journald 500 МБ | ✅ оставить | В скрипте |
| `unattended-upgrades` | ➕ добавлено | Не был установлен |
| syncookies, `rp_filter=2` | ✅ оставить | И так значения Ubuntu по умолчанию; в скрипте заданы явно вместе с запретом redirects |

## Рекомендации (в скрипт не вошли)

1. **Автоматические бэкапы.** Сейчас `pg_dump` делается вручную, а тома с загрузками не копируются совсем.
   Минимум: systemd-таймер с ежесуточным `pg_dump` и `tar` тома `strapi-uploads`, хранение 14 дней,
   копия **на другую машину** (шлюз или внешнее хранилище). Без копии вне ВМ это не бэкап.
2. **Лишние клиенты WireGuard.** `wg_deploy` заводит 254 peer-а и хранит приватные ключи всех клиентов
   в `wg_deploy/configs/` на шлюзе. Оставить в серверном конфиге только выданные peer-ы, а клиентские
   конфиги с сервера удалить. `audit.sh` показывает, где они лежат.
3. **Split tunnel.** Клиенты `wg_deploy` гонят весь трафик через шлюз (`0.0.0.0/0`, DNS 8.8.8.8).
   Для администрирования достаточно `VPN_NET, LAN_NET, <IP сайта>/32`: новые конфиги скрипт делает так.
   Когда старых клиентов не останется, можно поставить `WG_FORWARD_TO_INTERNET=app`.
4. **Порты Docker мимо ufw.** Любой новый `ports:` в compose сразу открыт в интернет, ufw его не
   остановит. Служебные порты публиковать только как `127.0.0.1:порт:порт`.
5. **HSTS** в `nginx/nginx.conf` (`add_header Strict-Transport-Security "max-age=31536000" always;`),
   как и предлагалось в 8.5 ВКР.
6. **Закрепить версии образов** `certbot/certbot:latest` и `crazymax/fail2ban:latest`: иначе одна и та же
   команда на новой ВМ может собрать другой стенд.
7. **Мелочи в репозитории:** `NGINX_ADMIN_SUBNET` в `.env` нигде не используется;
   в локальном `nginx/allowed-ips.conf` указано `172.18.0.0/12` — nginx поймёт это как `172.16.0.0/12`.
8. **Снапшот в панели NetAngels** перед любыми работами с ufw, sshd и обновлениями релиза.
