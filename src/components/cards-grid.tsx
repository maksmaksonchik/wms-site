import { cn } from "@/lib/utils";

const CardsGrid = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default CardsGrid;
