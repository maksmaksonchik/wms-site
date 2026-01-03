#!/bin/sh
set -e

if [ -f /etc/nginx/templates/default.conf.template ]; then
    defined_envs=$(printf '${%s} ' $(awk "END { for (name in ENVIRON) { print ( name ~ /${filter}/ ) ? name : \"\" } }" < /dev/null ))
    envsubst "$defined_envs" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

(
    while sleep 21600; do
        echo "[INFO] Reloading Nginx due to cert renewal..."
        nginx -s reload 2>/dev/null || true
    done
) &

exec "$@"