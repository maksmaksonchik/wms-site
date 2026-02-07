import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { SchoolIsItem } from "@/types/school-is-item.types";

const QuoteCard = ({ definition, name, credentials, avatar }: SchoolIsItem) => {
  return (
    <Card className="flex flex-col h-full p-4">
      <div className="relative aspect-square overflow-hidden rounded-md">
        <Avatar className="size-full rounded-none">
          <AvatarImage
            src={avatar.url}
            alt={name}
            // TODO: вынести, тут размеры для галереи спонсоров
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
          <AvatarFallback className="rounded-none" />
        </Avatar>
      </div>

      <CardContent className="flex flex-col flex-1 p-0">
        <p className="text mb-4 flex-1 text-muted-foreground leading-relaxed">
          ...{definition}.
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
