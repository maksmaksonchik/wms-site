import { Subsection } from "@/components/layout/section";
import { strapi } from "@/services/strapi";
import { SponsorsGallery as SponsorsGalleryProps } from "@/types/blocks";
import Grid from "../grid/grid";
import LogoCard from "./logo-card";
import PersonCard from "./person-card";

const SponsorsGallery = async ({
  goldHeading,
  silverHeading,
  bronzeHeading,
  personalHeading,
}: SponsorsGalleryProps) => {
  const { gold, silver, bronze, personal } = await strapi.getSponsors();

  return (
    <>
      {gold.length > 0 && (
        <Subsection title={goldHeading}>
          <Grid type="fixed" cols={3}>
            {gold.map((sponsor, index) => (
              <LogoCard
                key={`gold-${index}`}
                sponsor={sponsor}
                variant="large"
              />
            ))}
          </Grid>
        </Subsection>
      )}

      {silver.length > 0 && (
        <Subsection title={silverHeading}>
          <Grid type="fixed" cols={4}>
            {silver.map((sponsor, index) => (
              <LogoCard key={`silver-${index}`} sponsor={sponsor} />
            ))}
          </Grid>
        </Subsection>
      )}

      {bronze.length > 0 && (
        <Subsection title={bronzeHeading}>
          <Grid type="fixed" cols={5}>
            {bronze.map((sponsor, index) => (
              <LogoCard key={`bronze-${index}`} sponsor={sponsor} />
            ))}
          </Grid>
        </Subsection>
      )}

      {personal.length > 0 && (
        <Subsection title={personalHeading}>
          <Grid type="fixed" cols={3} className="gap-4 sm:gap-6">
            {personal.map((sponsor, index) => (
              <PersonCard
                key={`personal-${index}`}
                avatar={sponsor.avatar?.url}
                name={sponsor.name}
              />
            ))}
          </Grid>
        </Subsection>
      )}
    </>
  );
};

export default SponsorsGallery;
