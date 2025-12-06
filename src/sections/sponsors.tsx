import { Section, Subsection } from "@/components/section";
import CardsGrid from "@/components/cards-grid";
import CardLink from "@/components/card-link";
import { sponsorsMock } from "@/mocks/sponsors";
import LogoCard from "@/components/logo-card";
import PersonCard from "@/components/person-card";

const content = {
  id: "sponsors",
  title: "Спонсоры",
  description: "Школа становится возможной благодаря спонсорам.",
  badge: "Поддержать ЗМШ",
};

const links = [
  {
    label: "Стать спонсором",
    href: "https://buildin.ai/share/01b2ecbb-ae39-4354-8b1b-77b3fc10396a",
  },
  {
    label: "Пакеты для бизнеса",
    href: "https://buildin.ai/share/3c5dcb3d-c7e0-4f1d-865b-e7de6304a1b4",
  },
];

const Grid = ({
  children,
  cols,
}: {
  children: React.ReactNode;
  cols: 3 | 4 | 5;
}) => {
  const classes: Record<string, string> = {
    3: "grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid gap-2 sm:gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5",
  };

  return <div className={classes[cols]}>{children}</div>;
};

const Sponsors = () => {
  const { id, title, description, badge } = content;

  const data = {
    gold: sponsorsMock.getSponsors("gold"),
    silver: sponsorsMock.getSponsors("silver"),
    bronze: sponsorsMock.getSponsors("bronze"),
    donators: sponsorsMock.getDonators(),
  };

  return (
    <Section id={id} badge={badge} title={title} description={description}>
      <CardsGrid>
        {links.map((stat) => (
          <CardLink key={stat.href} href={stat.href} label={stat.label} />
        ))}
      </CardsGrid>

      {/* Золотой уровень */}
      <Subsection title="Генеральные партнёры ЗМШ-60">
        <Grid cols={3}>
          {data.gold.map((sponsor, index) => (
            <LogoCard
              key={`gold-sponsor-${index}`}
              sponsor={sponsor}
              variant="large"
            />
          ))}
        </Grid>
      </Subsection>

      {/* Серебряный уровень */}
      <Subsection title="Партнёры ЗМШ-60">
        <Grid cols={4}>
          {data.silver.map((sponsor, index) => (
            <LogoCard key={`silver-sponsor-${index}`} sponsor={sponsor} />
          ))}
        </Grid>
      </Subsection>

      {/* Бронзовый уровень */}
      <Subsection title="Официальные спонсоры ЗМШ-60">
        <Grid cols={5}>
          {data.bronze.map((sponsor, index) => (
            <LogoCard key={`bronze-sponsor-${index}`} sponsor={sponsor} />
          ))}
        </Grid>
      </Subsection>

      {/* Доноры */}
      <Subsection title="Индивидуальные спонсоры ЗМШ-60">
        <CardsGrid className="gap-4 sm:gap-6">
          {data.donators.map((donator, index) => (
            <PersonCard
              key={`donator-${index}`}
              avatar={donator.avatar}
              name={donator.name}
            />
          ))}
        </CardsGrid>
      </Subsection>
    </Section>
  );
};

export default Sponsors;
