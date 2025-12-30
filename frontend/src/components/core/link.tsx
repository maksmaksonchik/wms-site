import NextLink from "next/link";

const getExternalRel = (rel = "") => {
  const relParts = new Set(rel.split(" ").filter(Boolean));
  relParts.add("noopener");
  relParts.add("noreferrer");
  return Array.from(relParts).join(" ");
};

const getExternalTarget = (target = "") => {
  return target || "_blank";
};

const getType = (href: string | undefined) => {
  if (!href) {
    return "external";
  }

  if (href.startsWith("/")) {
    return "internal";
  }

  if (href.startsWith("#")) {
    return "anchor";
  }

  return "external";
};

const Link = (props: React.ComponentProps<"a">) => {
  const type = getType(props.href);

  if (!props.href) {
    return null;
  }

  if (type === "external") {
    return (
      <a
        target={getExternalTarget(props.target)}
        rel={getExternalRel(props.rel)}
        {...props}
      />
    );
  }

  if (type === "anchor") {
    return <a {...props} />;
  }

  return <NextLink href={props.href} {...props} />;
};

export default Link;
