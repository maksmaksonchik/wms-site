import { Sponsor, SponsorsData } from "@/types/sponsor.types";
import { LandingPage } from "@/types/landing-page.types";
import { ScheduleData } from "@/types/schedule.types";
import { SchoolIsItem } from "@/types/school-is-item.types";
import { strapi as strapiClient, StrapiClient } from "@strapi/client";

export class Strapi {
  private readonly strapiClient: StrapiClient;

  private readonly baseURL: string = process.env.API_BASE_URL || "";

  private readonly slugs = {
    landingPage: process.env.LANDING_PAGE_SLUG || "",
    schedule: process.env.SCHEDULE_SLUG || "",
    schoolIs: process.env.SCHOOL_IS_SLUG || "",
    sponsors: process.env.SPONSORS_SLUG || "",
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

  private async getData(slug: string) {
    const response = await this.strapiClient.fetch(slug, {
      cache: "no-store",
    });

    const json = await response.json();

    return json.data;
  }

  async getLandingData(): Promise<LandingPage> {
    return await this.getData(this.slugs.landingPage);
  }

  async getSchedule(documentId: string): Promise<ScheduleData> {
    return await this.getData(this.slugs.schedule + `/${documentId}`);
  }

  async getSchoolIs(): Promise<SchoolIsItem[]> {
    return await this.getData(this.slugs.schoolIs);
  }

  async getSponsors(): Promise<SponsorsData> {
    const data = await this.getData(this.slugs.sponsors);

    const result: SponsorsData = {
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
}

export const strapi = new Strapi();
