import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"a"> & {
  internal?: boolean;
};

const getExternalRel = (rel = "") => {
  const relParts = new Set(rel.split(" ").filter(Boolean));
  relParts.add("noopener");
  relParts.add("noreferrer");
  return Array.from(relParts).join(" ");
};

const getExternalTarget = (target = "") => {
  return target || "_blank";
};

const A = ({
  children,
  internal = false,
  className,
  target,
  rel,
  ...props
}: Props) => {
  const finalTarget = internal ? target : getExternalTarget(target);
  const finalRel = internal ? rel : getExternalRel(rel);

  return (
    <a
      target={finalTarget}
      rel={finalRel}
      className={cn(
        "text-foreground underline-offset-2 hover:text-primary hover:underline",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export default A;
