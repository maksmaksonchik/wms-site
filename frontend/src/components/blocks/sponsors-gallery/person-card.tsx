import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getStrapiImageUrl } from "@/lib/image-utils";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("");

type PersonCardProps = {
  avatar?: string;
  name: string;
};

const PersonCard = ({ avatar, name }: PersonCardProps) => {
  return (
    <Card key={name} className="p-0">
      <CardHeader className="flex flex-row items-center gap-4 py-4 px-6">
        <Avatar className="h-20 w-20">
          <AvatarImage
            className="object-cover"
            src={avatar ? getStrapiImageUrl(avatar) : avatar}
            alt={name}
          />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default PersonCard;
