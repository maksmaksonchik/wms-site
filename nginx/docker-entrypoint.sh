#!/bin/sh
set -e

if [ -f /etc/nginx/templates/default.conf.template ]; then
    envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

(
    while sleep 21600; do
        echo "[INFO] Reloading Nginx due to cert renewal..."
        nginx -s reload 2>/dev/null || true
    done
) &

exec "$@"