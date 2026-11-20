// Общее для сценариев k6. Настройки — через переменные окружения (-e ИМЯ=значение):
//   BASE_URL  адрес сайта (по умолчанию https://zmsh.space)
//   INSECURE  1 — не проверять сертификат (локальный stage с самоподписанным)
//   RATES     ступени нагрузки через запятую, в запросах (или посещениях) в секунду
//   STEP      сколько держать каждую ступень (по умолчанию 2m)
//   MAX_VUS   потолок одновременных виртуальных пользователей (по умолчанию 200)
import { parseHTML } from "k6/html";

export const BASE_URL = (__ENV.BASE_URL || "https://zmsh.space").replace(/\/$/, "");

// nginx отвечает 444 на пустой и «скриптовый» User-Agent (curl, python-requests…),
// поэтому представляемся браузером, но с пометкой — чтобы найти себя в логах
export const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 zmsh-loadtest",
  Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
  "Accept-Language": "ru,en;q=0.8",
  // Без этого Next отдаёт HTML несжатым (~400 КБ вместо ~60), и тест мерит не тот трафик.
  // k6 сам распаковывает ответ
  "Accept-Encoding": "gzip, deflate, br",
};

export const IMAGE_ACCEPT = "image/avif,image/webp,image/apng,*/*;q=0.8";

export function baseOptions(extra = {}) {
  return {
    insecureSkipTLSVerify: __ENV.INSECURE === "1",
    // Ответы с ошибкой не считаем поводом остановиться: цель — увидеть, где ломается
    thresholds: {
      http_req_failed: [{ threshold: "rate<0.01", abortOnFail: false }],
      http_req_duration: [{ threshold: "p(95)<1000", abortOnFail: false }],
    },
    summaryTrendStats: ["avg", "med", "p(90)", "p(95)", "p(99)", "max"],
    ...extra,
  };
}

// Ступенчатая нагрузка с заданной частотой (открытая модель): k6 запускает новые
// итерации с нужной скоростью, даже если сервер начал тормозить, — как настоящие
// посетители, которые не ждут друг друга. Каждая ступень: 30 с разгон + STEP удержание
export function steppedArrival(defaultRates, exec = "default") {
  const rates = (__ENV.RATES || defaultRates).split(",").map(Number);
  const step = __ENV.STEP || "2m";
  const stages = [];
  for (const r of rates) {
    stages.push({ target: r, duration: "30s" }, { target: r, duration: step });
  }
  stages.push({ target: 0, duration: "10s" });
  return {
    executor: "ramping-arrival-rate",
    exec,
    startRate: rates[0],
    timeUnit: "1s",
    preAllocatedVUs: Math.min(50, Number(__ENV.MAX_VUS || 200)),
    maxVUs: Number(__ENV.MAX_VUS || 200),
    stages,
  };
}

// Из HTML страницы — ресурсы, которые загрузил бы браузер: скрипты, стили и картинки.
// Для картинки из srcset берём вариант не шире 1200px (типичный экран), а не самый большой
export function pageAssets(html) {
  const doc = parseHTML(html);
  const urls = new Set();
  doc.find("script[src]").each((_, el) => urls.add(el.getAttribute("src")));
  doc.find('link[rel="stylesheet"]').each((_, el) => urls.add(el.getAttribute("href")));
  doc.find("img").each((_, el) => {
    const srcset = el.getAttribute("srcset");
    let chosen = el.getAttribute("src");
    if (srcset) {
      const candidates = srcset.split(",").map((s) => {
        const [url, size] = s.trim().split(/\s+/);
        return { url, w: parseInt(size, 10) || 0 };
      });
      const fitting = candidates.filter((c) => c.w <= 1200).sort((a, b) => b.w - a.w);
      chosen = (fitting[0] || candidates[0]).url;
    }
    if (chosen) urls.add(chosen.replace(/&amp;/g, "&"));
  });
  return [...urls]
    .filter((u) => u && !u.startsWith("data:"))
    .map((u) => (u.startsWith("http") ? u : BASE_URL + u))
    .filter((u) => u.startsWith(BASE_URL));
}

// Группировка в отчёте: без этого каждая картинка — отдельная строка метрик
export function assetTag(url) {
  if (url.includes("/_next/image")) return "_next/image";
  if (url.includes("/_next/static/")) return "_next/static";
  if (url.includes("/uploads/")) return "uploads";
  return "other";
}
