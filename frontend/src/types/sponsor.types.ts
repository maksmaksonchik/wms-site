import { ThemedImage } from "./shared.types";
import { StrapiImage } from "./shared.types";

export type CompanySponsor = {
  type: "company";

  /** Название компании */
  name: string;

  /** Уровень спонсора */
  level: "bronze" | "silver" | "gold" | "general";

  /** Ссылка на страницу компании */
  url?: string | null;

  /** Логотипы компании */
  logo: ThemedImage;
};

export type PersonSponsor = {
  type: "person";

  /** Имя донора */
  name: string;

  /** Аватар */
  avatar?: StrapiImage | null;
};

export type Sponsor = CompanySponsor | PersonSponsor;

export type SponsorsData = {
  general: CompanySponsor[];
  gold: CompanySponsor[];
  silver: CompanySponsor[];
  bronze: CompanySponsor[];
  personal: PersonSponsor[];
};
