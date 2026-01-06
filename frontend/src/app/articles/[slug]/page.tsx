import { BlocksRenderer } from "@/components/blocks";
import Container from "@/components/container";
import { strapi } from "@/services/strapi";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ArticleProps = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({
  params,
}: ArticleProps): Promise<Metadata> => {
  const { slug } = await params;

  const article = await strapi.getArticle(slug);

  if (!article) {
    return {};
  }

  const { title } = article;

  return {
    title: `${title}`,
  };
};

const Article = async ({ params }: ArticleProps) => {
  const { slug } = await params;

  const article = await strapi.getArticle(slug);

  if (!article) {
    notFound();
  }

  const { title, blocks } = article;

  return (
    <Container className="py-20">
      <article className="flex flex-col gap-6">
        <h1 className="py-2 text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <div>
          <BlocksRenderer blocks={blocks} />
        </div>
      </article>
    </Container>
  );
};

export default Article;
