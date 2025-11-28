import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type QuoteCardProps = {
  description: string;
  name: string;
  credentials: string;
  image: string;
};

const QuoteCard = ({
  description,
  name,
  credentials,
  image,
}: QuoteCardProps) => {
  return (
    <Card className="flex flex-col h-full p-4">
      <div className="relative aspect-square overflow-hidden rounded-md">
        <Avatar className="size-full rounded-none">
          <AvatarImage src={image} alt={name} className="object-cover" />
          <AvatarFallback className="rounded-none" />
        </Avatar>
      </div>

      <CardContent className="flex flex-col flex-1 p-0">
        <p className="text mb-4 flex-1 text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div className="mt-auto">
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-sm text-muted-foreground">{credentials}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
