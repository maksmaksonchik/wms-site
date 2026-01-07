import Markdown from "@/components/typography/markdown";
import { Info as InfoProps } from "@/types/blocks/info.types";
import { Info as Note } from "lucide-react";

const Info = ({ title, description }: InfoProps) => {
  return (
    <div className="py-4 px-6 gap-4 bg-accent text-accent-foreground rounded-sm">
      <div className="flex items-center">
        <Note className="w-4.5 h-4.5 mr-4" />
        <div className="text-lg font-semibold">{title}</div>
      </div>

      <div
        className="ml-8.5" // ширина + отступ иконки
      >
        <Markdown>{description}</Markdown>
      </div>
    </div>
  );
};

export default Info;
