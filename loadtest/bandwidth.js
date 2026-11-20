// Пропускная способность канала: параллельно качаем большой оригинал из /uploads.
// Смотрите строку data_received (МБ/с) и график сети в Netdata. Результат — минимум
// из канала сервера и вашего домашнего интернета (проверьте его speedtest'ом заранее).
//   k6 run -e FILE=/uploads/<имя файла> -e VUS=8 -e DURATION=1m loadtest/bandwidth.js
// Без адреса в limit-exempt.conf тест покажет лимит nginx: 4 скачивания и ~1 МБ/с на каждое
import http from "k6/http";
import { check } from "k6";
import { BASE_URL, HEADERS, baseOptions } from "./lib.js";

if (!__ENV.FILE) throw new Error("Задайте -e FILE=/uploads/<большой файл>");

export const options = baseOptions({
  vus: Number(__ENV.VUS || 8),
  duration: __ENV.DURATION || "1m",
  thresholds: {},
});

export default function () {
  const res = http.get(`${BASE_URL}${__ENV.FILE}`, {
    headers: HEADERS,
    responseType: "none",
    timeout: "120s",
    tags: { name: "uploads" },
  });
  check(res, { "200": (r) => r.status === 200 });
}
