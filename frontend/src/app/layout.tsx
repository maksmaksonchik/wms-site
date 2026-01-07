import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { strapi } from "@/services/strapi";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const generateMetadata = async (): Promise<Metadata> => {
  const { title, description } = await strapi.getGlobal();

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description: description,
  };
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { title, header, footer } = await strapi.getGlobal();

  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <Header title={title} data={header} />

          <main className="flex-1">{children}</main>

          <Footer data={footer} />
        </ThemeProvider>
      </body>
    </html>
  );
}
