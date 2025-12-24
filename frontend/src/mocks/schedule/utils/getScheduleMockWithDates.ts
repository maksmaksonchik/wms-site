import { ScheduleData } from "@/types/schedule.types";

/**
 * Форматирует дату в строку формата YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Добавляет указанное количество дней к дате
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Изменяет даты в расписании на основе offset.
 * @param schedule - исходное расписание
 * @param mockOffset - смещение дат:
 *   - 0: первая дата = сегодня
 *   - -2: первая дата = сегодня - 2 дня
 *   - 3: первая дата = сегодня + 3 дня
 * @returns новое расписание с измененными датами
 */
export function getScheduleMockWithDates(
  scheduleData: ScheduleData,
  mockOffset: number
): ScheduleData {
  const scheduleDays = scheduleData.scheduleDays;

  if (!scheduleDays || scheduleDays.length === 0) {
    return {
      scheduleDays,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDate = addDays(today, mockOffset);

  return {
    scheduleDays: scheduleDays.map((scheduleDay, index) => {
      const newDayDate = addDays(firstDate, index);

      return {
        ...scheduleDay,
        date: formatDate(newDayDate),
      };
    }),
  };
}
