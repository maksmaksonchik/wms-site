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

import { ThemeToggle } from "@/components/theme-toggle";
import WmsLogo from "@/components/ui/wms-logo";
import Container from "@/components/container";
import Link from "@/components/core/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  title: string;
  data: HeaderData;
};

const Header = ({ title, data }: HeaderProps) => {
  const { navLinks } = data;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMenuOpen(false);
    e.currentTarget.blur();
  };

  return (
    <header className="fixed inset-x-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
      <Container className="flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          onClick={(e) => handleLinkClick(e)}
          className="flex items-center gap-2 transition hover:text-primary text-lg font-semibold tracking-tight"
        >
          <WmsLogo variant="primary" className="w-[1.5em] h-[1.5em]" />
          <span>{title}</span>
        </Link>

        {/* Десктопное меню */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks && (
            <NavigationMenu className="ml-auto">
              <NavigationMenuList className="flex-nowrap">
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.id}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={link.href}
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
          )}
          <ThemeToggle variant="outline" />
        </div>

        {/* Мобильное меню */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle variant="ghost" />

          {navLinks && (
            <DropdownMenu
              modal={false}
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <nav>
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.id} asChild>
                      <Link
                        href={link.href}
                        className="cursor-pointer"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </nav>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Header;
