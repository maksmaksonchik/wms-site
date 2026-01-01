import { Sponsor, SponsorsData } from "@/types/sponsor.types";
import { LandingPage } from "@/types/landing-page.types";
import { ScheduleData } from "@/types/schedule.types";
import { SchoolIsItem } from "@/types/school-is-item.types";
import { strapi as strapiClient, StrapiClient } from "@strapi/client";

export class Strapi {
  private readonly strapiClient: StrapiClient;

  private readonly baseURL: string = process.env.API_BASE_URL || "";

  private readonly slugs: Record<string, string> = {
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
      //   auth: process.env.STRAPI_ADMIN_TOKEN,
    });
  }

  async getLandingData(): Promise<LandingPage> {
    const response = await this.strapiClient.fetch(this.slugs.landingPage);
    const json = await response.json();
    return json.data;
  }

  async getSchedule(documentId: string): Promise<ScheduleData> {
    const response = await this.strapiClient.fetch(
      this.slugs.schedule + `/${documentId}`
    );

    const json = await response.json();
    return json.data;
  }

  async getSchoolIs(): Promise<SchoolIsItem[]> {
    const response = await this.strapiClient.fetch(this.slugs.schoolIs);
    const json = await response.json();
    return json.data;
  }

  async getSponsors(): Promise<SponsorsData> {
    const response = await this.strapiClient.fetch(this.slugs.sponsors);
    const json = await response.json();

    const sponsorsData: SponsorsData = {
      gold: [],
      silver: [],
      bronze: [],
      personal: [],
    };

    json.data.forEach((sponsor: Sponsor) => {
      if (sponsor.type === "person") {
        sponsorsData.personal.push(sponsor);
      }

      if (sponsor.type === "company") {
        sponsorsData[sponsor.level].push(sponsor);
      }
    });

    return sponsorsData;
  }
}

export const strapi = new Strapi();
