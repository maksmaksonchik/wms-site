import CardLink from "@/components/card-link";
import CardsGrid from "@/components/cards-grid";
import Section from "@/components/section";
import { siteConfig } from "@/config/site.config";

const content = {
  id: "about",
  title: "Что такое ЗМШ?",
  description:
    "ЗМШ — мультидисциплинарный лекторий для математиков, программистов и сочувствующих единомышленников.",
  badge: "О нас",
  links: [
    {
      label: "Телеграм-канал школы",
      href: siteConfig.footerLink.href,
      description: "Новости ЗМШ",
    },
    {
      label: "Правила ЗМШ",
      href: "https://buildin.ai/share/6c9cfa4b-33f1-4554-88e5-dad27ce7941b",
      description: "Что нужно знать перед поездкой",
    },
  ],
};

const About = () => {
  const { id, title, description, badge, links } = content;

  return (
    <Section id={id} title={title} badge={badge} description={description}>
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

export default About;
