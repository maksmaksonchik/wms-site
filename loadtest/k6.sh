#!/usr/bin/env bash
# k6 из docker-образа — ставить k6 не нужно, нужен только Docker.
#   loadtest/k6.sh <сценарий.js> [опции k6 run]
#   loadtest/k6.sh smoke.js
#   loadtest/k6.sh pages.js -e BUST=1 -e RATES=2,5,10,20
# Пока тест идёт, графики — на http://localhost:5665. После теста в loadtest/results/:
# <время>-<сценарий>.html (отчёт с графиками) и .txt (итоговая таблица из консоли)
# Важно: пока вкладка с localhost:5665 открыта, k6 после теста не выходит и не печатает
# итоговую таблицу — ждёт, пока браузер отключится. Закройте вкладку (отчёт уже в .html)
set -euo pipefail
dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
script=${1:?"Укажите сценарий: smoke.js, limits.js, pages.js, visitor.js или bandwidth.js"}
shift
[[ -f $dir/$script ]] || { echo "Нет $dir/$script" >&2; exit 2; }
mkdir -p "$dir/results"
name="$(date +%Y%m%d-%H%M%S)-${script%.js}"
echo "Графики: http://localhost:5665 — после теста закройте вкладку, иначе k6 не завершится" >&2
docker run --rm -i --network host --user "$(id -u):$(id -g)" \
  -v "$dir:/lt:ro" -v "$dir/results:/results" \
  -e K6_WEB_DASHBOARD=true -e K6_WEB_DASHBOARD_PERIOD=2s \
  -e K6_WEB_DASHBOARD_EXPORT="/results/$name.html" \
  grafana/k6:2.4.0 run "$@" "/lt/$script" 2>&1 |
  { echo "# loadtest/k6.sh $script $*"; cat; } | tee "$dir/results/$name.txt"
