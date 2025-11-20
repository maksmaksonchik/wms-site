import { Button } from "./ui/button";

type Props = {
  title: string;
  description?: string;
  buttonText: string;
  href: string;
};

const CallToAction = ({ title, description, buttonText, href }: Props) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-muted p-6">
      <div className="space-y-1">
        <h3 className="text-2xl font-semibold">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <Button size="lg" asChild>
        <a href={href} target="_blank">
          {buttonText}
        </a>
      </Button>
    </div>
  );
};

export default CallToAction;
