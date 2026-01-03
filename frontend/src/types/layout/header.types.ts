export type NavLink = {
  id: number;
  label: string;
  href: string;
};

export type Header = {
  id: number;
  navLinks?: NavLink[] | null;
};
