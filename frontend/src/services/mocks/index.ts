import type { LandingPage } from "@/types/landing-page.types";
import type { ScheduleData } from "@/types/schedule.types";
import type { SchoolIsItem } from "@/types/school-is-item.types";
import type { SponsorsData } from "@/types/sponsor.types";

import { landingData } from "./data/landing.mock";
import { schedule2025 } from "./data/schedule.mock";
import { schoolIsMock } from "./data/school-is.mock";
import { sponsorsMock } from "./data/sponsors.mock";

import { getScheduleMockWithDates } from "./utils/getScheduleMockWithDates";

export const strapiMock = {
  async getLandingData(): Promise<LandingPage> {
    return landingData;
  },

  async getSchedule(
    _documentId: string,
    options?: { offset?: number }
  ): Promise<ScheduleData> {
    if (!options || !options.offset) return schedule2025;

    return getScheduleMockWithDates(schedule2025, options.offset);
  },

  async getSchoolIs(): Promise<SchoolIsItem[]> {
    return schoolIsMock;
  },
  async getSponsors(): Promise<SponsorsData> {
    return sponsorsMock;
  },
};
