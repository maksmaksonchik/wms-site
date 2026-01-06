import Markdown from "@/components/typography/markdown";
import { MarkdownBlock as MarkdownBlockProps } from "@/types/blocks";

const MarkdownBlock = ({ text }: MarkdownBlockProps) => {
  return (
    <div className="mb-8">
      <Markdown>{text}</Markdown>
    </div>
  );
};

export default MarkdownBlock;
