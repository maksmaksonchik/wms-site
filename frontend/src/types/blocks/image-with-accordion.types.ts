import { Accordion } from "./accordion.types";
import { Image } from "./image.types";

export type ImageWithAccordion = {
  __component: "blocks.image-with-accordion";
  id: number;
  image: Image;
  accordion: Accordion;
  isReversed: boolean;
};
