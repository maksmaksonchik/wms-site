import { Link, StrapiImage } from "@/types/shared.types";

export type Hero = {
  id: number;
  heading: string;
  badge: string;
  dates?: string | null;
  location?: Link | null;
  background: StrapiImage;
};
