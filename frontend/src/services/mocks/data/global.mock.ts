import { Global } from "@/types/global.types";

export const globalData: Global = {
  title: "ЗМШ",
  description: "Официальный сайт Зимней математической школы",
  header: {
    id: 29,
    navLinks: [
      {
        id: 17,
        label: "Расписание",
        href: "#program",
      },
      {
        id: 18,
        label: "Участники",
        href: "#members",
      },
      {
        id: 19,
        label: "Как добраться",
        href: "#directions",
      },
      {
        id: 20,
        label: "Спонсоры",
        href: "#sponsors",
      },
      {
        id: 21,
        label: "Прошедшие школы",
        href: "#past",
      },
    ],
  },
  footer: {
    id: 27,
    copyright: "Зимняя математическая школа",
    link: {
      id: 23,
      label: "Телеграм: Новости ЗМШ",
      href: "https://t.me/zmsh_dmm_GetYear",
    },
  },
};
