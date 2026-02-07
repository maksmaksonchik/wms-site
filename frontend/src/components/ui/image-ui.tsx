import { getStrapiImageUrl } from "@/lib/image-utils";
import NextImage from "next/image";

type ImageUIProps = {
  src: string | undefined;
} & Omit<React.ComponentProps<typeof NextImage>, "src">;

const ImageUI = ({ src, ...props }: ImageUIProps) => {
  if (!src) return null;

  return <NextImage src={getStrapiImageUrl(src)} {...props} />;
};

export default ImageUI;
