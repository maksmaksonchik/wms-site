/**
 * Форматирует дату для отображения в вкладке
 */
export const formatDateForTab = (dateString: string): string => {
  const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  const date = new Date(dateString + "T00:00:00");

  const dayOfWeek = days[date.getDay()];

  const [_year, month, day] = dateString.split("-");

  return `${dayOfWeek}, ${day}.${month}`;
};
