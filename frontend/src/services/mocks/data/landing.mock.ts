import { LandingPage } from "@/types/landing-page.types";

export const landingData: LandingPage = {
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
  hero: {
    id: 21,
    heading: "Зимняя математическая школа",
    badge: "ЗМШ-59",
    dates: "29 января — 5 февраля, 2025",
    location: {
      id: 22,
      label: "ФОК Гагаринский",
      href: "https://fokgagarin.ru/contacts/",
    },
    background: {
      id: 2,
      documentId: "yzh3ifu7qz0azchg10u09gvl",
      url: "/uploads/bg_61033cbb69.jpg",
    },
  },
  sections: [
    {
      id: 22,
      documentId: "ekb7okx53i73uirmf1lac9hu",
      heading: "Что такое ЗМШ?",
      badge: "О нас",
      description: null,
      anchorId: null,
      blocks: [
        {
          __component: "blocks.link-card-grid",
          id: 4,
          cards: [
            {
              id: 17,
              title: "Телеграм-канал школы",
              subtitle: "Новости ЗМШ",
              href: "https://t.me/zmsh_dmm_GetYear",
            },
            {
              id: 18,
              title: "Правила ЗМШ",
              subtitle: "Что нужно знать перед поездкой",
              href: "https://buildin.ai/share/6c9cfa4b-33f1-4554-88e5-dad27ce7941b",
            },
          ],
        },
      ],
    },
    {
      id: 21,
      documentId: "d9ge9ahqejquesl7g3pbytdu",
      heading: "Лекции — первопричина ЗМШ",
      badge: "Расписание",
      description: null,
      anchorId: "program",
      blocks: [
        {
          __component: "blocks.schedule",
          id: 5,
          schedule: {
            id: 2,
            documentId: "w5qw9hgc6n79c9dpge4pi8mt",
          },
        },
      ],
    },
    {
      id: 28,
      documentId: "g976c8h8m6n0fcjypijdk3q1",
      heading: "Стать участником",
      badge: "Участники",
      description: null,
      anchorId: "members",
      blocks: [
        {
          __component: "blocks.link-card",
          id: 21,
          title: "Кто едет?",
          subtitle: "Список ЗМШат 2026",
          href: "https://buildin.ai/share/696d3aee-85e7-4e62-b004-cdf6a4013eba",
        },
        {
          __component: "blocks.call-to-action",
          id: 5,
          title: "Приезжайте на денёк!",
          description:
            "Получаешь спальное место в комфортном корпусе на одну ночь и три приёма пищи.",
          button: {
            id: 16,
            label: "Забронировать место",
            href: "https://buildin.ai/share/9705240a-f14d-4c21-b45f-31855bda53d4",
          },
        },
      ],
    },
    {
      id: 13,
      documentId: "dk7khz1844fo3r18faz2rwyq",
      heading: "Как добраться на ЗМШ?",
      badge: "Маршрут",
      description: null,
      anchorId: "directions",
      blocks: [
        {
          __component: "blocks.image-with-accordion",
          id: 2,
          isReversed: false,
          image: {
            id: 2,
            alt: "Схема проезда",
            src: {
              id: 15,
              documentId: "vv63exqlywcw88vnxxb22si9",
              url: "/uploads/directions_d97a2a334c.jpg",
            },
          },
          accordion: {
            id: 2,
            items: [
              {
                id: 2,
                trigger: "На автобусе 🚌",
                content:
                  "Туда: 29 января в 10:00. Сбор в 9:30 у [Ленина, 51](https://yandex.ru/maps/-/CHadAZ0Q).\n*На месте будет [Макс Фёдоров](https://t.me/MYuFyodorov)*.\n\nОбратно: 5 февраля в 11:00.",
              },
            ],
          },
        },
      ],
    },
    {
      id: 25,
      documentId: "zz5ulx2qcryohtfixwgxknqa",
      heading: "Поддержать ЗМШ",
      badge: "Спонсоры",
      description: null,
      anchorId: "sponsors",
      blocks: [
        {
          __component: "blocks.sponsors-gallery",
          id: 3,
          goldHeading: "Генеральные партнёры ЗМШ-60",
          silverHeading: "Партнёры ЗМШ-60",
          bronzeHeading: "Официальные спонсоры ЗМШ-60",
          personalHeading: "Индивидуальные спонсоры ЗМШ-60",
        },
      ],
    },
    {
      id: 24,
      documentId: "bdy6yuxy9py8emkl5vft69l8",
      heading: "ЗМШ — это...",
      badge: "Карточки",
      description: null,
      anchorId: null,
      blocks: [
        {
          __component: "blocks.school-is-gallery",
          id: 2,
          view: "carousel",
        },
      ],
    },
    {
      id: 20,
      documentId: "r173nf5vzb2qr4et8omye3cb",
      heading: "Прошедшие школы",
      badge: "Прошлое",
      description: null,
      anchorId: "past",
      blocks: [
        {
          __component: "blocks.link-card-grid",
          id: 2,
          cards: [
            {
              id: 13,
              title: "ЗМШ-2025",
              subtitle: "Страница прошлого года",
              href: "https://buildin.ai/share/a3298854-6a28-4e24-abca-3db4a111f37d",
            },
            {
              id: 14,
              title: "ЗМШ-2024",
              subtitle: "Здесь можно найти информацию о прошлых школах",
              href: "https://zmsh.notion.site/",
            },
          ],
        },
      ],
    },
  ],
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
