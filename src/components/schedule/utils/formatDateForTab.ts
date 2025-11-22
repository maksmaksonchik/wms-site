/**
 * Форматирует дату для отображения в вкладке
 */
export const formatDateForTab = (dateString: string): string => {
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

  const date = new Date(dateString + "T00:00:00");

  const dayOfWeek = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${dayOfWeek}, ${day} ${month}`;
};
