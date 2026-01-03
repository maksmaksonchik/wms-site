import { getStrapiImageUrl } from "@/lib/image-utils";
import NextImage from "next/image";

type ImageUIProps = {
  src: string;
} & Omit<React.ComponentProps<typeof NextImage>, "src">;

const ImageUI = ({ src, ...props }: ImageUIProps) => {
  return <NextImage src={getStrapiImageUrl(src)} {...props} />;
};

export default ImageUI;
