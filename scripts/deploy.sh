#!/usr/bin/env bash
# Деплой готовых образов из GitHub Container Registry (собирает .github/workflows/images.yml).
#
#   npm run prod                         # версия = текущий git HEAD
#   IMAGE_TAG=sha-<хэш> npm run prod     # откат или конкретная сборка
#   npm run prod:pull | prod:up          # отдельные шаги
#
# Автодеплой (scripts/autodeploy.sh, таймер wms-autodeploy) вызывает этот же скрипт.
#
# Выбранный тег записывается в .env (IMAGE_TAG=…): docker compose читает этот файл сам,
# поэтому и ручные `docker compose up/restart`, и scripts/restore.sh работают с той же
# версией, а не с latest.
if [ -z "${BASH_VERSION:-}" ]; then exec bash "$0" "$@"; fi
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

[[ -f .env ]] || die "Нет .env в корне репозитория (npm run generate:env, см. README)"

# Один деплой за раз: ручной npm run prod, автодеплой и restore.sh берут одну блокировку.
# Автодеплой держит её сам на всё время работы и передаёт DEPLOY_LOCK_HELD=1
if [[ -z ${DEPLOY_LOCK_HELD:-} ]]; then
  exec 9>.deploy.lock
  flock -n 9 || die "Уже идёт деплой или восстановление (автодеплой: journalctl -u wms-autodeploy)"
fi

# Тег из окружения важнее записанного в .env: так работает откат
if [[ -z ${IMAGE_TAG:-} ]]; then
  head=$(git rev-parse HEAD)
  IMAGE_TAG=sha-$head
  # Образы собираются только из коммитов, которые есть на GitHub, и только из git:
  # правки файлов на ВМ в образ не попадут
  if [[ -z $(git branch -r --contains "$head" 2>/dev/null) ]]; then
    warn "Коммита ${head:0:7} нет на GitHub (git push / git pull?) — образа для него не будет"
  fi
  if ! git diff --quiet HEAD -- frontend backend nginx/Dockerfile nginx/nginx-main.conf \
      nginx/proxy-front.conf nginx/logrotate.conf nginx/docker-entrypoint.sh; then
    warn "Есть незакоммиченные правки в коде образов — в скачанных образах их нет:"
    git diff --stat HEAD -- frontend backend nginx >&2
  fi
fi
export IMAGE_TAG

# Наши образы (ghcr.io/<владелец>/wms-site-*) в текущей конфигурации compose
our_images() { docker compose config --images | grep '/wms-site-' | sort -u; }

pull() {
  log "Скачиваю образы $IMAGE_TAG"
  local out
  if [[ $IMAGE_TAG == local ]]; then
    # Наши собраны на этой машине (npm run prod:build-local), качаем только чужие
    docker compose pull --quiet strapi-db certbot fail2ban
    return
  fi
  if ! out=$(docker compose pull --quiet 2>&1); then
    printf '%s\n' "$out" >&2
    case $out in
      *"manifest unknown"*|*"not found"*)
        die "Образа $IMAGE_TAG нет в реестре. Сборка в GitHub Actions ещё идёт или упала (вкладка Actions репозитория). Старая версия сайта продолжает работать" ;;
      *denied*|*unauthorized*)
        # ghcr.io отвечает denied и на приватный пакет, и на ещё не созданный
        die "Реестр не пускает: пакеты wms-site-* ещё не созданы (первая сборка не прошла) или приватные. Нужно сделать их публичными, либо docker login ghcr.io (токен с read:packages). Старая версия сайта продолжает работать" ;;
      *) die "Не удалось скачать образы. Старая версия сайта продолжает работать" ;;
    esac
  fi
}

save_tag() {
  if grep -q '^IMAGE_TAG=' .env; then
    sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=$IMAGE_TAG|" .env
  else
    printf '\n# Задеплоенная версия образов. Пишет scripts/deploy.sh, руками не править\nIMAGE_TAG=%s\n' "$IMAGE_TAG" >> .env
  fi
}

# Тег, записанный в .env, то есть задеплоенный сейчас
deployed_tag() { sed -n 's/^IMAGE_TAG=//p' .env | tail -1; }

up() {
  local prev
  prev=$(deployed_tag)
  log "Запускаю $IMAGE_TAG"
  # Без down: compose пересоздаёт только изменившиеся контейнеры. Наши три меняются при
  # каждом деплое (новый тег), база и certbot продолжают работать, простой — секунды,
  # а пока перезапускается Next, nginx отдаёт страницы из кэша
  docker compose up -d --remove-orphans
  save_tag
  # Изменения смонтированных конфигов compose не замечает. fail2ban перезапускаем всегда
  # (баны он восстановит из своей базы), nginx — когда версия та же и контейнер не
  # пересоздавался: например, после правки allowed-ips.conf или nginx.conf на сервере
  if [[ $prev == "$IMAGE_TAG" ]]; then
    docker compose restart nginx fail2ban
  else
    docker compose restart fail2ban
  fi
}

prune() {
  log "Чистка старых образов"
  local current repo
  current=$(our_images)
  # Старые версии наших образов. Для отката их скачают заново
  while read -r repo; do
    docker image ls --format '{{.Repository}}:{{.Tag}}' --filter "reference=$repo" \
      | grep -vxF "$current" | xargs -r docker image rm >/dev/null || true
  done < <(sed 's/:[^:]*$//' <<<"$current")
  docker image prune -f >/dev/null
  docker builder prune -f --max-used-space 5gb >/dev/null
}

case ${1:-all} in
  pull) pull ;;
  up) up ;;
  all)
    # Сначала скачиваем: если образа нет, старая версия продолжает работать
    pull
    up
    prune
    ;;
  *) die "Использование: $0 [pull|up]" ;;
esac
