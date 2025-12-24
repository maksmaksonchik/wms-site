export const getStrapiImageUrl = (url: string): string => {
  const baseURL = process.env.ASSETS_BASE_URL;
  return `${baseURL}${url}`;
};

export const strapiImageLoader = ({ src }: { src: string }) => {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return getStrapiImageUrl(src);
};
