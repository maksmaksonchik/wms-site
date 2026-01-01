import Image from "next/image";
import Section from "@/components/section";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Markdown from "@/components/typography/markdown";

const content = {
  id: "directions",
  title: "Как добраться на ЗМШ?",
  badge: "Маршрут",
  image: "/directions.jpg",
  imageAlt: "Схема проезда",
};

const directions = [
  {
    title: "На автобусе 🚌",
    description:
      "Туда: 29 января в 10:00. Сбор в 9:30 у [Ленина, 51](https://yandex.ru/maps/-/CHadAZ0Q).\n*На месте будет [Макс Фёдоров](https://t.me/MYuFyodorov)*.\n\nОбратно: 5 февраля в 11:00.",
  },
  {
    title: "На машине 🚗",
    description:
      "До [ФОК «Гагаринский»](https://yandex.ru/maps/-/CHa-UH32).\nНе забудьте заполнить [форму](https://docs.google.com/forms/d/e/1FAIpQLScHF0KH28P0JnPvEx-JAS85nGSma07UkKHJPkSfunkM7ALF6Q/viewform?usp=dialog) на въезд.\n\nПриезжайте раньше автобусов, чтобы не пересечься на парковке, примерно к 11:00.\n\nСхема проездов изображена на картинке.\n\n*Движение по территории ФОК разрешено со скоростью не более 10 км/ч при включённой аварийной сигнализации. Это мера обеспечения безопасности по просьбе администрации.*",
  },
  {
    title: "На электричке 🚂",
    description:
      "До [Первоуральска](https://rasp.yandex.ru/suburban/ekaterinburg--pervouralsk-train-station).\nДалее на местном такси до [ФОК «Гагаринский»](https://yandex.ru/maps/-/CHa-UH32).",
  },
  {
    title: "На такси 🚕",
    description:
      "Цена из центра ~ 2000 ₽.\nЗаранее напишите [Серёже Черных](https://t.me/SergCher), что приезжаете.",
  },
];

const Directions = () => {
  const { id, title, badge, image, imageAlt } = content;

  return (
    <Section id={id} badge={badge} title={title}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image src={image} alt={imageAlt} fill className="object-cover" />
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {directions.map((direction, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-0"
            >
              <Card className="p-0 gap-2">
                <AccordionTrigger className="items-center p-6 cursor-pointer">
                  <CardTitle className="text-lg">{direction.title}</CardTitle>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 text-muted-foreground whitespace-pre-line">
                  <Markdown>{direction.description}</Markdown>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
};

export default Directions;
