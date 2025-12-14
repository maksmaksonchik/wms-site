import type { Core } from "@strapi/strapi";

const populate = {
  header: {
    populate: {
      navLinks: true,
    },
  },
  hero: {
    populate: {
      location: true,
      background: {
        fields: ["url"],
      },
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
    strapi.log.info("In landing-page-populate middleware.");

    await next();
  };
};
