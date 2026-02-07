import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import Container from "@/components/container";
import A from "@/components/typography/a";
import { Hero as HeroData } from "@/types/layout/hero.types";
import ImageUI from "@/components/ui/image-ui";

type HeroProps = {
  data: HeroData;
};

const Hero = ({ data }: HeroProps) => {
  const { heading, badge, dates, location, background } = data;

  return (
    <section id="hero" className="relative flex items-end min-h-screen w-full">
      <ImageUI
        src={background.url}
        alt=""
        fill
        sizes="(orientation: portrait) 200vw, 120vw"
        className="object-cover z-0"
        priority
      />
      {/* Hero всегда отображается темным, кроме Badge, поэтому добавляем dark класс */}
      <div className="dark absolute inset-0 bg-linear-to-tr from-background/95 via-background/60 to-background/20" />
      <Container className="relative z-10 flex flex-col gap-6 pb-20 pt-32">
        <div className="max-w-3xl space-y-6">
          <Badge variant="default">{badge}</Badge>

          <h1 className="dark text-4xl font-bold text-foreground leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {heading}
          </h1>

          {dates && (
            <p className="dark text-lg text-muted-foreground sm:text-xl mb-10">
              {dates}
            </p>
          )}

          {location && (
            <p className="dark text-base text-muted-foreground sm:text-lg">
              <A
                href={location.href}
                className="inline-flex items-center text-muted-foreground no-underline hover:underline"
              >
                <MapPin className="inline mr-2" size="1em" />
                {location.label}
              </A>
            </p>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Hero;
