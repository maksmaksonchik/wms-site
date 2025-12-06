export type Donator = {
  /** Имя спонсора */
  name: string;

  /** URL на аватарку */
  avatar?: string;
};

export type Sponsor = {
  /** Уровень спонсора */
  level: "bronze" | "silver" | "gold";

  /** Название компании */
  name: string;

  /** URL на страницу компании */
  href?: string;

  /** Логотипы компании */
  logo: {
    /** URL для светлой темы */
    light_theme: string;

    /** URL для тёмной темы */
    dark_theme: string;
  };
};
