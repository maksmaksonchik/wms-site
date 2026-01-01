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

  sections: {
    fields: ["heading", "badge", "description", "anchorId"],
    populate: {
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
