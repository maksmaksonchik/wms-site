import type { StrapiApp } from "@strapi/strapi/admin";

export default {
  config: {
    locales: [
      "en-GB",
      // "ru",
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
