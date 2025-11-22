import { Schedule } from "@/types/schedule.types";
import { getDateString } from "./getDateString";

export const getCurrantDayTab = (schedule: Schedule): string => {
  const today = new Date();

  const found = schedule.find((day) => day.date === getDateString(today));

  if (found) {
    return found.date;
  }

  const firstScheduleDay = new Date(schedule[0].date);

  if (today.getTime() > firstScheduleDay.getTime()) {
    return schedule[schedule.length - 1].date;
  }

  return schedule[0].date;
};
