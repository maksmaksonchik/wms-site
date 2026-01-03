import { LinkCard as LinkCardComponent } from "./link-card.types";

type LinkCard = Omit<LinkCardComponent, "__component">;

export type LinkCardGrid = {
  __component: "blocks.link-card-grid";
  id: number;
  cards: LinkCard[];
};
