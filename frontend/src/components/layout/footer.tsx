"use client";

import Container from "@/components/container";
import A from "@/components/typography/a";
import { Footer as FooterData } from "@/types/layout/footer.types";

type FooterProps = {
  data: FooterData;
};

const Footer = ({ data }: FooterProps) => {
  const { copyright, link } = data;

  return (
    <footer className="border-t border-border/60 py-8 text-sm text-muted-foreground">
      <Container className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {copyright}.
        </span>

        {link && (
          <A
            href={link?.href}
            internal={link?.isInternal}
            className="text-muted-foreground"
          >
            {link.label}
          </A>
        )}
      </Container>
    </footer>
  );
};

export default Footer;
