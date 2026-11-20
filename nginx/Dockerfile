FROM nginx:1.30-alpine

RUN apk add --no-cache logrotate
COPY logrotate.conf /etc/logrotate.d/nginx
# logrotate игнорирует конфиги, доступные на запись группе или всем
RUN chmod 0644 /etc/logrotate.d/nginx

COPY nginx-main.conf /etc/nginx/nginx.conf
COPY proxy-front.conf /etc/nginx/proxy-front.conf
# Запасная копия: в compose файл монтируется из репозитория, чтобы править без пересборки
COPY limit-exempt.conf /etc/nginx/limit-exempt.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
