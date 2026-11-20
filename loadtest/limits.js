// Проверка защиты с обычного адреса (НЕ в limit-exempt.conf): лимиты nginx должны
// отвечать 429. Запросов меньше порога fail2ban (100 за минуту), так что бана не будет,
// если не запускать чаще раза в минуту.
//   k6 run loadtest/limits.js
import http from "k6/http";
import { check } from "k6";
import { BASE_URL, HEADERS, baseOptions } from "./lib.js";

export const options = baseOptions({ vus: 1, iterations: 1, thresholds: {}, batch: 60, batchPerHost: 60 });

export default function () {
  // 60 запросов разом: пройдут ~40 (burst) + сколько успеет набежать по 10/с
  const pages = http.batch(
    Array.from({ length: 60 }, () => ["GET", `${BASE_URL}/`, null, { headers: HEADERS, responseType: "none" }]),
  );
  const limited = pages.filter((r) => r.status === 429).length;
  console.log(`Страницы: из 60 разом получили 429 — ${limited}`);
  check(null, { "лимит частоты страниц срабатывает": () => limited > 0 });

  if (__ENV.FILE) {
    // 8 одновременных скачиваний оригинала: пройдут 4
    const files = http.batch(
      Array.from({ length: 8 }, () => [
        "GET",
        `${BASE_URL}${__ENV.FILE}`,
        null,
        { headers: HEADERS, responseType: "none", timeout: "120s" },
      ]),
    );
    const rejected = files.filter((r) => r.status === 429).length;
    console.log(`Оригиналы: из 8 одновременно получили 429 — ${rejected}`);
    check(null, { "лимит скачиваний оригиналов срабатывает": () => rejected > 0 });
  }
}
