import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import A from "@/components/typography/a";

const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-8 py-2 font-semibold text-3xl">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="mt-6 py-2 font-semibold text-2xl">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-4 py-2 font-semibold text-xl">{children}</h4>
  ),

  p: ({ children }) => (
    <p className="mt-2 first:mt-0 leading-relaxed">{children}</p>
  ),

  /** Вместо линии, оставляем пустое пространство размером с <p> */
  hr: () => <div className="h-6.5 mt-2 first:mt-0"></div>,

  ul: ({ children }) => <ul className="list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal">{children}</ol>,
  li: ({ children }) => <li className="ml-8">{children}</li>,

  blockquote: ({ children }) => (
    <blockquote className="mt-2 first:mt-0 px-6 py-2 bg-accent rounded-sm text-base leading-relaxed">
      {children}
    </blockquote>
  ),

  strong: ({ children }) => <b className="font-bold">{children}</b>,
  em: ({ children }) => <i className="italic">{children}</i>,
  a: ({ children, href }) => (
    <A href={href} className="text-primary">
      {children}
    </A>
  ),
};

const Markdown = ({ children }: { children: string | undefined | null }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

export default Markdown;
