import { Header } from "@/types/layout/header.types";
import { Footer } from "@/types/layout/footer.types";
import { Hero } from "@/types/layout/hero.types";
import { Section } from "@/types/layout/section.types";

export type LandingPage = {
  header: Header;
  hero: Hero;
  footer: Footer;
  sections: Section[];
};
