"use client";

import { siteConfig } from "@/config/site.config";
import Container from "./container";
import A from "@/components/typography/a";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 py-8 text-sm text-muted-foreground">
      <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {siteConfig.longTitle}.
        </span>
        <A href={siteConfig.footerLink.href} className="text-muted-foreground">
          {siteConfig.footerLink.title}
        </A>
      </Container>
    </footer>
  );
};

export default Footer;
