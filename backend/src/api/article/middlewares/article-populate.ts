import type { Core } from "@strapi/strapi";

const populate = {
  blocks: {
    on: {
      "blocks.image-with-accordion": {
        populate: {
          image: {
            populate: { src: { fields: ["url"] } },
          },
          accordion: {
            populate: { items: true },
          },
        },
      },
      "blocks.link-card": true,

      "blocks.link-card-grid": {
        populate: {
          cards: true,
        },
      },

      "blocks.call-to-action": {
        populate: {
          button: true,
        },
      },

      "blocks.markdown": true,

      "blocks.schedule": {
        populate: {
          schedule: {
            fields: ["documentId"],
          },
        },
      },

      "blocks.school-is-gallery": true,

      "blocks.sponsors-gallery": true,
    },
  },
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    ctx.query.populate = populate;
    strapi.log.info("In article-populate middleware.");

    await next();
  };
};
