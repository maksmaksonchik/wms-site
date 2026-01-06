import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion as AccordionUi,
} from "@/components/ui/accordion";
import { Card, CardTitle } from "@/components/ui/card";
import { Accordion as AccordionProps } from "@/types/blocks";
import Markdown from "@/components/typography/markdown";

const Accordion = ({ items }: AccordionProps) => {
  return (
    <AccordionUi type="single" collapsible className="space-y-4">
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-0">
          <Card className="p-0 gap-2">
            <AccordionTrigger className="items-center p-6 cursor-pointer">
              <CardTitle className="text-lg">{item.trigger}</CardTitle>
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 text-muted-foreground">
              <Markdown>{item.content}</Markdown>
            </AccordionContent>
          </Card>
        </AccordionItem>
      ))}
    </AccordionUi>
  );
};

export default Accordion;
