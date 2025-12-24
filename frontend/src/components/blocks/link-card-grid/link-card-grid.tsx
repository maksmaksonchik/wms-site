import type { LinkCardGrid as LinkCardGridProps } from "@/types/blocks";
import Grid from "@/components/blocks/grid/grid";
import LinkCard from "../link-card/link-card";

const LinkCardGrid = ({ cards }: LinkCardGridProps) => {
  return (
    <Grid>
      {cards.map((card, index) => (
        <LinkCard key={index} {...card} />
      ))}
    </Grid>
  );
};

export default LinkCardGrid;
