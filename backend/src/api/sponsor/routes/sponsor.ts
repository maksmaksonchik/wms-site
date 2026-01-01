/**
 * sponsor router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::sponsor.sponsor", {
  config: {
    find: {
      middlewares: ["api::sponsor.sponsors-populate"],
    },
  },
});
