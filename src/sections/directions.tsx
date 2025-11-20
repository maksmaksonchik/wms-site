import Section from "@/components/section";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const content = {
  id: "directions",
  title: "Как добраться на ЗМШ?",
  badge: "Маршрут",
};

const faqs = [
  {
    q: "Кому подойдет смена?",
    a: "Участникам от 15 до 22 лет с интересом к математике, олимпиадам и современному IT.",
  },
  {
    q: "Что включено в взнос?",
    a: "Проживание, питание, трансфер из Екатеринбурга, образовательная и культурная программа.",
  },
  {
    q: "Как подать заявку?",
    a: "Заполните форму и пришлите портфолио до 15 декабря. Результаты отбора — 20 декабря.",
  },
];

const Directions = () => {
  const { id, title, badge } = content;

  return (
    <Section id={id} badge={badge} title={title}>
      <div className="grid gap-4 md:grid-cols-3">
        {faqs.map((faq) => (
          <Card key={faq.q} className="border-muted">
            <CardHeader>
              <CardTitle className="text-xl">{faq.q}</CardTitle>
              <CardDescription>{faq.a}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default Directions;
