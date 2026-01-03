import { StrapiImage } from "./shared.types";

export type SchoolIsItem = {
  id: number;
  documentId: string;
  name: string;
  credentials: string;
  definition: string;
  avatar: StrapiImage;
  isHidden: boolean;
};
