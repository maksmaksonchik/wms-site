import Header from "@/components/layout/header";
import Hero from "@/components/layout/hero";
import Footer from "@/components/layout/footer";
import { Strapi } from "@/services/strapi";
import Section from "@/components/layout/section";

const Home = async () => {
  const strapi = new Strapi();

  const data = await strapi.getLandingData();

  const { header, hero, footer, sections } = data;

  return (
    <>
      <Header data={header} />
      <main>
        <Hero data={hero} />

        {sections.map((section) => (
          <Section key={section.id} {...section} />
        ))}
      </main>
      <Footer data={footer} />
    </>
  );
};

export default Home;
