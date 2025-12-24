import { ArrowUpRight } from "lucide-react";

import type { LinkCard as LinkCardProps } from "@/types/blocks";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LinkCard = ({ href, title, subtitle }: LinkCardProps) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group">
      <Card className="transition group-hover:bg-accent h-full justify-center">
        <CardHeader className="gap-0 space-y-2">
          <CardTitle className="text-lg flex items-center gap-1 group-hover:underline">
            {title}
            <ArrowUpRight className="h-[1em] w-[1em] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-base">{subtitle}</CardDescription>
          )}
        </CardHeader>
      </Card>
    </a>
  );
};

export default LinkCard;
