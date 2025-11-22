export type Event = {
  /** Дата события (YYYY-MM-DD)*/
  date: string;

  /** Время начала события (HH:MM)*/
  startTime: string;

  /** Время окончания события (HH:MM)*/
  endTime?: string;

  /** Название события */
  title: string;

  /** Ссылка на изображение события */
  image?: string;

  /** Описание события */
  description?: string;

  /** Имя спикера */
  speaker?: string;

  /** Регалии спикера */
  speakerCredentials?: string;
};

export type DaySchedule = {
  /** Дата (YYYY-MM-DD)*/
  date: string;

  /** События в этот день */
  events: Event[];
};

export type Schedule = DaySchedule[];
