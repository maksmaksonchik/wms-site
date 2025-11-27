import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
