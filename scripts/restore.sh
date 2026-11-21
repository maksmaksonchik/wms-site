#!/usr/bin/env bash
# Восстановление сайта из каталога, который сделал backup.sh.
#
#   npm run prod:restore -- [--secrets] [--force] <каталог бэкапа>
#
#   --secrets  сначала распаковать secrets.tar.gz (.env, allowed-ips.conf, certbot/conf)
#              в репозиторий. Без флага эти файлы уже должны лежать на месте
#   --force    перезаписать непустую базу и том загрузок (восстановление поверх
#              работающего сайта). Без флага скрипт трогает только пустую базу
#
# Порядок: проверка сумм → (секреты) → создание контейнеров и томов → база → загрузки.
# Сайт скрипт не запускает: после него — npm run prod.
if [ -z "${BASH_VERSION:-}" ]; then exec bash "$0" "$@"; fi
set -euo pipefail

# shellcheck source=lib/backup-common.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/backup-common.sh"

usage() { echo "Использование: $0 [--secrets] [--force] <каталог бэкапа>" >&2; exit 2; }

WITH_SECRETS=0 FORCE=0 SRC=""
for arg in "$@"; do
  case $arg in
    --secrets) WITH_SECRETS=1 ;;
    --force) FORCE=1 ;;
    -*) usage ;;
    *) [[ -z $SRC ]] || usage; SRC=$arg ;;
  esac
done
[[ -n $SRC ]] || usage

# Та же блокировка, что у scripts/deploy.sh: автодеплой не начнётся посреди восстановления
exec 9>.deploy.lock
flock -n 9 || die "Идёт деплой (npm run prod или автодеплой, journalctl -u wms-autodeploy) — подождите"
[[ -d $SRC ]] || die "Нет каталога $SRC"
SRC=$(cd "$SRC" && pwd)

log "Проверка бэкапа $SRC"
for f in db.dump uploads.tar.gz; do
  [[ -s $SRC/$f ]] || die "Нет $SRC/$f"
done
if [[ -f $SRC/SHA256SUMS ]]; then
  (cd "$SRC" && sha256sum -c --quiet SHA256SUMS) || die "Контрольные суммы не сошлись: бэкап повреждён"
  info "Контрольные суммы в порядке"
else
  warn "Нет SHA256SUMS — проверить целостность нечем (бэкап сделан не backup.sh?)"
fi
if [[ -f $SRC/INFO ]]; then
  sed 's/^/    /' "$SRC/INFO"
  backup_commit=$(sed -n 's/^commit: //p' "$SRC/INFO")
  head_commit=$(git rev-parse HEAD 2>/dev/null || echo unknown)
  if [[ -n $backup_commit && $backup_commit != unknown && $backup_commit != "$head_commit" ]]; then
    warn "Бэкап сделан на коммите ${backup_commit:0:12}, а сейчас ${head_commit:0:12}."
    info "Strapi сам доводит схему до новой версии кода, но не откатывает: код должен быть не старее бэкапа"
  fi
fi

if [[ $WITH_SECRETS == 1 ]]; then
  log "Секреты"
  [[ -s $SRC/secrets.tar.gz ]] || die "Нет $SRC/secrets.tar.gz"
  listing=$(tar tzf "$SRC/secrets.tar.gz" | sed 's#^\./##; s#/$##')
  existing=()
  for p in "${SECRET_PATHS[@]}"; do
    grep -qxF "$p" <<<"$listing" || continue
    # certbot/conf есть и в чистом клоне (options-ssl-nginx.conf); занят он, только если есть сертификаты
    if [[ $p == certbot/conf ]]; then
      [[ -e certbot/conf/live ]] && existing+=("$p")
    elif [[ -e $p ]]; then
      existing+=("$p")
    fi
  done
  if [[ ${#existing[@]} -gt 0 && $FORCE != 1 ]]; then
    die "Уже есть ${existing[*]}. Перезаписать — добавьте --force"
  fi
  # Через контейнер: ключи в certbot/conf должны остаться у root. Остальное
  # отдаём текущему пользователю — на новой ВМ uid мог измениться
  docker run --rm -i -v "$REPO_DIR":/dst -e OWNER="$(id -u):$(id -g)" "$HELPER_IMAGE" sh -euc '
    tar xzf - -C /dst
    for p in .env backend/.env frontend/.env nginx/allowed-ips.conf; do
      [ -e "/dst/$p" ] && chown "$OWNER" "/dst/$p" && chmod 600 "/dst/$p"
    done
    true' < "$SRC/secrets.tar.gz"
  info "Распакованы: $(grep -vE '^certbot/conf/.' <<<"$listing" | tr '\n' ' ')"
  warn "Если сменился VPN-шлюз, впишите его новый белый IP в nginx/allowed-ips.conf — иначе админка ответит 403"
fi

[[ -f backend/.env ]] || die "Нет backend/.env: положите секреты или запустите с --secrets"

if service_running strapi; then
  [[ $FORCE == 1 ]] || die "Strapi запущен — это живой сайт? Восстановить поверх него: --force"
fi

# Версия образов — IMAGE_TAG из .env (пишет scripts/deploy.sh), без него latest
log "Контейнеры и тома (при первом запуске скачиваются образы)"
# Strapi нельзя запускать до восстановления: на пустой базе он сам создаст схему
docker compose stop strapi front nginx 2>/dev/null || true
docker compose up --no-start
docker compose start strapi-db
wait_db

log "База"
tables=$(db_psql "select count(*) from information_schema.tables where table_schema = 'public'")
if [[ $tables -gt 0 ]]; then
  [[ $FORCE == 1 ]] || die "В базе уже $tables таблиц. Перезаписать — добавьте --force"
  warn "Удаляю текущую схему public ($tables таблиц)"
  db_psql 'set client_min_messages = warning; drop schema public cascade; create schema public;'
fi
# Одна транзакция: либо база целиком, либо ничего
docker compose exec -T strapi-db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error --single-transaction' \
  < "$SRC/db.dump"
info "Таблиц: $(db_psql "select count(*) from information_schema.tables where table_schema = 'public'"), файлов в медиатеке: $(db_psql 'select count(*) from files')"

log "Загрузки"
vol=$(compose_volume strapi-uploads)
# В новый том Docker уже скопировал файлы из образа (bg_*.jpg) — они есть и в архиве.
# С --force том очищается, чтобы не осталось файлов, которых нет в бэкапе
docker run --rm -i -v "$vol":/data -e FORCE="$FORCE" -e OWNER="$STRAPI_UID:$STRAPI_UID" "$HELPER_IMAGE" sh -euc '
  [ "$FORCE" = 1 ] && find /data -mindepth 1 -delete
  tar xzf - -C /data
  # Strapi работает от node и должен иметь право дописывать новые загрузки
  chown -R "$OWNER" /data' < "$SRC/uploads.tar.gz"
info "Файлов в томе $vol: $(docker run --rm -v "$vol":/data:ro "$HELPER_IMAGE" find /data -type f | wc -l)"

log "Готово. Запустите сайт: npm run prod"
