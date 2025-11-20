"use client";

import Link from "next/link";
import Image from "next/image";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/config/site.config";

const navLinks = [
  { id: "program", label: "Расписание" },
  { id: "members", label: "Участники" },
  { id: "sponsors", label: "Спонсоры" },
  { id: "directions", label: "Как добраться" },
  { id: "merch", label: "Мерч" },
  { id: "past", label: "Прошлые школы" },
];

const Header = () => {
  return (
    <header className="fixed inset-x-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-4 sm:gap-8 sm:px-10 lg:px-16">
        <Link
          href="#hero"
          className="flex items-center gap-2 transition hover:text-primary text-lg font-semibold tracking-tight"
        >
          <Image
            src={siteConfig.logo}
            alt="Логотип"
            width={24}
            height={24}
            className="w-[1.5em] h-[1.5em]"
            priority
          />
          <span>{siteConfig.title}</span>
        </Link>

        <NavigationMenu className="mx-auto">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.id}>
                <NavigationMenuLink
                  asChild
                  onClick={(e) => e.currentTarget.blur()}
                >
                  <Link href={`#${link.id}`}>{link.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
