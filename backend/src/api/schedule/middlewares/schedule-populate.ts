import type { Core } from "@strapi/strapi";

const populate = {
  scheduleDays: {
    fields: ["date"],
    populate: {
      events: {
        fields: ["start", "isAfterMidnight", "title", "description"],
        populate: {
          speaker: {
            fields: ["name", "credentials"],
          },
          image: {
            fields: ["url"],
          },
        },
      },
    },
  },
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    ctx.query.populate = populate;

    strapi.log.info("In schedule-populate middleware.");

    await next();
  };
};
