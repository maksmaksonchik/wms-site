"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import type { Schedule } from "./schedule.types";
import EventCard from "./event-card";

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

export default function Schedule({ schedule }: ScheduleProps) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Расписание пока не доступно
      </div>
    );
  }

  const todayString = getDateString(new Date());
  const found = schedule.find((day) => day.date === todayString);
  const defaultTab = found ? found.date : schedule[0].date;

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="mb-8 w-full overflow-x-auto justify-start">
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
              <div className="text-center text-muted-foreground py-12">
                В этот день нет событий
              </div>
            ) : (
              day.events.map((event, index) => (
                <EventCard
                  key={`${event.date}-${event.startTime}-${index}`}
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
