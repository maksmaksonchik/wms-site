import CallToAction from "./call-to-action/call-to-action";
import LinkCard from "./link-card/link-card";
import Schedule from "./schedule/schedule";
import ImageWithAccordion from "./image-with-accordion/image-with-accordion";
import LinkCardGrid from "./link-card-grid/link-card-grid";
import SchoolIsGallery from "./school-is-gallery/school-is-gallery";
import SponsorsGallery from "./sponsors-gallery/sponsors-gallery";
import { Block } from "@/types/blocks";

// TODO: remove any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<Block["__component"], any> = {
  "blocks.call-to-action": CallToAction,
  "blocks.image-with-accordion": ImageWithAccordion,
  "blocks.link-card": LinkCard,
  "blocks.link-card-grid": LinkCardGrid,
  "blocks.schedule": Schedule,
  "blocks.school-is-gallery": SchoolIsGallery,
  "blocks.sponsors-gallery": SponsorsGallery,
} as const;

type BlocksRendererProps = {
  blocks?: Block[] | null;
};

const BlocksRenderer = ({ blocks }: BlocksRendererProps) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map((block, index) => {
        const Component = componentMap[block.__component];

        if (!Component) {
          console.error(`Unknown block component type: ${block.__component}.`);

          return null;
        }

        return <Component key={index} {...block} />;
      })}
    </>
  );
};

export default BlocksRenderer;
