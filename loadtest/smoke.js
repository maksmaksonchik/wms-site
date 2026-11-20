// Проверка перед тестом: всё отвечает, кэш работает, /api/ закрыт.
//   k6 run loadtest/smoke.js
// Один пользователь, несколько секунд. Запускайте перед каждым тестом и после изменений
import http from "k6/http";
import { check, fail } from "k6";
import { BASE_URL, HEADERS, IMAGE_ACCEPT, baseOptions, pageAssets } from "./lib.js";

export const options = baseOptions({ vus: 1, iterations: 1 });
// 403 от /api/ здесь — ожидаемый ответ, а не сбой
http.setResponseCallback(http.expectedStatuses(200, 403));

export default function () {
  const first = http.get(`${BASE_URL}/`, { headers: HEADERS });
  if (!check(first, { "главная 200": (r) => r.status === 200 })) {
    fail(`Главная ответила ${first.status}. 444 — nginx не любит User-Agent; 429 — сработал лимит`);
  }
  const second = http.get(`${BASE_URL}/`, { headers: HEADERS });
  check(second, {
    "главная из кэша (X-Cache: HIT/STALE/UPDATING)": (r) =>
      ["HIT", "STALE", "UPDATING"].includes(r.headers["X-Cache"]),
  });

  const assets = pageAssets(first.body);
  const img = assets.find((u) => u.includes("/_next/image"));
  const js = assets.find((u) => u.includes("/_next/static/"));
  console.log(`Ресурсов на главной: ${assets.length}`);
  if (img) {
    http.get(img, { headers: { ...HEADERS, Accept: IMAGE_ACCEPT } });
    const r = http.get(img, { headers: { ...HEADERS, Accept: IMAGE_ACCEPT } });
    check(r, { "картинка 200 из кэша": (r) => r.status === 200 && r.headers["X-Cache"] === "HIT" });
  }
  if (js) {
    http.get(js, { headers: HEADERS });
    const r = http.get(js, { headers: HEADERS });
    check(r, { "статика 200 из кэша": (r) => r.status === 200 && r.headers["X-Cache"] === "HIT" });
  }

  const api = http.get(`${BASE_URL}/api/global`, { headers: HEADERS });
  // Через VPN (с адреса шлюза из allowed-ips.conf) будет 200 — тест надо гонять без VPN
  check(api, { "/api/ закрыт снаружи (403)": (r) => r.status === 403 });
}
