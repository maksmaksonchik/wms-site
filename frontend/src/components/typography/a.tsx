import { cn } from "@/lib/utils";
import Link from "../core/link";

const A = ({ className, ...props }: React.ComponentProps<"a">) => {
  return (
    <Link
      className={cn(
        "text-foreground hover:text-primary",
        "underline underline-offset-4",
        "dark:no-underline dark:hover:underline",
        className
      )}
      {...props}
    />
  );
};

export default A;
