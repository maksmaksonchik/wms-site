import CardLink from "@/components/card-link";
import CardsGrid from "@/components/grid";
import Section from "@/components/section";

const content = {
  id: "past",
  title: "Прошедшие школы",
  badge: "Прошедшие школы",
  links: [
    {
      label: "ЗМШ-2025",
      description: "Страница прошлого года",
      href: "https://buildin.ai/share/a3298854-6a28-4e24-abca-3db4a111f37d",
    },
    {
      label: "ЗМШ-2024",
      description: "Здесь можно найти информацию об остальных школах",
      href: "https://zmsh.notion.site/",
    },
  ],
};

const Past = () => {
  const { id, title, badge, links } = content;

  return (
    <Section id={id} title={title} badge={badge}>
      <CardsGrid>
        {links.map((stat) => (
          <CardLink
            key={stat.href}
            href={stat.href}
            label={stat.label}
            description={stat.description}
          />
        ))}
      </CardsGrid>
    </Section>
  );
};

export default Past;
