import { StrapiImage } from "./shared.types";

export type Event = {
  id: number;
  documentId: string;

  /** Название события */
  title: string;

  /** Время начала события (HH:MM:SS)*/
  start: string;

  /** Время окончания события (HH:MM:SS)*/
  end: string;

  /** Если событие происходит уже после полуночи, но принадлежит к дню — true */
  isAfterMidnight: boolean;

  /** Описание события в формате markdown */
  description?: string;

  /** Спикер */
  speaker?: Speaker | null;

  /** Картинка события */
  image?: StrapiImage;
};

type Speaker = {
  id: number;
  documentId: string;

  /** Имя спикера или название компании */
  name: string;

  /** Регалии */
  credentials?: string | null;
};

export type ScheduleDay = {
  id: number;
  documentId: string;

  /** Дата (YYYY-MM-DD)*/
  date: string;

  /** События в этот день */
  events?: Event[] | null;
};

export type ScheduleData = {
  scheduleDays?: ScheduleDay[] | null;
};
