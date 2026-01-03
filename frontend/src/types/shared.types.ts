export type StrapiImage = {
  id: number;
  documentId: string;
  url: string;
};

export type Link = {
  id: number;
  label: string;
  href: string;
};

export type ThemedImage = {
  id: number;
  lightTheme: StrapiImage;
  darkTheme: StrapiImage;
};
