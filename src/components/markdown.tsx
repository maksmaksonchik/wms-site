import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

// TODO: Доработать компоненты Markdown
const components: Components = {
  strong: ({ children }) => <b className="font-bold">{children}</b>,
  em: ({ children }) => <i className="italic">{children}</i>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" className="text-primary hover:underline">
      {children}
    </a>
  ),
};

const Markdown = ({ children }: { children: string | undefined | null }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

export default Markdown;
