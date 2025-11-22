import { Schedule } from "./schedule.types";

export type Section = {
  id: string;
  title: string;
  description: string;
  badge: string;
  content: SectionContent[];
};

type SectionContent =
  | ScheduleSectionContent
  | LinkSectionContent
  | CallToActionSectionContent;

type ScheduleSectionContent = {
  type: "schedule";
  data: Schedule;
};

type LinkSectionContent = {
  type: "link";
  data: string;
};

type CallToActionSectionContent = {
  type: "call-to-action";
  data: string;
};
