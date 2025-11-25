import Header from "@/components/header";
import Hero from "@/sections/hero";
import About from "@/sections/about";
import Program from "@/sections/program";
import Sponsors from "@/sections/sponsors";
import Directions from "@/sections/directions";
import Footer from "@/components/footer";
import Members from "@/sections/members";
import SchoolIs from "@/sections/school-is";

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
        <SchoolIs />
      </main>
      <Footer />
    </>
  );
};

export default Home;
