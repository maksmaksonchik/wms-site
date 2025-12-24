import type { Schedule as ScheduleProps } from "@/types/blocks/schedule.types";
import { strapi } from "@/services/strapi";
import ScheduleUI from "./schedule-ui";

const Schedule = async ({ schedule }: ScheduleProps) => {
  const scheduleData = await strapi.getSchedule(schedule.documentId);

  return <ScheduleUI {...scheduleData} />;
};

export default Schedule;
