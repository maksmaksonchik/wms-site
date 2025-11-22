import Section from "@/components/section";
import Schedule from "@/components/schedule/schedule";
import { scheduleMock } from "@/mocks/schedule";

const content = {
  id: "program",
  title: "Лекции — первопричина ЗМШ",
  description:
    "Всегда: от тех, кто хочет поделиться для тех, кто хочет узнавать новое.",
  badge: "Расписание",
  schedule: scheduleMock.getSchedule(-3),
};

const Program = () => {
  const { id, title, description, badge, schedule } = content;

  return (
    <Section id={id} badge={badge} title={title} description={description}>
      <Schedule schedule={schedule} />
    </Section>
  );
};

export default Program;
