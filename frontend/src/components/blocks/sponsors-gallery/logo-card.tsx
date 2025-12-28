import { CompanySponsor } from "@/types/sponsor.types";
import { Card, CardHeader } from "../../ui/card";
import ThemedImage from "../../ui/themed-image";
import { cn } from "@/lib/utils";

type Props = {
  sponsor: CompanySponsor;
  className?: string;
  variant?: "default" | "large";
};

const CardLayout = ({ sponsor, variant }: Props) => {
  return (
    <CardHeader
      className={cn(
        variant === "large" ? "p-6" : "p-4 sm:p-6",
        "flex items-center justify-center"
      )}
    >
      <div className="relative w-full aspect-video">
        <ThemedImage
          {...sponsor.logo}
          alt={sponsor.name}
          className="object-contain pointer-events-none select-none"
          // TODO: вынести, тут размеры для галереи спонсоров
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
      </div>
    </CardHeader>
  );
};

const LogoCard = ({ sponsor, variant = "default" }: Props) => {
  return (
    <Card key={sponsor.name} className="p-0 overflow-hidden">
      {sponsor.url ? (
        <a
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-full cursor-pointer hover:bg-accent transition"
        >
          <CardLayout sponsor={sponsor} variant={variant} />
        </a>
      ) : (
        <CardLayout sponsor={sponsor} variant={variant} />
      )}
    </Card>
  );
};

export default LogoCard;
