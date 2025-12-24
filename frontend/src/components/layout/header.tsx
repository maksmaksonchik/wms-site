"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Header as HeaderData } from "@/types/layout/header.types";
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
import { ThemeToggle } from "@/components/theme-toggle";
import WmsLogo from "@/components/ui/wms-logo";
import Container from "@/components/container";

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

type HeaderProps = {
  data: HeaderData;
};

const Header = ({ data }: HeaderProps) => {
  const { navLinks } = data;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMenuOpen(false);
    e.currentTarget.blur();
  };

  return (
    <header className="fixed inset-x-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
      <Container className="flex items-center justify-between gap-4 py-4">
        <a
          href="#hero"
          onClick={(e) => handleLinkClick(e)}
          className="flex items-center gap-2 transition hover:text-primary text-lg font-semibold tracking-tight"
        >
          <WmsLogo variant="primary" className="w-[1.5em] h-[1.5em]" />
          <span>{siteConfig.title}</span>
        </a>

        {/* Десктопное меню */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks && (
            <NavigationMenu className=" ml-auto">
              <NavigationMenuList className="flex-nowrap">
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.id}>
                    <NavigationMenuLink asChild>
                      <a
                        href={link.href}
                        onClick={(e) => handleLinkClick(e)}
                        className="font-medium whitespace-nowrap"
                      >
                        {link.label}
                      </a>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}
          <ThemeToggle variant="outline" />
        </div>

        {/* Мобильное меню */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle variant="ghost" />

          {navLinks && (
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
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      onClick={(e) => handleLinkClick(e)}
                      className="block p-3 text-lg font-medium rounded-md transition hover:bg-accent hover:text-primary"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Header;
