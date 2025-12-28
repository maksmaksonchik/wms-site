import { cn } from "@/lib/utils";
import ImageUI from "@/components/ui/image-ui";
import type { ThemedImage as ThemedImageType } from "@/types/shared.types";

type ThemedImageProps = ThemedImageType & {
  sizes: string;
  alt: string;
  className?: string;
};

const ThemedImage = ({
  lightTheme,
  darkTheme,
  alt,
  className,
  sizes,
}: ThemedImageProps) => {
  return (
    <>
      <ImageUI
        className={cn("block dark:hidden", className)}
        src={lightTheme.url}
        alt={alt}
        fill
        sizes={sizes}
      />
      <ImageUI
        src={darkTheme.url}
        alt={alt}
        className={cn("hidden dark:block", className)}
        fill
        sizes={sizes}
      />
    </>
  );
};

export default ThemedImage;
