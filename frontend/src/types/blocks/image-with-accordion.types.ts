import { Accordion as AccordionComponent } from "./accordion.types";
import { Image as ImageComponent } from "./image.types";

type Accordion = Omit<AccordionComponent, "__component">;
type Image = Omit<ImageComponent, "__component">;

export type ImageWithAccordion = {
  __component: "blocks.image-with-accordion";
  id: number;
  image: Image;
  accordion: Accordion;
  isReversed: boolean;
};
