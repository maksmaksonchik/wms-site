import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import A from "@/components/typography/a";

const components: Components = {
  strong: ({ children }) => <b className="font-bold">{children}</b>,
  em: ({ children }) => <i className="italic">{children}</i>,
  a: A,
};

const Markdown = ({ children }: { children: string | undefined | null }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

export default Markdown;
