"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import type { ScheduleData } from "@/types/schedule.types";
import EventCard from "./event-card";
import { useRef } from "react";
import { formatDateForTab } from "./utils/formatDateForTab";
import { getCurrantDayTab } from "./utils/getCurrantDayTab";

const Empty = ({ text }: { text: string }) => (
  <div className="text-center text-muted-foreground py-12">{text}</div>
);

const ScheduleUI = ({ scheduleDays }: ScheduleData) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!scheduleDays || scheduleDays.length === 0) {
    return <Empty text="Расписание пока недоступно" />;
  }

  const defaultTab = getCurrantDayTab(scheduleDays);

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
      <TabsList className="w-full mb-8 sticky top-20 z-10 shadow-2xl backdrop-blur-sm overflow-x-auto">
        {scheduleDays.map((day) => (
          <TabsTrigger key={day.date} value={day.date}>
            {formatDateForTab(day.date)}
          </TabsTrigger>
        ))}
      </TabsList>

      {scheduleDays.map((day) => (
        <TabsContent key={day.date} value={day.date}>
          <div className="space-y-6">
            {!day.events || day.events.length === 0 ? (
              <Empty text="В этот день нет событий" />
            ) : (
              day.events.map((event) => (
                <EventCard
                  key={`${day.date}-${event.start}`}
                  event={event}
                  date={day.date}
                />
              ))
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ScheduleUI;
