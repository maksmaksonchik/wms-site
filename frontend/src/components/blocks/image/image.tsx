import NextImage from "next/image";
import { Image as ImageProps } from "@/types/blocks/image.types";
import { getStrapiImageUrl } from "@/lib/image-utils";

const Image = ({ src, alt }: ImageProps) => {
  const imageUrl = getStrapiImageUrl(src.url);

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden">
      <NextImage
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        unoptimized // TODO: вернуть оптимизацию изображений
      />
    </div>
  );
};

export default Image;
