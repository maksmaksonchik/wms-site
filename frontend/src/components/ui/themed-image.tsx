import { cn } from "@/lib/utils";
import Image from "next/image";

type ThemedImageProps = {
  src: {
    light_theme: string;
    dark_theme: string;
  };
  alt: string;
  className?: string;
};

const ThemedImage = ({ src, alt, className }: ThemedImageProps) => {
  return (
    <>
      <Image
        className={cn("block dark:hidden", className)}
        src={src.light_theme}
        alt={alt}
        fill
      />
      <Image
        src={src.dark_theme}
        alt={alt}
        className={cn("hidden dark:block", className)}
        fill
      />
    </>
  );
};

export default ThemedImage;
