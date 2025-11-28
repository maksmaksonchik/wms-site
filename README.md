# Сайт ЗМШ

Фронтенд написан на Next.js, в качестве бэка используется Strapi CMS
(основной стек у неё также node.js).

## Для работы с проектом понадобятся
1. [Make](https://www.gnu.org/software/make/)
   1. Проверить установку: `make -v`
   2. Если не установлен, то `sudo apt install make`, или
   3. [Исходники здесь](https://ftp.gnu.org/gnu/make/)
   4. [Для винды здесь](https://gnuwin32.sourceforge.net/packages/make.htm)
2. [Docker](https://docs.docker.com/)
   1. Проверить установку: `docker -v`
   2. Если не установлен, читать [здесь](https://docs.docker.com/engine/install/)
3. [Node.js](https://nodejs.org/en)
   1. Проверить установку: `node -v`
   2. Если не установлен, лучше поставить через [nvm](https://www.nvmnode.com/)

## Перед любым запуском
1. Поставь зависимости `make install_deps`
2. Заполни переменные окружения
   1. Возьми за основу `backend/.env.example`: `cp backend/.env.example backend/.env`
   2. Заполни все переменные окружения со значениями, начинающимися на `TODO_`, нужными значениями
      1. Все секреты сгенерируй с помощью `make generate_secrets`
   3. В корне проекта выполни `cp .env.example .env`


## Запуск в режиме разработки
1. Запусти бд `make run_db_dev`
2. В `backend/.env`
   1. В `DATABASE_HOST` укажи `127.0.0.1`
   2. В `DATABASE_SSL` поставь `false`
3. Запусти StrapiCMS `make run_back_dev`
4. В отдельном терминале запусти фронт `make run_front_dev`

Фронт будет доступен на http://127.0.0.1:3000/

StrapiCMS будет доступна на http://127.0.0.1:1337/

К БД можно подключиться через 127.0.0.1 и порт 5432 любым удобным способом.

## Запуск в продакшен-режиме (локально)
1. Останови бд дев-режима `make down_db_dev`
2. Поменяй в `backend/.env` переменную `DATABASE_HOST` на `wms_strapi_db`
3. Сгенерируй локальные сертификаты `make generate_ssl`
   1. На все вопросы можно просто нажать Enter
4. Подними проект просто командой `make`
5. Логи можно просматривать командой `make logs`
6. Погасить можно командой `make down`

Проект станет доступен на https://127.0.0.1/

При выводе сообщения о ненадёжных сертификатах надо просто прожать:

`Details -> Accept the risk and continue`

# Деплой
1. На машине должен быть установлен [Docker Engine](https://docs.docker.com/engine/install/)
2. Склонируй проект на машину `git clone <url>`
3. Заполни переменные окружения
   1. `cp .env.example .env` в корне проекта и укажи пути до настоящих сертификатов на машине.
   2. `cp backend/.env.example backend/.env`
   3. Секреты для `backend/.env` можно сгенерировать с помощью `make generate_secrets`
   4. Не забудь придумать надёжный пароль для `DATABASE_PASSWORD` в `backend/.env`
   5. Остальные переменные оставь без изменения
4. Подними проект просто командой `make`
5. Логи можно просматривать командой `make logs`
6. Погасить можно командой `make down`

