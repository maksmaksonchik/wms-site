import { ScheduleDay } from "@/types/schedule.types";
import { getDateString } from "./getDateString";

export const getCurrantDayTab = (scheduleDays: ScheduleDay[]): string => {
  const today = new Date();

  const found = scheduleDays.find((day) => day.date === getDateString(today));

  if (found) {
    return found.date;
  }

  const firstScheduleDay = new Date(scheduleDays[0].date);

  if (today.getTime() > firstScheduleDay.getTime()) {
    return scheduleDays[scheduleDays.length - 1].date;
  }

  return scheduleDays[0].date;
};
