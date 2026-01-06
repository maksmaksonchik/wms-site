import { Block } from "./blocks";

export type Article = {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  blocks?: Block[] | null;
};
