import { cn } from "@/lib/utils";

type FixedGridProps = React.HTMLAttributes<HTMLDivElement> & {
  type: "fixed";
  cols: 2 | 3 | 4 | 5;
};

const FixedGrid = ({ children, cols, className, ...props }: FixedGridProps) => {
  const classes: Record<string, string> = {
    2: "grid gap-6 grid-cols-1 md:grid-cols-2",
    3: "grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid gap-2 sm:gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5",
  };

  return (
    <div className={cn(classes[cols], className)} {...props}>
      {children}
    </div>
  );
};

type AutoGridProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: "auto";
};

const AutoGrid = ({ children, className, ...props }: AutoGridProps) => {
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

type GridProps = FixedGridProps | AutoGridProps;

const Grid = (props: GridProps) => {
  if (props.type === "fixed") {
    return <FixedGrid {...props} />;
  }
  return <AutoGrid {...props} />;
};

export default Grid;
