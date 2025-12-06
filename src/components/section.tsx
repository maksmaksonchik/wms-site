import { Badge } from "./ui/badge";
import Container from "./container";

type SectionProps = {
  id: string; // уникальный идентификатор для навигации
  title: string; // заголовок секции
  description?: string; // текст в секции
  badge: string; // текст для бейджа в секции
  children?: React.ReactNode;
};

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

const Section = ({ id, title, description, badge, children }: SectionProps) => {
  return (
    <section id={id}>
      <Container className="flex flex-col gap-8 py-20">
        <div className="space-y-3 max-w-3xl">
          <Badge variant="default">{badge}</Badge>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
          <p className="text-lg text-muted-foreground ">{description}</p>
        </div>
        {children}
      </Container>
    </section>
  );
};

export { Subsection, Section };
export default Section;
