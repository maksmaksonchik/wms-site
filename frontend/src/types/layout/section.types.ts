import { Block } from "@/types/blocks";

export type Section = {
  id: number;
  documentId: string;
  heading: string;
  badge: string;
  anchorId?: string | null;
  description?: string | null;
  blocks?: Block[] | null;
};
