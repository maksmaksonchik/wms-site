import type { Core } from "@strapi/strapi";

const populate = {
  avatar: { fields: ["url"] },
  logo: {
    populate: {
      lightTheme: { fields: ["url"] },
      darkTheme: { fields: ["url"] },
    },
  },
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    ctx.query.populate = populate;

    strapi.log.info("In sponsors-populate middleware.");

    await next();
  };
};
