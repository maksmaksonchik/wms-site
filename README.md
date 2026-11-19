# Сайт ЗМШ

Фронтенд написан на Next.js, в качестве бэка используется Strapi CMS
(основной стек у неё также node.js).

## Для работы с проектом понадобятся

1. [Node.js](https://nodejs.org/en)
   1. Проверить установку: `node -v`
   2. Если не установлен, лучше поставить через [nvm](https://www.nvmnode.com/)
   3. Минимальная версия: Node.js 20.x, лучше поставить 22 LTS (`nvm install v22.21.1`)
   4. Важно: StrapiCMS работает только с LTS-версиями node.js
2. [Docker](https://docs.docker.com/)
   1. Проверить установку: `docker -v`
   2. Если не установлен, читать [здесь](https://docs.docker.com/engine/install/)
3. [OpenSSL](https://www.openssl.org/)<br>
   (опционально, только для генерации SSL сертификатов,
   необходимых для запуска прод-конфигурации локально)
   1. Проверить установку: `openssl version`
   2. Обычно уже установлен в Linux/macOS
   3. В Windows обычно устанавливается вместе с Git, но нужно добавить переменную в PATH:
      1. Проверь есть ли OpenSSL в Git `C:\Program Files\Git\usr\bin\openssl.exe`
      2. Добавь переменную в PATH:
         - Win+R -> `SystemPropertiesAdvanced`
         - Переменные окружения
         - В нижнем списке найди Path → Изменить
         - Создать -> `C:\Program Files\Git\usr\bin`
      3. Перезапусти терминал (если используешь терминал в IDE, перезагрузи IDE)

## Перед любым запуском (кроме деплоя)
1. Поставь зависимости фронтенда и бэкенда:
   ```bash
   npm run install:deps
   ```
2. Заполни переменные окружения
   1. Сгенерируй .env файлы:
      ```bash
      npm run generate:env
      ```
   2. Заполни все переменные окружения со значениями, начинающимися на `TODO_`, нужными значениями
      - Все секреты для `backend/.env` сгенерируй с помощью `npm run generate:secrets`

## Запуск в режиме разработки

1. Запусти бд `npm run db:up`
2. В `backend/.env`
   1. В `DATABASE_HOST` укажи `127.0.0.1`
   2. В `DATABASE_SSL` поставь `false`
3. В `frontend/.env`
   1. В `API_BASE_URL` укажи `http://127.0.0.1:1337/api`
   2. В `NEXT_PUBLIC_ASSETS_BASE_URL` укажи `http://127.0.0.1:1337`
   3. В `ASSETS_DEV_MODE` поставь `true`
4. Запусти StrapiCMS `npm run dev:back`
5. В отдельном терминале запусти фронт `npm run dev:front`

Фронт будет доступен на <http://127.0.0.1:3000/>

StrapiCMS будет доступна на <http://127.0.0.1:1337/>

К БД можно подключиться через 127.0.0.1 и порт 5432 любым удобным способом.

## Запуск в продакшн-режиме (локально)

1. Останови бд дев-режима `npm run db:down`
2. Поменяй в `backend/.env` переменную `DATABASE_HOST` на `wms_strapi_db`
3. Сгенерируй локальные сертификаты `npm run generate:ssl` (понадобится установленный `openssl`)
   - На все вопросы можно просто нажать Enter
4. Убедись, что во `frontend/.env` указаны верные урлы (подробнее в `frontend/.env.example`)
5. Создай `nginx/allowed-ips.conf`:
   ```bash
      cp nginx/allowed-ips.conf.template nginx/allowed-ips.conf
   ```
   1. Проверь, что в `nginx/allowed-ips.conf` указаны нужные ip-адреса
      1. Скорее всего, локально понадобится указать адрес docker-подсети,
      можно узнать его, например, запустив проект и посмотрев в access.log nginx.
      Затем добавить его в `alllowed-ips.conf` и перезапустить проект, чтобы иметь доступ к админке.
6. Подними проект командой `npm run stage`
7. Логи можно просматривать командой `npm run stage:logs`
8. Погасить можно командой `npm run stage:down`

Проект станет доступен на <https://127.0.0.1/>

При выводе сообщения о ненадёжных сертификатах надо просто прожать:

`Details -> Accept the risk and continue`

## Деплой

### В первый раз
1. На машине должен быть установлен [Docker Engine](https://docs.docker.com/engine/install/) и [Node.js](https://nodejs.org/en)
2. Склонируй проект на машину `git clone <url>`
3. Заполни переменные окружения
   1. Сгенерируй .env файлы `npm run generate:env`
   2. Секреты для `backend/.env` можно сгенерировать с помощью `npm run generate:secrets`
   3. Не забудь придумать надёжный пароль для `DATABASE_PASSWORD` в `backend/.env`
   4. Убедись, что во `frontend/.env` указаны верные урлы на нужное доменное имя (подробнее в `frontend/.env.example`)
   5. Остальные переменные оставь без изменения
4. Пройди acme-challenge при деплое в первый раз `npm run acme-challenge`
   1. После того как `certbot` успешно завершится, нажми `Ctrl + C`
5. Создай `nginx/allowed-ips.conf`:
   ```bash
      cp nginx/allowed-ips.conf.template nginx/allowed-ips.conf
   ```
   1. Укажи в `allowed-ips.conf` нужные ip-адреса или подсети, которые
      должны иметь доступ к админ-панели.
6. Подними проект командой `npm run prod`
7. Логи можно просматривать командой `npm run prod:logs`
8. Погасить можно командой `npm run prod:down`

### Последующие обновления стенда
Можно производить просто
1. `git pull`
2. Добавить новые переменные окружения в `.env`, если они появились,
   изменить `nginx/allowed-ips.conf` или прочие файлы локальных настроек,
   если нужно
3. `npm run prod`

## Бэкап и восстановление

Всё, что не лежит в git, — это три вещи:

| Что | Где на сервере | Без него |
|---|---|---|
| База Strapi | том `wms-site_strapi-data` | пропадает весь контент |
| Загрузки (картинки) | том `wms-site_strapi-uploads` | пропадают все картинки, в базе остаются битые ссылки |
| Секреты | `.env`, `backend/.env`, `frontend/.env`, `nginx/allowed-ips.conf`, `certbot/conf` | можно создать заново (см. ниже) |

На сервере бэкап делается сам каждую ночь, и копии забирает VPN-шлюз
(см. [infra/vm/README.md](infra/vm/README.md#автоматические-бэкапы)). Вручную:

```bash
npm run prod:backup        # /var/backups/wms-site/<дата>_<время>/ (если каталога нет — ./backups/)
```

В каталоге бэкапа лежат `db.dump`, `uploads.tar.gz`, `secrets.tar.gz`, `INFO` (коммит, число записей)
и `SHA256SUMS`. В `secrets.tar.gz` пароль от базы, ключи Strapi и закрытый ключ TLS:
хранить и передавать как пароли.

### Восстановление в чистый экземпляр

```bash
git clone https://github.com/maksmaksonchik/wms-site.git && cd wms-site
# git checkout <commit из INFO>, если код ушёл вперёд и нужно поднять ровно то, что было
npm run prod:restore -- --secrets ~/2026-11-20_023012   # секреты, база, картинки
npm run prod
```

Скрипт сначала проверяет контрольные суммы. Потом создаёт контейнеры и тома (при этом собирает образы),
дожидается базы и восстанавливает её одной транзакцией: база либо восстановится целиком, либо
останется пустой. Картинки распаковываются в том Strapi. Сайт скрипт не запускает.

- Без `--secrets` `.env`-файлы и `allowed-ips.conf` уже должны лежать на месте.
- Если в базе уже есть таблицы, скрипт откажется её трогать. Восстановить поверх работающего сайта
  (откатиться на вчерашний бэкап) — `--force`: Strapi остановится, схема `public` и том загрузок
  очистятся, затем `npm run prod`.
- Код должен быть не старее бэкапа: новую схему Strapi сам доводит до новой версии, а назад не откатывает.

### Если секретов нет

Сайт поднимается и без них, потеряется только второстепенное:

1. `npm run generate:env`, `npm run generate:secrets`, придумать новый `DATABASE_PASSWORD`.
   Пароль задаётся при создании тома базы, а том всё равно новый.
2. `npm run acme-challenge` после переключения DNS — новый сертификат.
3. `nginx/allowed-ips.conf` из шаблона: белый IP VPN-шлюза.
4. `npm run prod:restore -- <каталог>`, затем `npm run prod`.

С новыми `APP_KEYS`, `ADMIN_JWT_SECRET` и `JWT_SECRET` всем придётся заново войти в админку.
Пароли админов хранятся в базе и не меняются. Фронтенд ходит в API без токена, поэтому новый
`API_TOKEN_SALT` сайт не ломает. Перестанут работать только API-токены, выпущенные в админке,
если такие были.

### Репетиция на своей машине

Бэкап с сервера можно развернуть в локальный stage, ничего не трогая на сервере:

```bash
COMPOSE_PROJECT_NAME=wms-drill npm run stage:restore -- ~/2026-11-20_023012
COMPOSE_PROJECT_NAME=wms-drill docker compose -f docker-compose-stage.yml up -d
```

`COMPOSE_PROJECT_NAME` — чтобы не затереть тома своего локального stage. Имена контейнеров
у всех конфигураций одни и те же (`wms_strapi` и т. д.), поэтому сначала нужно погасить
остальные запуски. Убрать за собой:
`COMPOSE_PROJECT_NAME=wms-drill docker compose -f docker-compose-stage.yml down -v`.

Бэкап, сделанный до появления `scripts/backup.sh` (отдельные `*.dump` и `*.tar.gz`), тоже подойдёт.
Положите файлы в один каталог под именами `db.dump` и `uploads.tar.gz`. Скрипт предупредит,
что `SHA256SUMS` нет, и продолжит.
