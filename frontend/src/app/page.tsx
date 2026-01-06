import Hero from "@/components/layout/hero";
import Section from "@/components/layout/section";
import { strapi } from "@/services/strapi";

const Home = async () => {
  const { hero, sections } = await strapi.getLandingData();

  return (
    <>
      <Hero data={hero} />

      {sections.map((section) => (
        <Section key={section.id} {...section} />
      ))}
    </>
  );
};

export default Home;
