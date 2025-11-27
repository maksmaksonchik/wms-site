import { Badge } from "./ui/badge";

type Props = {
  id: string; // уникальный идентификатор для навигации
  title: string; // заголовок секции
  description?: string; // текст в секции
  badge: string; // текст для бейджа в секции
  children?: React.ReactNode;
};

const Section = ({ id, title, description, badge, children }: Props) => {
  return (
    <section
      id={id}
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="space-y-3 max-w-3xl">
        <Badge variant="default">{badge}</Badge>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="text-lg text-muted-foreground ">{description}</p>
      </div>
      {children}
    </section>
  );
};

export default Section;
