"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import type { Schedule } from "@/types/schedule.types";
import EventCard from "./event-card";
import { useRef } from "react";
import { formatDateForTab } from "./utils/formatDateForTab";
import { getCurrantDayTab } from "./utils/getCurrantDayTab";

const Empty = ({ text }: { text: string }) => (
  <div className="text-center text-muted-foreground py-12">{text}</div>
);

type ScheduleProps = {
  schedule: Schedule;
};

const Schedule = ({ schedule }: ScheduleProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!schedule || schedule.length === 0) {
    return <Empty text="Расписание пока недоступно" />;
  }

  const defaultTab = getCurrantDayTab(schedule);

  /** Прокручиваем расписание к началу при смене вкладки */
  const onValueChange = () => {
    scrollRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
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
          "sticky top-20 z-10 w-full mb-8 justify-start lg:overflow-x-hidden overflow-x-auto transition-all duration-200 shadow-2xl backdrop-blur-sm"
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
              <Empty text="В этот день нет событий" />
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
};

export default Schedule;
