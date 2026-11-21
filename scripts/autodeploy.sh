#!/usr/bin/env bash
# Автодеплой: каждые 2 минуты (таймер wms-autodeploy, ставит infra/vm/setup.sh autodeploy)
# смотрит, появился ли в origin/main новый коммит, и деплоит его, когда GitHub Actions
# соберёт образы. ВМ сама ходит на GitHub, входящий доступ и секреты не нужны.
#
#   1. git fetch; новых коммитов нет — выход.
#   2. Образов sha-<коммит> в реестре ещё нет — ждём следующего запуска
#      (через час ожидания — предупреждение в журнале).
#   3. git merge --ff-only, scripts/deploy.sh, проверка, что главная страница рендерится.
#   4. Не получилось — git и образы возвращаются к прошлой версии, коммит запоминается
#      как неудачный и больше не пробуется. Следующий коммит в main пробуется как обычно.
#
# Ничего не делает, если сайт ещё не деплоился (в .env нет IMAGE_TAG), в репозитории
# есть незакоммиченные правки или checkout не на main (например, после ручного отката).
# Журнал: journalctl -u wms-autodeploy. Повторить неудачный коммит: удалить
# $STATE_DIRECTORY/failed или задеплоить руками (git pull && npm run prod).
if [ -z "${BASH_VERSION:-}" ]; then exec bash "$0" "$@"; fi
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

BRANCH=main
# Каталог состояния: StateDirectory= в юните, при ручном запуске — рядом с .git
STATE=${STATE_DIRECTORY:-$PWD/.git/wms-autodeploy}
WAIT_WARN_SEC=${AUTODEPLOY_WAIT_WARN_SEC:-3600}
HEALTH_TIMEOUT_SEC=${AUTODEPLOY_HEALTH_TIMEOUT_SEC:-300}
HEALTH_PORT=${AUTODEPLOY_HEALTH_PORT:-443}
mkdir -p "$STATE"

log()  { echo "$*"; }
# Сообщение о том, почему автодеплой стоит. Повторяется каждые 2 минуты, поэтому в
# журнал пишется только при изменении
note() {
  [[ $(cat "$STATE/note" 2>/dev/null) == "$*" ]] && return 0
  printf '%s' "$*" > "$STATE/note"
  echo "$*"
}

exec 9>.deploy.lock
flock -n 9 || exit 0  # идёт ручной деплой или восстановление
export DEPLOY_LOCK_HELD=1

prev_tag=$(sed -n 's/^IMAGE_TAG=//p' .env 2>/dev/null | tail -1 || true)
head=$(git rev-parse HEAD)
[[ -n $prev_tag ]] || { note "Пропуск: сайт ещё не деплоился через npm run prod (нет IMAGE_TAG в .env)"; exit 0; }
[[ $(git symbolic-ref -q --short HEAD || true) == "$BRANCH" ]] \
  || { note "Пропуск: checkout не на $BRANCH (ручной откат?). Вернуть автодеплой: git switch $BRANCH && npm run prod"; exit 0; }
# Задеплоено не то, что в checkout: откат через IMAGE_TAG=… или сборка на ВМ (local)
[[ $prev_tag == "sha-$head" ]] \
  || { note "Пропуск: задеплоена $prev_tag, а не HEAD ${head:0:7} (ручной откат?). Вернуть автодеплой: npm run prod"; exit 0; }
[[ -z $(git status --porcelain --untracked-files=no) ]] \
  || { note "Пропуск: незакоммиченные правки в репозитории (git status)"; exit 0; }

if ! git fetch -q origin "$BRANCH" 2>"$STATE/fetch.err"; then
  note "Не удалось обратиться к GitHub: $(tr '\n' ' ' < "$STATE/fetch.err")"
  exit 0
fi
target=$(git rev-parse "origin/$BRANCH")
if [[ $head == "$target" ]]; then
  note "Версия актуальна: ${head:0:7}"
  exit 0
fi
git merge-base --is-ancestor "$head" "$target" \
  || { note "Пропуск: локальный $BRANCH разошёлся с origin/$BRANCH (git log origin/$BRANCH..HEAD)"; exit 0; }
if [[ $(cat "$STATE/failed" 2>/dev/null) == "$target" ]]; then
  note "Пропуск: ${target:0:7} уже не задеплоился (журнал выше). Ждём следующий коммит"
  exit 0
fi

# Собраны ли образы нового коммита (все три: сборки идут параллельно)
images=$(IMAGE_TAG=sha-$target docker compose config --images | grep '/wms-site-')
for img in $images; do
  if ! docker buildx imagetools inspect "$img" >/dev/null 2>&1; then
    first=$(sed -n "s/^$target //p" "$STATE/waiting" 2>/dev/null || true)
    [[ -n $first ]] || { first=$(date +%s); echo "$target $first" > "$STATE/waiting"; }
    if (( $(date +%s) - first > WAIT_WARN_SEC )); then
      note "ВНИМАНИЕ: образов для ${target:0:7} нет уже $(( ($(date +%s) - first) / 60 )) мин — сборка в GitHub Actions упала? ($img)"
    else
      note "Жду сборку образов для ${target:0:7} в GitHub Actions"
    fi
    exit 0
  fi
done
rm -f "$STATE/waiting"

# Главная страница отрисована Next заново, а не взята из кэша nginx. X-Loadtest-Bust
# nginx выполняет для адресов docker-сетей, а запрос с хоста приходит именно оттуда.
# Обычный UA: на curl nginx отвечает 444
healthy() {
  local name deadline hdr
  name=$(sed -n 's/^NGINX_SERVER_NAME=//p' .env | tail -1)
  deadline=$(( $(date +%s) + HEALTH_TIMEOUT_SEC ))
  while (( $(date +%s) < deadline )); do
    hdr=$(curl -sk -o /dev/null -D - --max-time 20 --resolve "$name:$HEALTH_PORT:127.0.0.1" \
      -A 'Mozilla/5.0 (wms-autodeploy)' -H 'X-Loadtest-Bust: 1' "https://$name:$HEALTH_PORT/" 2>/dev/null || true)
    if [[ $hdr =~ ^HTTP/[0-9.]+\ 200 ]] && ! grep -qiE '^x-cache: *(HIT|STALE)' <<<"$hdr"; then
      return 0
    fi
    sleep 5
  done
  log "Главная не ответила 200 за $HEALTH_TIMEOUT_SEC с. Последний ответ: $(head -1 <<<"$hdr")"
  return 1
}

log "Деплой ${head:0:7} → ${target:0:7}: $(git log -1 --format=%s "$target")"
rm -f "$STATE/note"
git merge -q --ff-only "$target"
if bash scripts/deploy.sh && healthy; then
  log "Готово: ${target:0:7} работает"
  exit 0
fi

log "Деплой ${target:0:7} не удался, возвращаю ${head:0:7} ($prev_tag)"
echo "$target" > "$STATE/failed"
git reset -q --keep "$head"
if IMAGE_TAG=$prev_tag bash scripts/deploy.sh && healthy; then
  log "Откат выполнен, работает ${head:0:7}"
else
  log "ОТКАТ НЕ УДАЛСЯ: сайт может не работать. Нужен ручной разбор: docker compose ps, docker compose logs"
fi
exit 1
