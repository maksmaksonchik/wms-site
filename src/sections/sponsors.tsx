import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Section from "@/components/section";

const content = {
  id: "sponsors",
  title: "Спонсоры ЗМШ-60",
  description: "Школа становится возможной благодаря спонсорам.",
  badge: "Спонсоры",
};

const sponsors = [
  {
    name: "Ирина Соколова",
    role: "Кандидат физ.-мат. наук, тренер сборной СПб",
    avatar: "/sponsors/irina.jpg",
  },
  {
    name: "Владимир Ким",
    role: "Senior ML Engineer, экс-Yandex",
    avatar: "/sponsors/vladimir.jpg",
  },
  {
    name: "Мария Орлова",
    role: "Организатор ЗМШ, наставник призеров IMO",
    avatar: "/sponsors/maria.jpg",
  },
];

const Sponsors = () => {
  const { id, title, description, badge } = content;

  return (
    <Section id={id} badge={badge} title={title} description={description}>
      <div className="grid gap-6 md:grid-cols-3">
        {sponsors.map((mentor) => (
          <Card key={mentor.name} className="border-muted">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback>
                  {mentor.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{mentor.name}</CardTitle>
                <CardDescription>{mentor.role}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default Sponsors;
