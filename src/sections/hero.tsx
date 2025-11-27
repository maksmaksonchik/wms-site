import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import Container from "@/components/container";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative flex items-end min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Hero всегда отображается темным, кроме Badge, поэтому добавляем dark класс */}
      <div className="dark absolute inset-0 bg-linear-to-tr from-background/95 via-background/60 to-background/20" />
      <Container className="relative z-10 flex flex-col gap-6 pb-20 pt-32">
        <div className="max-w-3xl space-y-6">
          <Badge variant="default">ЗМШ-60</Badge>
          <h1 className="dark text-4xl font-bold text-foreground leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Зимняя математическая школа
          </h1>
          <p className="dark text-lg text-muted-foreground sm:text-xl mb-10">
            28 января — 5 февраля, 2026
          </p>
          <p className="dark text-base text-muted-foreground sm:text-lg">
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
      </Container>
    </section>
  );
};

export default Hero;
