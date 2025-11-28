import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Section from "@/components/section";
import CardsGrid from "@/components/cards-grid";
import CardLink from "@/components/card-link";

const content = {
  id: "sponsors",
  title: "Спонсоры",
  description: "Школа становится возможной благодаря спонсорам.",
  badge: "Поддержать ЗМШ",
};

const sponsors = [
  {
    name: "Максим Ефремов",
    avatar: "/sponsors/efremov.jpg",
  },
  {
    name: "Владимир Гордеев",
  },
  {
    name: "Саня Романов",
    avatar: "/sponsors/romanov.jpg",
  },
  {
    name: "Матвей Незнаев",
    avatar: "/sponsors/neznaev.jpg",
  },

  {
    name: "Александр Суворов",
  },
  {
    name: "Дмитрий Костин",
  },
];

const links = [
  {
    label: "Стать спонсором",
    href: "https://buildin.ai/share/01b2ecbb-ae39-4354-8b1b-77b3fc10396a",
  },
  {
    label: "Пакеты для бизнеса",
    href: "https://buildin.ai/share/3c5dcb3d-c7e0-4f1d-865b-e7de6304a1b4",
  },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("");

const Sponsors = () => {
  const { id, title, description, badge } = content;

  return (
    <Section id={id} badge={badge} title={title} description={description}>
      <CardsGrid>
        {links.map((stat) => (
          <CardLink key={stat.href} href={stat.href} label={stat.label} />
        ))}
      </CardsGrid>
      <h3 className="text-xl font-semibold">Спонсоры ЗМШ-60:</h3>
      <CardsGrid>
        {sponsors.map((mentor) => (
          <Card key={mentor.name}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback>{getInitials(mentor.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{mentor.name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </CardsGrid>
    </Section>
  );
};

export default Sponsors;
