export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Strapi стоит за nginx: доверять X-Forwarded-For/-Proto. Тогда Strapi видит настоящий
  // IP клиента (логи, лимиты на вход), а cookie админки получают флаг Secure (без этого
  // запрос для Strapi выглядит как http). nginx перезаписывает X-Forwarded-For адресом
  // клиента, так что подделать его нельзя. Наружу Strapi не опубликован
  proxy: { koa: env.bool('IS_PROXIED', true) },
  app: {
    keys: env.array('APP_KEYS'),
  },
});
