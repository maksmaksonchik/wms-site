#!/usr/bin/env python3
"""Разбивка результата k6 по ступеням нагрузки (итоговая таблица k6 их смешивает).

    python3 loadtest/steps.py results/<отчёт>.html --rates 2,5,10,20,40 [--step 2m]

--rates и --step — те же, что передавались тесту (RATES и STEP). Данные берутся из
HTML-отчёта k6.sh: в нём лежат снимки метрик каждые 2 с. Для каждой ступени считается
только удержание, без 30 с разгона. Только стандартная библиотека Python.
"""
import argparse
import base64
import gzip
import json
import re
import statistics


def seconds(s):
    m = re.fullmatch(r"(\d+(?:\.\d+)?)(ms|s|m|h)?", s.strip())
    if not m:
        raise argparse.ArgumentTypeError(f"не понимаю длительность {s!r}: нужно 30s, 2m, 1h")
    return float(m.group(1)) * {"ms": 0.001, "s": 1, "m": 60, "h": 3600, None: 1}[m.group(2)]


def load(path):
    html = open(path, encoding="utf-8").read()
    m = re.search(r'<script id="data"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        raise SystemExit(f"{path}: нет данных отчёта k6 (script#data)")
    events = [json.loads(l) for l in gzip.decompress(base64.b64decode(m.group(1).strip())).decode().splitlines()]
    # Метрики объявляются событиями "metric" по ходу теста (свои — при первом значении),
    # а снимок — значения всех объявленных к этому моменту метрик по алфавиту имён.
    # Поэтому индексы считаем заново по мере появления метрик
    names, snaps = set(), []
    for e in events:
        if e["event"] == "metric":
            names.update(e["data"])
        elif e["event"] == "snapshot":
            snaps.append(dict(zip(sorted(names), e["data"])))
    return snaps

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("report")
    ap.add_argument("--rates", required=True, help="ступени через запятую, как RATES")
    ap.add_argument("--step", type=seconds, default=seconds("2m"), help="удержание ступени, как STEP (2m)")
    args = ap.parse_args()
    rates = [float(x) for x in args.rates.split(",")]

    snaps = load(args.report)
    t = lambda sn: sn["time"][0] / 1000
    reqs, failed, dur, vus = "http_reqs", "http_req_failed", "http_req_duration", "vus"
    t0 = t(snaps[0]) - 2  # первый снимок — конец первого 2-секундного периода

    print(f"{'ступень':>7} {'цель/с':>6} {'факт/с':>6} {'успешн/с':>8} {'ошибки':>6} {'p50':>7} {'p95':>7} {'VU':>4}")
    for i, rate in enumerate(rates):
        a, z = t0 + i * (30 + args.step) + 30, t0 + (i + 1) * (30 + args.step)
        w = [sn for sn in snaps if a < t(sn) <= z and sn.get(reqs, [0])[0]]
        if not w:
            print(f"{i + 1:>7} {rate:>6g}   нет данных (тест прерван раньше?)")
            continue
        n = sum(sn[reqs][0] for sn in w)
        fail = sum(sn[reqs][0] * sn[failed][0] for sn in w) / n
        # Перцентили — медиана по 2-секундным снимкам: устойчиво к единичным выбросам
        p50 = statistics.median(sn[dur][2] for sn in w)
        p95 = statistics.median(sn[dur][5] for sn in w)
        vu = max(sn[vus][0] for sn in w)
        print(f"{i + 1:>7} {rate:>6g} {n / (z - a):>6.1f} {n * (1 - fail) / (z - a):>8.1f} "
              f"{fail * 100:>5.0f}% {p50:>5.0f}ms {p95:>5.0f}ms {vu:>4g}")
    print("\nфакт/с — сколько запросов отправлено; успешн/с — сколько из них 200 (это и есть пропускная")
    print("способность); ошибки — 503 (max_conns), 429 и прочие; VU — пик одновременных запросов")


if __name__ == "__main__":
    main()
