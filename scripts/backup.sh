#!/usr/bin/env bash
# Бэкап работающего сайта: база, загрузки Strapi и секреты (.env, сертификаты).
#
#   npm run prod:backup                      # или bash scripts/backup.sh
#   BACKUP_DIR=~/bk npm run prod:backup      # в другой каталог
#
# Результат — каталог <BACKUP_DIR>/<дата>_<время>/:
#   db.dump          pg_dump -Fc, проверен через pg_restore -l
#   uploads.tar.gz   содержимое тома strapi-uploads
#   secrets.tar.gz   .env-файлы, nginx/allowed-ips.conf, certbot/conf — хранить как пароли
#   INFO             коммит, дата, сколько записей
#   SHA256SUMS       контрольные суммы, их проверяет restore.sh
#
# Переменные: BACKUP_DIR (по умолчанию /var/backups/wms-site, если он есть, иначе backups/
# в репозитории), BACKUP_KEEP_DAYS=14 (0 — не удалять старые), BACKUP_MIN_KEEP=3.
# Нужны права на docker (группа docker), sudo не нужен.
if [ -z "${BASH_VERSION:-}" ]; then exec bash "$0" "$@"; fi
set -euo pipefail

# shellcheck source=lib/backup-common.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/backup-common.sh"

BACKUP_DIR=${BACKUP_DIR:-$(default_backup_dir)}
BACKUP_KEEP_DAYS=${BACKUP_KEEP_DAYS:-14}
BACKUP_MIN_KEEP=${BACKUP_MIN_KEEP:-3}

# Группа (её читает шлюз при выгрузке копий) — да, остальные — нет
umask 027
mkdir -p "$BACKUP_DIR"
exec 9>"$BACKUP_DIR/.lock"
flock -n 9 || die "Другой бэкап уже идёт ($BACKUP_DIR/.lock)"

service_running strapi-db || die "База не запущена: бэкапить нечего (docker compose ps)"

name=$(date +%Y-%m-%d_%H%M%S)
tmp="$BACKUP_DIR/$name.partial"
mkdir "$tmp"
trap 'rm -rf -- "$tmp"' EXIT

log "База → $name/db.dump"
docker compose exec -T strapi-db sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' > "$tmp/db.dump"
# Оглавление читается только у целого архива: ловит обрезанный дамп
docker compose exec -T strapi-db pg_restore -l < "$tmp/db.dump" > /dev/null \
  || die "pg_restore не читает только что снятый дамп"

# Загрузки — после базы: всё, на что ссылается дамп, к этому моменту уже на диске
log "Загрузки → $name/uploads.tar.gz"
docker run --rm -v "$(compose_volume strapi-uploads)":/data:ro "$HELPER_IMAGE" \
  tar czf - -C /data . > "$tmp/uploads.tar.gz"
tar tzf "$tmp/uploads.tar.gz" > /dev/null

log "Секреты → $name/secrets.tar.gz"
present=()
for p in "${SECRET_PATHS[@]}"; do
  [[ -e $p ]] && present+=("$p")
done
# Через контейнер: в certbot/conf ключи принадлежат root
docker run --rm -v "$REPO_DIR":/src:ro "$HELPER_IMAGE" \
  tar czf - -C /src "${present[@]}" > "$tmp/secrets.tar.gz"

{
  echo "date: $(date -Iseconds)"
  echo "host: $(hostname)"
  echo "commit: $(git -C "$REPO_DIR" rev-parse HEAD 2>/dev/null || echo unknown)"
  echo "compose_project: $(compose_project)"
  echo "tables: $(db_psql "select count(*) from information_schema.tables where table_schema = 'public'")"
  echo "files: $(db_psql 'select count(*) from files')"
  echo "uploads_entries: $(tar tzf "$tmp/uploads.tar.gz" | wc -l)"
  echo "secrets: ${present[*]}"
} > "$tmp/INFO"

(cd "$tmp" && sha256sum db.dump uploads.tar.gz secrets.tar.gz INFO > SHA256SUMS)
mv "$tmp" "$BACKUP_DIR/$name"
trap - EXIT

info "Готово: $BACKUP_DIR/$name ($(du -sh "$BACKUP_DIR/$name" | cut -f1))"
sed 's/^/    /' "$BACKUP_DIR/$name/INFO"

prune_backups "$BACKUP_DIR" "$BACKUP_KEEP_DAYS" "$BACKUP_MIN_KEEP"
