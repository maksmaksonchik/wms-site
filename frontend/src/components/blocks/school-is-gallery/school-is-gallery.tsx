import {
  Carousel,
  CarouselNext,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
} from "@/components/ui/carousel";
import QuoteCard from "./quote-card";
import { strapi } from "@/services/strapi";

const SchoolIsGallery = async () => {
  const items = await strapi.getSchoolIs();

  if (!items || items.length === 0) return null;

  return (
    <Carousel
      opts={{
        loop: true,
        align: "start",
      }}
      className="mx-auto w-3/4 sm:w-[90%] lg:w-full"
    >
      <CarouselContent>
        {items.map(
          (item, index) =>
            !item.isHidden && (
              <CarouselItem
                key={index}
                className="basis-full sm:basis-1/3 lg:basis-1/4"
              >
                <QuoteCard {...item} />
              </CarouselItem>
            )
        )}
      </CarouselContent>
      <CarouselPrevious className="cursor-pointer" />
      <CarouselNext className="cursor-pointer" />
    </Carousel>
  );
};

export default SchoolIsGallery;
