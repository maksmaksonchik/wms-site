import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const Hero = () => {
  return (
    <section
      id="hero"
      className="flex items-end min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-linear-to-tr from-background/95 via-background/60 to-background/20" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-20 pt-32 sm:px-10 lg:px-16">
        <div className="max-w-3xl space-y-6">
          <Badge className="bg-primary/90 text-primary-foreground">
            ЗМШ-60
          </Badge>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Зимняя математическая школа
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl mb-10">
            28 января — 5 февраля, 2026
          </p>
          <p className="text-base text-muted-foreground sm:text-lg">
            <a
              href="https://fokgagarin.ru/contacts/"
              target="_blank"
              className="inline-flex items-center transition hover:text-foreground"
            >
              <MapPin className="inline mr-2" size="1em" />
              ФОК Гагаринский
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
