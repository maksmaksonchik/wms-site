/**
 * schedule router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::schedule.schedule", {
  config: {
    findOne: {
      middlewares: ["api::schedule.schedule-populate"],
    },
  },
});
