"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { siteConfig } from "@/config/site.config";
import { ThemeToggle } from "./theme-toggle";
import Logo from "./logo";

const navLinks = [
  { id: "program", label: "Расписание" },
  { id: "members", label: "Участники" },
  { id: "sponsors", label: "Спонсоры" },
  { id: "directions", label: "Как добраться" },
  { id: "merch", label: "Мерч" },
  { id: "past", label: "Прошлые школы" },
];

const MenuIcon = () => {
  return (
    <>
      <Menu className="h-6 w-6" />
      <span className="sr-only">Открыть меню</span>
    </>
  );
};

const CloseIcon = () => {
  return (
    <>
      <X className="h-6 w-6" />
      <span className="sr-only">Закрыть меню</span>
    </>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMenuOpen(false);
    e.currentTarget.blur();
  };

  return (
    <header className="fixed inset-x-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
        <Link
          href="#hero"
          onClick={(e) => handleLinkClick(e)}
          className="flex items-center gap-2 transition hover:text-primary text-lg font-semibold tracking-tight"
        >
          <Logo variant="primary" className="w-[1.5em] h-[1.5em]" />
          <span>{siteConfig.title}</span>
        </Link>

        {/* Десктопное меню */}
        <div className="hidden md:flex items-center gap-2">
          <NavigationMenu className=" ml-auto">
            <NavigationMenuList className="flex-nowrap">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.id}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={`#${link.id}`}
                      onClick={(e) => handleLinkClick(e)}
                      className="font-medium whitespace-nowrap"
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle variant="outline" />
        </div>

        {/* Мобильное меню */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle variant="ghost" />

          <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              side="bottom"
              sideOffset={20}
              alignOffset={-12}
            >
              <nav>
                {navLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleLinkClick(e)}
                    className="block p-3 text-lg font-medium rounded-md transition hover:bg-accent hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default Header;
