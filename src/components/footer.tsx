"use client";

import { siteConfig } from "@/config/site.config";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 px-6 py-8 text-sm text-muted-foreground sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </footer>
  );
};

export default Footer;
