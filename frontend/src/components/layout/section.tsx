import { Badge } from "@/components/ui/badge";
import Container from "@/components/container";
import { Section as SectionProps } from "@/types/layout/section.types";
import { BlocksRenderer } from "../blocks";
import Markdown from "@/components/typography/markdown";

type SubsectionProps = {
  children: React.ReactNode;
  title: string;
};

const Subsection = ({ children, title }: SubsectionProps) => {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
};

const Section = ({
  anchorId,
  heading,
  description,
  badge,
  blocks,
}: SectionProps) => {
  return (
    <section id={anchorId || undefined}>
      <Container className="flex flex-col gap-8 py-20">
        <div className="space-y-3 max-w-3xl">
          <Badge variant="default">{badge}</Badge>

          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{heading}</h2>

          {description && (
            <div className="text-lg text-muted-foreground ">
              <Markdown>{description}</Markdown>
            </div>
          )}
        </div>
        <BlocksRenderer blocks={blocks} />
      </Container>
    </section>
  );
};

export { Subsection, Section };
export default Section;
