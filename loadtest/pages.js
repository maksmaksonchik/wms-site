// Сколько HTML-страниц в секунду выдерживает сайт.
//   k6 run loadtest/pages.js                       — из кэша nginx (так видят сайт посетители)
//   k6 run -e BUST=1 loadtest/pages.js             — мимо кэша nginx: каждый запрос — новый
//                                                    рендер в Next (ответы Strapi Next кэширует
//                                                    сам, STRAPI_CACHE_TTL во frontend/.env)
//   -e PATHS=/,/some-article                       — какие страницы (по кругу)
//   -e RATES=5,10,20,40 -e STEP=2m                 — ступени, запросов в секунду
// Нужен адрес в nginx/limit-exempt.conf и в ignoreip fail2ban (loadtest/README.md),
// иначе тест упрётся в лимит 10 запросов/с с одного IP, а потом в бан. Для BUST=1 это
// обязательно: обход кэша по заголовку X-Loadtest-Bust nginx разрешает только таким адресам
import http from "k6/http";
import { check } from "k6";
import { BASE_URL, HEADERS, baseOptions, steppedArrival } from "./lib.js";

const PATHS = (__ENV.PATHS || "/").split(",");
const BUST = __ENV.BUST === "1";

export const options = baseOptions({
  scenarios: {
    pages: steppedArrival(BUST ? "2,5,10,20,40" : "50,100,200,400,800"),
  },
});

export default function () {
  const path = PATHS[__ITER % PATHS.length];
  // Параметрами запроса кэш не обойти: nginx их отбрасывает (nginx/nginx.conf, $front_args)
  const res = http.get(`${BASE_URL}${path}`, {
    headers: BUST ? { ...HEADERS, "X-Loadtest-Bust": "1" } : HEADERS,
    responseType: "none",
    tags: { name: BUST ? `${path} (мимо кэша)` : path },
  });
  check(res, {
    "200": (r) => r.status === 200,
    // Без адреса в limit-exempt.conf заголовок не действует, и тест молча меряет кэш
    ...(BUST ? { "мимо кэша (X-Cache: BYPASS)": (r) => r.headers["X-Cache"] === "BYPASS" } : {}),
    "не 503 (max_conns)": (r) => r.status !== 503,
    "не 429 (лимит IP)": (r) => r.status !== 429,
  });
}
