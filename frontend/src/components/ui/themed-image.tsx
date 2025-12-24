import { cn } from "@/lib/utils";
import Image from "next/image";
import type { ThemedImage as ThemedImageType } from "@/types/shared.types";

type ThemedImageProps = ThemedImageType & {
  alt: string;
  className?: string;
};

const ThemedImage = ({
  lightTheme,
  darkTheme,
  alt,
  className,
}: ThemedImageProps) => {
  return (
    <>
      <Image
        className={cn("block dark:hidden", className)}
        src={lightTheme.url}
        alt={alt}
        fill
      />
      <Image
        src={darkTheme.url}
        alt={alt}
        className={cn("hidden dark:block", className)}
        fill
      />
    </>
  );
};

export default ThemedImage;
