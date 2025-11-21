import Section from "@/components/section";
import Schedule from "@/components/schedule/schedule";
import { schedule2025 } from "@/components/schedule/schedule_2025.mock";

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
      <Schedule schedule={schedule2025} />
    </Section>
  );
};

export default Program;
