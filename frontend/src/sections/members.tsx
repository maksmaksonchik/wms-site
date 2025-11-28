import CallToAction from "@/components/call-to-action";
import CardLink from "@/components/card-link";
import Section from "@/components/section";

const content = {
  id: "members",
  title: "Стать участником",
  description: "МЕСТА ЗАКОНЧИЛИСЬ.",
  badge: "Участники",
};

const link = {
  label: "Кто едет?",
  href: "https://buildin.ai/share/696d3aee-85e7-4e62-b004-cdf6a4013eba",
};

const callToActionContent = {
  title: "Приезжайте на денёк!",
  description:
    "Получаешь спальное место в комфортном корпусе на одну ночь и три приёма пищи.",
  buttonText: "Забронировать место",
  href: "https://buildin.ai/share/9705240a-f14d-4c21-b45f-31855bda53d4",
};

const Members = () => {
  const { id, title, description, badge } = content;

  return (
    <Section id={id} badge={badge} title={title} description={description}>
      <CardLink
        href={link.href}
        label={link.label}
        description="Список ЗМШат 2026"
      />
      <CallToAction
        title={callToActionContent.title}
        description={callToActionContent.description}
        buttonText={callToActionContent.buttonText}
        href={callToActionContent.href}
      />
    </Section>
  );
};

export default Members;
