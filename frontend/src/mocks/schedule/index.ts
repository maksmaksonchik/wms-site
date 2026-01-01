import { Schedule } from "@/types/schedule.types";
import { schedule2025 } from "./data/schedule_2025.mock";
import { getScheduleMockWithDates } from "./utils/getScheduleMockWithDates";

const scheduleMock = {
  getSchedule(offset?: number): Schedule {
    if (!offset) return schedule2025;
    return getScheduleMockWithDates(schedule2025, offset);
  },
};

export { scheduleMock };
