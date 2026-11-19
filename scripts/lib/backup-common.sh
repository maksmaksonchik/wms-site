# shellcheck shell=bash
# Общее для backup.sh и restore.sh. Отдельно не запускается.
#
# Скрипты работают с тем compose-проектом, который видит `docker compose` из корня
# репозитория: по умолчанию docker-compose.yml. Для локальной репетиции можно
# подставить COMPOSE_FILE=docker-compose-stage.yml и COMPOSE_PROJECT_NAME=<другое имя>.

REPO_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$REPO_DIR" || exit 1

# Вспомогательный образ для работы с томами и root-файлами (certbot/conf) без sudo
HELPER_IMAGE=${HELPER_IMAGE:-alpine:3.22}
# Всё, без чего не поднять сайт, кроме базы и загрузок. Отсутствующие пропускаются
# shellcheck disable=SC2034  # используется в backup.sh и restore.sh
SECRET_PATHS=(.env backend/.env frontend/.env nginx/allowed-ips.conf certbot/conf)
# Владелец файлов Strapi: пользователь node в образе node:*-alpine
# shellcheck disable=SC2034
STRAPI_UID=1000

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

# Каталог бэкапов по умолчанию: системный, если его создал setup.sh app, иначе в репозитории
default_backup_dir() {
  if [[ -d /var/backups/wms-site && -w /var/backups/wms-site ]]; then
    echo /var/backups/wms-site
  else
    echo "$REPO_DIR/backups"
  fi
}

compose_project() {
  local name
  name=$(docker compose config 2>/dev/null | sed -n 's/^name: //p' | head -1)
  [[ -n $name ]] || die "docker compose config не отработал: нет backend/.env или ошибка в compose-файле"
  echo "$name"
}

# Настоящее имя тома compose: не зависит от каталога, в который склонирован репозиторий
compose_volume() {
  local key=$1 project vols
  project=$(compose_project)
  vols=$(docker volume ls -q \
    --filter "label=com.docker.compose.project=$project" \
    --filter "label=com.docker.compose.volume=$key")
  [[ -n $vols ]] || die "Нет тома $key у проекта $project (контейнеры ещё не создавались?)"
  [[ $(wc -w <<<"$vols") == 1 ]] || die "Несколько томов $key у проекта $project: $vols"
  echo "$vols"
}

service_running() {
  [[ -n $(docker compose ps -q --status running "$1" 2>/dev/null) ]]
}

# psql внутри контейнера базы; пользователь и база — из переменных самого контейнера
db_psql() {
  docker compose exec -T strapi-db sh -c \
    'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -qAt -c "$1"' _ "$1"
}

# Ждём настоящий сервер. Во время первой инициализации тома Postgres поднимает
# временный сервер только на unix-сокете и потом перезапускается — по TCP он не отвечает
wait_db() {
  local i
  for ((i = 0; i < 120; i++)); do
    docker compose exec -T strapi-db pg_isready -h 127.0.0.1 -q 2>/dev/null && return 0
    sleep 1
  done
  die "База не поднялась за 2 минуты: docker compose logs strapi-db"
}

# Каталоги готовых бэкапов (без .partial), от старых к новым
list_backups() {
  find "$1" -mindepth 1 -maxdepth 1 -type d -name '20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]_[0-9]*' \
    ! -name '*.partial' -printf '%f\n' | LC_ALL=C sort
}

# Удаляет бэкапы старше keep_days, но всегда оставляет min_keep самых свежих:
# если бэкапы перестанут делаться, старые копии не исчезнут вслед за сроком
prune_backups() {
  local dir=$1 keep_days=$2 min_keep=$3 name
  [[ $keep_days -gt 0 ]] || return 0
  local -a all
  mapfile -t all < <(list_backups "$dir")
  local n=$(( ${#all[@]} - min_keep ))
  for ((i = 0; i < n; i++)); do
    name=${all[i]}
    if [[ -n $(find "$dir/$name" -maxdepth 0 -mtime "+$keep_days") ]]; then
      rm -rf -- "${dir:?}/$name"
      info "Удалён старый бэкап $name"
    fi
  done
  # Недописанные бэкапы от упавших запусков
  find "$dir" -mindepth 1 -maxdepth 1 -type d -name '*.partial' -mtime +1 -exec rm -rf -- {} +
}
