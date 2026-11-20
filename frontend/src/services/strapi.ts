import { Sponsor, SponsorsData } from "@/types/sponsor.types";
import { LandingPage } from "@/types/landing-page.types";
import { ScheduleData } from "@/types/schedule.types";
import { SchoolIsItem } from "@/types/school-is-item.types";
import { strapi as strapiClient, StrapiClient } from "@strapi/client";
import { getSortedSchedule } from "./utils/getSortedSchedule";
import { Article } from "@/types/article.types";
import { Global } from "@/types/global.types";

// Ответы Strapi кэшируются в памяти процесса Next на STRAPI_CACHE_TTL секунд (0 — без
// кэша; по умолчанию 30, в npm run dev — 0). Один рендер — это ~6 запросов в Strapi, и без кэша Strapi с Postgres тратили на
// них больше CPU, чем сам рендер (loadtest/README.md, «Результаты»). Цена — правки из
// админки появляются на сайте с задержкой до TTL (+10 с микрокэша nginx).
// Одновременные запросы одного адреса ждут один ответ. Ошибки не кэшируются.
// Число записей ограничено: адреса статей приходят от посетителей (/<slug>), и
// перебор несуществующих не должен раздувать память
const CACHE_TTL_MS =
  Number(
    process.env.STRAPI_CACHE_TTL ??
      (process.env.NODE_ENV === "production" ? 30 : 0)
  ) * 1000;
const CACHE_MAX_ENTRIES = 500;

type CacheEntry = { expires: number; data: Promise<unknown> };

export class Strapi {
  private readonly strapiClient: StrapiClient;

  private readonly cache = new Map<string, CacheEntry>();

  private readonly baseURL: string = process.env.API_BASE_URL || "";

  private readonly slugs = {
    global: process.env.GLOBAL_SLUG || "/global",
    landingPage: process.env.LANDING_PAGE_SLUG || "/landing-page",
    schedule: process.env.SCHEDULE_SLUG || "/schedules",
    schoolIs: process.env.SCHOOL_IS_SLUG || "/school-is-items",
    sponsors: process.env.SPONSORS_SLUG || "/sponsors",
    articles: process.env.ARTICLES_SLUG || "/articles",
  };

  constructor() {
    if (!this.baseURL) {
      throw new Error("API_BASE_URL environment variable is not set");
    }

    Object.entries(this.slugs).forEach(([key, value]) => {
      if (!value) {
        throw new Error(`${key} slug environment variable is not set`);
      }
    });

    this.strapiClient = strapiClient({
      baseURL: this.baseURL,
    });
  }

  private async getData(
    slug: string,
    options?: RequestInit & { query?: Record<string, string | number> }
  ) {
    const { query, ...initOptions } = options ?? {};
    const params = new URLSearchParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        params.append(key, String(value));
      });
    }

    const url = params.toString() ? `${slug}?${params.toString()}` : slug;

    const init: RequestInit = {
      cache: "no-store",
      ...initOptions,
    };

    if (CACHE_TTL_MS <= 0) {
      return this.fetchData(url, init);
    }

    const now = Date.now();
    const cached = this.cache.get(url);
    let data: Promise<unknown>;

    if (cached && cached.expires > now) {
      data = cached.data;
    } else {
      data = this.fetchData(url, init);
      // delete + set переносит адрес в конец Map: первой вытесняется самая старая запись
      this.cache.delete(url);
      this.cache.set(url, { expires: now + CACHE_TTL_MS, data });
      data.catch(() => {
        if (this.cache.get(url)?.data === data) this.cache.delete(url);
      });

      if (this.cache.size > CACHE_MAX_ENTRIES) {
        this.cache.delete(this.cache.keys().next().value!);
      }
    }

    // Копия: объект из кэша делят все рендеры, изменение в одном не должно попасть в другие
    return structuredClone(await data);
  }

  private async fetchData(url: string, init: RequestInit) {
    const response = await this.strapiClient.fetch(url, init);
    const json = await response.json();

    return json.data;
  }

  async getGlobal(): Promise<Global> {
    return await this.getData(this.slugs.global);
  }

  async getLandingData(): Promise<LandingPage> {
    return await this.getData(this.slugs.landingPage);
  }

  async getSchedule(documentId: string): Promise<ScheduleData> {
    const scheduleData: ScheduleData = await this.getData(
      this.slugs.schedule + `/${documentId}`
    );

    return getSortedSchedule(scheduleData);
  }

  async getSchoolIs(): Promise<SchoolIsItem[]> {
    return await this.getData(this.slugs.schoolIs, {
      query: { "pagination[pageSize]": 100 },
    });
  }

  async getSponsors(): Promise<SponsorsData> {
    const data = await this.getData(this.slugs.sponsors,{
      query: { "pagination[pageSize]": 100 },
    });

    const result: SponsorsData = {
      general: [],
      gold: [],
      silver: [],
      bronze: [],
      personal: [],
    };

    data.forEach((sponsor: Sponsor) => {
      if (sponsor.type === "person") {
        result.personal.push(sponsor);
      }

      if (sponsor.type === "company") {
        result[sponsor.level].push(sponsor);
      }
    });

    return result;
  }

  async getArticle(slug: string): Promise<Article | null> {
    const articles: Article[] | null | undefined = await this.getData(
      this.slugs.articles,
      {
        query: { "filters[slug][$eq]": slug },
      }
    );

    if (!articles || articles.length !== 1) return null;

    return articles[0];
  }
}

export const strapi = new Strapi();
