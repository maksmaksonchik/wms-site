#!/usr/bin/env bash
# Шлюз: забрать бэкапы с ВМ сайта к себе. Ставится setup.sh vpn в
# /usr/local/sbin/wms-backup-pull и запускается таймером wms-backup-pull.timer
# от пользователя wms-backup. Настройки — /etc/default/wms-backup-pull.
#
# Копии тянет шлюз, а не толкает сайт: ВМ сайта смотрит в интернет, и если её
# взломают, она не сможет ни стереть, ни подменить то, что уже лежит здесь.
# Ключ шлюза на сайте ограничен rrsync -ro: только чтение каталога бэкапов.
#
# Падает (и видно в systemctl --failed), если свежего бэкапа нет дольше MAX_AGE_HOURS.
set -euo pipefail

: "${PULL_FROM:?нужен вида wms-backup-pull@192.168.0.1}"
DEST=${DEST:-/var/backups/wms-site}
KEEP_DAYS=${KEEP_DAYS:-14}
MIN_KEEP=${MIN_KEEP:-3}
MAX_AGE_HOURS=${MAX_AGE_HOURS:-36}
KEY=${KEY:-$HOME/.ssh/id_ed25519}

list_backups() {
  find "$DEST" -mindepth 1 -maxdepth 1 -type d -name '20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]_[0-9]*' \
    ! -name '*.partial' -printf '%f\n' | LC_ALL=C sort
}

umask 077
mkdir -p "$DEST"

# Без --delete: удаление на сайте не стирает копии здесь. -t сохраняет время,
# по нему считается срок хранения. Недописанные (*.partial) не берём
rsync -rt --chmod=D0700,F0600 --exclude '*.partial' --exclude '.lock' \
  -e "ssh -i $KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20" \
  "$PULL_FROM:./" "$DEST/"

mapfile -t all < <(list_backups)
[[ ${#all[@]} -gt 0 ]] || { echo "Бэкапов нет ни одного" >&2; exit 1; }
newest=${all[-1]}
(cd "$DEST/$newest" && sha256sum -c --quiet SHA256SUMS) \
  || { echo "Контрольные суммы $newest не сошлись" >&2; exit 1; }

# Срок хранения, но min_keep самых свежих не трогаем никогда
for ((i = 0; i < ${#all[@]} - MIN_KEEP; i++)); do
  if [[ -n $(find "$DEST/${all[i]}" -maxdepth 0 -mtime "+$KEEP_DAYS") ]]; then
    rm -rf -- "${DEST:?}/${all[i]}"
    echo "Удалён старый бэкап ${all[i]}"
  fi
done

echo "Последний бэкап: $newest, всего: $(list_backups | wc -l), занято: $(du -sh "$DEST" | cut -f1)"
if [[ -z $(find "$DEST/$newest" -maxdepth 0 -mmin "-$((MAX_AGE_HOURS * 60))") ]]; then
  echo "Последнему бэкапу больше $MAX_AGE_HOURS ч: на ВМ сайта не работает wms-backup.timer?" >&2
  exit 1
fi
