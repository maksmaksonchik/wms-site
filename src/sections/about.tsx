import Section from "@/components/section";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const content = {
  id: "about",
  title: "Что такое ЗМШ?",
  description:
    "ЗМШ — мультидисциплинарный лекторий для математиков, программистов и сочувствующих единомышленников.",
  badge: "О нас",
  stats: [
    { value: "200+", label: "ЗМШат ежегодно" },
    { value: "8", label: "дней с друзьями" },
    { value: "30+", label: "лекторов" },
  ],
};

const About = () => {
  const { id, title, description, badge } = content;

  return (
    <Section id={id} title={title} badge={badge} description={description}>
      <div className="grid gap-6 md:grid-cols-3">
        {content.stats.map((stat) => (
          <Card key={stat.label} className="border-muted">
            <CardHeader>
              <CardTitle className="text-4xl font-semibold">
                {stat.value}
              </CardTitle>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default About;
