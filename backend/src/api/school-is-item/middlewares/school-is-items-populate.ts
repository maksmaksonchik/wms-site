import type { Core } from "@strapi/strapi";

const populate = {
  avatar: {
    fields: ["url"],
  },
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    ctx.query.populate = populate;
    ctx.query.sort = "sortOrder";

    strapi.log.info("In school-is-items-populate middleware.");

    await next();
  };
};
