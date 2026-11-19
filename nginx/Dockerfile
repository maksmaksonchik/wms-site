FROM nginx:1.30-alpine

RUN apk add --no-cache logrotate
COPY logrotate.conf /etc/logrotate.d/nginx
# logrotate игнорирует конфиги, доступные на запись группе или всем
RUN chmod 0644 /etc/logrotate.d/nginx

COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
