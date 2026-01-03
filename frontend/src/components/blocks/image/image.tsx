import ImageUI from "@/components/ui/image-ui";
import { Image as ImageProps } from "@/types/blocks/image.types";

const Image = ({ src, alt }: ImageProps) => {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden">
      <ImageUI
        src={src.url}
        alt={alt}
        fill
        // TODO: вынести, тут настройки под image-with-accordion
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
};

export default Image;
