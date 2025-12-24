// "use client";

// import Section from "@/components/layout/section";
// import QuoteCard from "@/components/blocks/school-is-gallery/quote-card";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";

// const content = {
//   id: "school-is",
//   title: "ЗМШ — это...",
//   description: "Что думают про ЗМШ участники.",
//   badge: "Отзывы",
// };

// const quotes = [
//   {
//     description: "…следовать своей мечте.",
//     name: "Сергей Сизый",
//     credentials: "Кандидат физ.-мат. наук, доктор тех. наук, Папа ЗМШ",
//     image: "/school_is/sizyj.jpg",
//     imageAlt: "Сергей Сизый",
//   },
//   {
//     description: "…люди, среди которых ты никогда не останешься один.",
//     name: "Полина Скалкина",
//     credentials: "iOS Head at Doubletapp",
//     image: "/school_is/skalkina.jpg",
//     imageAlt: "Полина Скалкина",
//   },
//   {
//     description: "…когда тебя понимают.",
//     name: "Матвей Незнаев",
//     credentials: "Студент Матмеха, разработчик в Doubletapp",
//     image: "/school_is/neznajev.jpg",
//     imageAlt: "Матвей Незнаев",
//   },
//   {
//     description: "…место, где идеи становятся реальностью.",
//     name: "Александр Петров",
//     credentials: "CTO в стартапе, выпускник ЗМШ-58",
//     image: "/school_is/petrov.jpg",
//     imageAlt: "Александр Петров",
//   },
//   {
//     description: "…когда ты находишь единомышленников на всю жизнь.",
//     name: "Елена Волкова",
//     credentials: "Data Scientist, Яндекс",
//     image: "/school_is/volkova.jpg",
//     imageAlt: "Елена Волкова",
//   },
//   {
//     description: "…возможность учиться у лучших и делиться опытом.",
//     name: "Дмитрий Козлов",
//     credentials: "Backend Lead, VK",
//     image: "/school_is/kozlov.jpg",
//     imageAlt: "Дмитрий Козлов",
//   },
//   {
//     description: "…атмосфера, которая вдохновляет на новые проекты.",
//     name: "Мария Иванова",
//     credentials: "Frontend Developer, Tinkoff",
//     image: "/school_is/ivanova.jpg",
//     imageAlt: "Мария Иванова",
//   },
//   {
//     description: "…когда математика и программирование встречаются с дружбой.",
//     name: "Андрей Смирнов",
//     credentials: "PhD по математике, лектор ЗМШ",
//     image: "/school_is/smirnov.jpg",
//     imageAlt: "Андрей Смирнов",
//   },
//   {
//     description: "…место, где каждый может найти свой путь.",
//     name: "Ольга Новикова",
//     credentials: "Product Manager, Сбер",
//     image: "/school_is/novikova.jpg",
//     imageAlt: "Ольга Новикова",
//   },
//   {
//     description: "…когда ты понимаешь, что не один в своих интересах.",
//     name: "Иван Федоров",
//     credentials: "ML Engineer, Яндекс",
//     image: "/school_is/fedorov.jpg",
//     imageAlt: "Иван Федоров",
//   },
// ];

// const SchoolIs = () => {
//   const { id, title, description, badge } = content;

//   return (
//     <Section id={id} badge={badge} title={title} description={description}>
//       <Carousel
//         opts={{
//           loop: true,
//           align: "start",
//         }}
//         className="mx-auto w-3/4 sm:w-[90%] lg:w-full"
//       >
//         <CarouselContent>
//           {quotes.map((quote, index) => (
//             <CarouselItem
//               key={index}
//               className="basis-full sm:basis-1/3 lg:basis-1/4"
//             >
//               <QuoteCard {...quote} />
//             </CarouselItem>
//           ))}
//         </CarouselContent>
//         <CarouselPrevious className="cursor-pointer" />
//         <CarouselNext className="cursor-pointer" />
//       </Carousel>
//     </Section>
//   );
// };

// export default SchoolIs;
