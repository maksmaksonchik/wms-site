import { Event, ScheduleData, ScheduleDay } from "@/types/schedule.types";

const compareDays = (a: ScheduleDay, b: ScheduleDay): number => {
  // сравниваем по дате (формат YYYY-MM-DD позволяет сравнивать лексикографически)
  if (a.date < b.date) {
    return -1;
  }

  if (a.date > b.date) {
    return 1;
  }

  return 0;
};

const compareEvents = (a: Event, b: Event): number => {
  const isAfterMidnightDiff =
    Number(a.isAfterMidnight) - Number(b.isAfterMidnight);

  // если значения isAfterMidnight разные, сравниваем по нему
  if (isAfterMidnightDiff !== 0) {
    return isAfterMidnightDiff;
  }

  // если значения isAfterMidnight одинаковые, сравниваем по времени (лексикографически)
  if (a.start < b.start) {
    return -1;
  }

  if (a.start > b.start) {
    return 1;
  }

  return 0;
};

export const getSortedSchedule = (schedule: ScheduleData): ScheduleData => {
  const { scheduleDays } = schedule;

  const sortedDays = scheduleDays
    ?.toSorted(compareDays)

    .map((day) => ({
      ...day,
      events: day.events?.toSorted(compareEvents),
    }));

  return { ...schedule, scheduleDays: sortedDays };
};
