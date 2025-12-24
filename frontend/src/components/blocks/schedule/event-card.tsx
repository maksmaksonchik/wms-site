import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Event } from "@/types/schedule.types";
import Markdown from "@/components/typography/markdown";

const EventCard = ({ event }: { event: Event }) => {
  return (
    <Card className="p-6">
      {/* Время и заголовок вверху на всю ширину */}
      <div className="text-lg font-semibold">
        <div className="mb-2">
          <time dateTime={`${event.date}T${event.start}`}>
            {event.start.slice(0, -3)}
          </time>
        </div>
        <h3>{event.title}</h3>
      </div>

      {/* Контент: на мобильных вертикально, на десктопе горизонтально */}
      {(event.image || event.description || event.speaker) && (
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Картинка: на мобильных полная ширина, на десктопе слева */}
          {event.image && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden md:max-w-[33%] md:shrink-0 sm:max-w-[60%] mx-auto">
              {/* TODO: починить картинки  */}
              <Image
                src={event.image.url}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Описание и лектор: под картинкой на мобильных, справа на десктопе */}
          <div className="w-full md:flex-1 space-y-4">
            {event.description && (
              <div className="text-muted-foreground leading-relaxed">
                <Markdown>{event.description}</Markdown>
              </div>
            )}

            {event.speaker && (
              <div className="text-right pt-2">
                <p className="font-medium">{event.speaker.name}</p>
                {event.speaker.credentials && (
                  <p className="text-sm text-muted-foreground">
                    {event.speaker.credentials}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EventCard;
