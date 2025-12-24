import { StrapiImage } from "./shared.types";

export type SchoolIsItem = {
  name: string;
  credentials: string;
  definition: string;
  avatar: StrapiImage;
  isHidden: boolean;
};
