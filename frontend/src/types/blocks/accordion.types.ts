type AccordionItem = {
  id: number;
  trigger: string;
  content: string;
};

export type Accordion = {
  __component: "blocks.accordion";
  id: number;
  items: AccordionItem[];
};
