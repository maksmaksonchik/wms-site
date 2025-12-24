import { Button } from "@/components/ui/button";
import type { CallToAction as CallToActionProps } from "@/types/blocks";

const CallToAction = ({ title, description, button }: CallToActionProps) => {
  return (
    <div className="text-card-foreground flex flex-wrap items-center justify-between gap-6 rounded-xl border-2 border-dotted p-6">
      <div className="space-y-2 flex-1 min-w-[60%]">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <Button size="lg" asChild className="shrink-0">
        <a href={button.href} target="_blank" rel="noopener noreferrer">
          {button.label}
        </a>
      </Button>
    </div>
  );
};

export default CallToAction;
