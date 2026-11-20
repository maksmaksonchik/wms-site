// Посетитель целиком: страница + всё, что грузит браузер (скрипты, стили, ~100 картинок).
// Частота — посетителей в секунду. Показывает, во что упирается сайт при реальном
// трафике: канал, nginx или оптимизатор картинок (при пустом кэше).
//   k6 run loadtest/visitor.js
//   k6 run -e RATES=2,5,10,20 -e STEP=2m loadtest/visitor.js
// Нужен адрес в limit-exempt.conf и ignoreip fail2ban (loadtest/README.md)
import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { BASE_URL, HEADERS, IMAGE_ACCEPT, baseOptions, steppedArrival, pageAssets, assetTag } from "./lib.js";

const PATHS = (__ENV.PATHS || "/").split(",");
// Время «открыл страницу — догрузилось всё» (без отрисовки, только сеть и сервер)
const pageLoad = new Trend("page_full_load", true);

export const options = baseOptions({
  scenarios: { visitors: steppedArrival("1,2,5,10,20") },
  // Браузер по HTTP/2 запрашивает десятки ресурсов разом; у k6 по умолчанию 6
  batch: 30,
  batchPerHost: 30,
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: false }],
    page_full_load: [{ threshold: "p(95)<5000", abortOnFail: false }],
  },
});

export default function () {
  const path = PATHS[__ITER % PATHS.length];
  const started = Date.now();
  const page = http.get(`${BASE_URL}${path}`, { headers: HEADERS, tags: { name: path } });
  if (!check(page, { "страница 200": (r) => r.status === 200 })) return;

  // Как браузер по HTTP/2: все ресурсы параллельно по одному соединению
  const requests = pageAssets(page.body).map((url) => {
    const tag = assetTag(url);
    const headers = tag === "_next/image" ? { ...HEADERS, Accept: IMAGE_ACCEPT } : HEADERS;
    return { method: "GET", url, params: { headers, responseType: "none", tags: { name: tag } } };
  });
  const responses = http.batch(requests);
  check(responses, { "все ресурсы 200": (rs) => rs.every((r) => r.status === 200) });
  pageLoad.add(Date.now() - started);
}
