"use client";

import { siteConfig } from "@/config/site.config";
import Container from "./container";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 py-8 text-sm text-muted-foreground">
      <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {siteConfig.longTitle}.
        </span>
        <a
          href={siteConfig.footerLink.href}
          target="_blank"
          className="transition hover:text-foreground"
        >
          {siteConfig.footerLink.title}
        </a>
      </Container>
    </footer>
  );
};

export default Footer;
