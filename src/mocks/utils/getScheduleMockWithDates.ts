import { Schedule } from "@/types/schedule.types";

/**
 * Парсит дату из строки формата YYYY-MM-DD
 */
function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

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
 * Вычисляет разницу в днях между двумя датами
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
  schedule: Schedule,
  mockOffset: number
): Schedule {
  if (!schedule || schedule.length === 0) {
    return schedule;
  }

  // Получаем первую дату из расписания
  const firstOriginalDate = parseDate(schedule[0].date);

  // Вычисляем новую первую дату (сегодня + offset)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Обнуляем время для точности
  const newFirstDate = addDays(today, mockOffset);

  // Вычисляем разницу в днях
  const daysDiff = getDaysDifference(firstOriginalDate, newFirstDate);

  // Создаем новое расписание с измененными датами
  return schedule.map((daySchedule) => {
    const originalDayDate = parseDate(daySchedule.date);
    const newDayDate = addDays(originalDayDate, daysDiff);

    return {
      ...daySchedule,
      date: formatDate(newDayDate),
      events: daySchedule.events.map((event) => {
        const originalEventDate = parseDate(event.date);
        const newEventDate = addDays(originalEventDate, daysDiff);

        // Возвращаем событие с измененной датой, но НЕ изменяем поле image
        return {
          ...event,
          date: formatDate(newEventDate),
        };
      }),
    };
  });
}
