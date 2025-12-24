import { StrapiImage } from "../shared.types";

export type Image = {
  __component: "blocks.image";
  id: number;
  src: StrapiImage;
  alt: string;
};
