import { Link } from "@/types/shared.types";

export type CallToAction = {
  __component: "blocks.call-to-action";
  id: number;
  title: string;
  description?: string | null;
  button: Link;
};
