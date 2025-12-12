import { Sponsor } from "@/types/sponsors.types";
import { sponsors } from "./data/sponsors";
import { donators } from "./data/donators";

export const sponsorsMock = {
  getSponsors: (level?: Sponsor["level"]) => {
    if (!level) return sponsors;

    return sponsors.filter((sponsor) => sponsor.level === level);
  },

  getDonators: () => {
    return donators;
  },
};
