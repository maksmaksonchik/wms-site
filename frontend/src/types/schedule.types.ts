import { StrapiImage } from "./shared.types";

export type Event = {
  id: number;
  documentId: string;

  /** Название события */
  title: string;

  /** Является ли лекцией */
  isLecture: boolean;

  /** Время начала события (HH:MM:SS)*/
  start: string;

  /** Время окончания события (HH:MM:SS)*/
  end: string;

  /** Если событие происходит уже после полуночи, но принадлежит к дню — true */
  isAfterMidnight: boolean;

  /** Спикер */
  speaker?: Speaker | null;

  /** Картинка события */
  image?: StrapiImage;

  /** Описание события в формате markdown */
  description?: string;
};

type Speaker = {
  /** Имя спикера или название компании */
  name: string;

  /** Регалии */
  credentials?: string | null;
};

export type ScheduleDay = {
  /** Дата (YYYY-MM-DD)*/
  date: string;

  /** События в этот день */
  events?: Event[] | null;
};

export type ScheduleData = {
  scheduleDays?: ScheduleDay[] | null;
};
