import Image from "next/image";
import { Card } from "../ui/card";
import { Event } from "@/types/schedule.types";

const EventCard = ({ event }: { event: Event }) => {
  return (
    <Card className="p-6">
      {/* Время и заголовок вверху на всю ширину */}
      <div className="text-lg font-semibold">
        <div className="mb-2">
          <time dateTime={`${event.date}T${event.startTime}`}>
            {event.startTime}
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
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Описание и лектор: под картинкой на мобильных, справа на десктопе */}
          <div className="w-full md:flex-1 space-y-4">
            {event.description && (
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            )}

            {event.speaker && (
              <div className="text-right pt-2">
                <p className="font-medium">{event.speaker}</p>
                {event.speakerCredentials && (
                  <p className="text-sm text-muted-foreground">
                    {event.speakerCredentials}
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
