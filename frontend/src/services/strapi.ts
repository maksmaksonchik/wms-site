import { Sponsor, SponsorsData } from "@/types/sponsor.types";
import { LandingPage } from "@/types/landing-page.types";
import { ScheduleData } from "@/types/schedule.types";
import { SchoolIsItem } from "@/types/school-is-item.types";
import { strapi as strapiClient, StrapiClient } from "@strapi/client";
import { getSortedSchedule } from "./utils/getSortedSchedule";
import { Article } from "@/types/article.types";
import { Global } from "@/types/global.types";

export class Strapi {
  private readonly strapiClient: StrapiClient;

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
    const data = await this.getData(this.slugs.sponsors);

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
