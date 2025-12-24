import Grid from "@/components/blocks/grid/grid";
import Accordion from "@/components/blocks/accordion/accordion";
import Image from "@/components/blocks/image/image";
import { ImageWithAccordion as ImageWithAccordionProps } from "@/types/blocks/image-with-accordion.types";

const ImageWithAccordion = ({
  accordion,
  image,
  isReversed,
}: ImageWithAccordionProps) => {
  return (
    <Grid
      type="fixed"
      cols={2}
      className={isReversed ? "flex-row-reverse" : ""}
    >
      <Image {...image} />
      <Accordion {...accordion} />
    </Grid>
  );
};

export default ImageWithAccordion;
