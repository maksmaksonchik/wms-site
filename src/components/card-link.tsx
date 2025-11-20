import { ArrowUpRight } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

type Props = {
  label: string;
  href: string;
  description?: string;
} & React.HTMLAttributes<HTMLAnchorElement>;

const CardLink = ({ href, label, description }: Props) => {
  return (
    <a href={href} target="_blank" className="group">
      <Card className="transition group-hover:bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-1 group-hover:underline">
            {label}
            <ArrowUpRight className="h-[1em] w-[1em] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </CardTitle>
          {description && (
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </a>
  );
};

export default CardLink;
