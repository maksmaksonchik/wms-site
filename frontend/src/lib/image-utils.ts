export const getStrapiImageUrl = (url: string): string => {
  const baseURL = process.env.NEXT_PUBLIC_ASSETS_BASE_URL;
  return `${baseURL}${url}`;
};
