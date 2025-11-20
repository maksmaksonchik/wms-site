import Header from "@/components/header";
import Hero from "@/sections/hero";
import About from "@/sections/about";
import Program from "@/sections/program";
import Sponsors from "@/sections/sponsors";
import Directions from "@/sections/directions";
import Footer from "@/components/footer";
import Members from "@/sections/members";

const Home = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Program />
        <Members />
        <Sponsors />
        <Directions />
      </main>
      <Footer />
    </>
  );
};

export default Home;
