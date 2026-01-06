import { cn } from "@/lib/utils";
import Link from "../core/link";

const A = ({ className, ...props }: React.ComponentProps<"a">) => {
  return (
    <Link
      className={cn(
        "text-foreground underline-offset-4 hover:text-primary hover:underline",
        className
      )}
      {...props}
    />
  );
};

export default A;
