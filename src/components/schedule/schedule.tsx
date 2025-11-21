"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import type { Schedule } from "./schedule.types";
import EventCard from "./event-card";
import { useRef } from "react";

type ScheduleProps = {
  schedule: Schedule;
};

/**
 * Форматирует дату для отображения в вкладке
 */
function formatDateForTab(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const dayOfWeek = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${dayOfWeek}, ${day} ${month}`;
}

export function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const EmptySchedule = () => (
  <div className="text-center text-muted-foreground py-12">
    Расписание пока недоступно
  </div>
);

const EmptyDay = () => (
  <div className="text-center text-muted-foreground py-12">
    В этот день нет событий
  </div>
);

export default function Schedule({ schedule }: ScheduleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!schedule || schedule.length === 0) {
    return <EmptySchedule />;
  }

  const todayString = getDateString(new Date());
  const found = schedule.find((day) => day.date === todayString);
  const defaultTab = found ? found.date : schedule[0].date;

  /** Прокручивает расписание к началу при смене вкладки */
  const onValueChange = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Tabs
      defaultValue={defaultTab}
      onValueChange={onValueChange}
      className="scroll-mt-20"
      ref={scrollRef}
    >
      <TabsList
        className={
          "mb-8 w-full overflow-x-auto justify-start transition-all sticky top-20 duration-200 shadow-md  z-10  backdrop-blur-sm"
        }
      >
        {schedule.map((day) => (
          <TabsTrigger key={day.date} value={day.date}>
            {formatDateForTab(day.date)}
          </TabsTrigger>
        ))}
      </TabsList>

      {schedule.map((day) => (
        <TabsContent key={day.date} value={day.date}>
          <div className="space-y-6">
            {day.events.length === 0 ? (
              <EmptyDay />
            ) : (
              day.events.map((event) => (
                <EventCard
                  key={`${event.date}-${event.startTime}`}
                  event={event}
                />
              ))
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
