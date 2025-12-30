# Сайт ЗМШ

Фронтенд написан на Next.js, в качестве бэка используется Strapi CMS
(основной стек у неё также node.js).

## Для работы с проектом понадобятся

1. [Node.js](https://nodejs.org/en)
   1. Проверить установку: `node -v`
   2. Если не установлен, лучше поставить через [nvm](https://www.nvmnode.com/)
   3. Минимальная версия: Node.js 20.x или выше
2. [Docker](https://docs.docker.com/)
   1. Проверить установку: `docker -v`
   2. Если не установлен, читать [здесь](https://docs.docker.com/engine/install/)
3. [OpenSSL](https://www.openssl.org/) (опционально, только для генерации SSL сертификатов)

   1. Проверить установку: `openssl version`
   2. Обычно уже установлен в Linux/macOS
   3. В Windows обычно устанавливается вместе с Git, но нужно добавить переменную в PATH:
      1. Проверь есть ли OpenSSL в Git `C:\Program Files\Git\usr\bin\openssl.exe`
      2. Добавь переменную в PATH:
         - Win+R -> `SystemPropertiesAdvanced`
         - Переменные окружения
         - В нижнем списке найди Path -> Изменить
         - Создать -> `C:\Program Files\Git\usr\bin`
      3. Перезапусти терминал (если используешь терминал в IDE, перезагрузи IDE)

## Перед любым запуском

1. Установи зависимости проекта (в корне проекта):

   ```bash
   npm install
   ```

2. Поставь зависимости фронтенда и бэкенда:

   ```bash
   npm run install:deps
   ```

3. Заполни переменные окружения

   1. Сгенерируй .env файлы `backend/.env.example`:

      ```bash
      npm run generate:env
      ```

   2. Заполни все переменные окружения со значениями, начинающимися на `TODO_`, нужными значениями
      - Все секреты сгенерируй с помощью `npm run generate:secrets`

## Запуск в режиме разработки

1. Запусти бд `npm run db:up`
2. В `backend/.env`
   1. В `DATABASE_HOST` укажи `127.0.0.1`
   2. В `DATABASE_SSL` поставь `false`
3. В `frontend/.env`
   1. В `API_BASE_URL` укажи `http://127.0.0.1:1337/api`
   2. В `ASSETS_PATHNAME` укажи `http://127.0.0.1:1337`
   3. В `ASSETS_DEV_MODE` поставь `true`
4. Запусти StrapiCMS `npm run dev:back`
5. В отдельном терминале запусти фронт `npm run dev:front`

Фронт будет доступен на <http://127.0.0.1:3000/>

StrapiCMS будет доступна на <http://127.0.0.1:1337/>

К БД можно подключиться через 127.0.0.1 и порт 5432 любым удобным способом.

## Запуск в продакшн-режиме (локально)

1. Останови бд дев-режима `npm run db:down`
2. Поменяй в `backend/.env` переменную `DATABASE_HOST` на `wms_strapi_db`
3. Сгенерируй локальные сертификаты `npm run generate:ssl`
   - На все вопросы можно просто нажать Enter
4. <!-- TODO: Указать значения для frontend/.env -->
5. Подними проект командой `npm run prod`
6. Логи можно просматривать командой `npm run logs`
7. Погасить можно командой `npm run down`

Проект станет доступен на <https://127.0.0.1/>

При выводе сообщения о ненадёжных сертификатах надо просто прожать:

`Details -> Accept the risk and continue`

## Деплой

1. На машине должен быть установлен [Docker Engine](https://docs.docker.com/engine/install/) и [Node.js](https://nodejs.org/en)
2. Склонируй проект на машину `git clone <url>`
3. Установи корневые зависимости: `npm install`
4. Заполни переменные окружения 0. Сгенерируй .env файлы `npm run generate:env`
   1. В `.env` в корне проекта укажи пути до настоящих сертификатов на машине.
   2. Секреты для `backend/.env` можно сгенерировать с помощью `npm run generate:secrets`
   3. Не забудь придумать надёжный пароль для `DATABASE_PASSWORD` в `backend/.env`
   4. <!-- TODO: Указать значения для frontend/.env -->
   5. Остальные переменные оставь без изменения
5. Подними проект командой `npm run prod`
6. Логи можно просматривать командой `npm run logs`
7. Погасить можно командой `npm run down`
