"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

const getExternalRel = (rel = "") => {
  const relParts = new Set(rel.split(" ").filter(Boolean));
  relParts.add("noopener");
  relParts.add("noreferrer");
  return Array.from(relParts).join(" ");
};

const getExternalTarget = (target = "") => {
  return target || "_blank";
};

type LinkType = "external" | "internal" | "anchor" | "internal-with-anchor";

const getType = (href: string | undefined, currentPath: string): LinkType => {
  if (!href) return "external";

  if (href.startsWith("#")) return "anchor";

  const [pathPart, anchorId] = href.split("#");

  if (anchorId) {
    const cleanPath = pathPart.replace(/\/+$/, "");
    const cleanCurrent = currentPath.replace(/\/+$/, "");

    if (cleanPath === cleanCurrent) return "anchor";

    return "internal-with-anchor";
  }

  if (href.startsWith("/")) return "internal";

  return "external";
};

const Link = (props: React.ComponentProps<"a">) => {
  const pathname = usePathname();
  const type = getType(props.href, pathname);

  if (!props.href) return null;

  const { href } = props;

  if (type === "internal") {
    return <NextLink href={href} {...props} />;
  }

  if (type === "anchor") {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const [_pathPart, anchorId] = href.split("#");

      e.preventDefault();
      const target = document.getElementById(anchorId);

      if (target) target.scrollIntoView({ behavior: "smooth" });

      history.pushState(null, "", `#${anchorId}`);

      e.currentTarget.blur();

      props.onClick?.(e);
    };

    return <a {...props} onClick={handleClick} />;
  }

  if (type === "internal-with-anchor") {
    return <NextLink href={href} {...props} />;
  }

  return (
    <a
      target={getExternalTarget(props.target)}
      rel={getExternalRel(props.rel)}
      {...props}
    />
  );
};

export default Link;
