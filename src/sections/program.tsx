import Section from "@/components/section";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const modules = [
  {
    title: "Алгоритмы и доказательства",
    description:
      "Комбинаторика, олимпиадная геометрия и методы доказательств для уверенного выступления на Всеросе и ICPC.",
  },
  {
    title: "Прикладной ИИ",
    description:
      "Практикум по ML-инженерии, где участники создают рабочие прототипы на базе открытых моделей.",
  },
  {
    title: "Командные хакатоны",
    description:
      "Кросс-дисциплинарные спринты по решению реальных задач с защитой проектов перед экспертами.",
  },
];

const content = {
  id: "program",
  title: "Лекции — первопричина ЗМШ",
  description:
    "Всегда: от тех, кто хочет поделиться для тех, кто хочет узнавать новое.",
  badge: "Расписание",
};

const Program = () => {
  const { id, title, description, badge } = content;

  return (
    <Section id={id} badge={badge} title={title} description={description}>
      <div className="grid gap-6 md:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title} className="border-muted">
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default Program;
