import type { Core } from "@strapi/strapi";

const populate = {
  header: {
    populate: {
      navLinks: true,
    },
  },

  footer: {
    populate: {
      link: true,
    },
  },
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    ctx.query.populate = populate;
    strapi.log.info("In global-populate middleware.");

    await next();
  };
};
