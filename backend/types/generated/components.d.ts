import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAccordion extends Struct.ComponentSchema {
  collectionName: 'components_blocks_accordions';
  info: {
    displayName: 'Accordion';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.accordion-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface BlocksCallToAction extends Struct.ComponentSchema {
  collectionName: 'components_blocks_call_to_actions';
  info: {
    displayName: 'Call To Action';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.button', false> &
      Schema.Attribute.Required;
    description: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksImage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_images';
  info: {
    displayName: 'Image';
  };
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required;
    src: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface BlocksImageWithAccordion extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_with_accordions';
  info: {
    displayName: 'Image With Accordion';
  };
  attributes: {
    accordion: Schema.Attribute.Component<'blocks.accordion', false> &
      Schema.Attribute.Required;
    image: Schema.Attribute.Component<'blocks.image', false> &
      Schema.Attribute.Required;
    isReversed: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface BlocksLinkCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_link_cards';
  info: {
    displayName: 'Link Card';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    isInternal: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksLinkCardGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_link_card_grids';
  info: {
    displayName: 'Link Card Grid';
  };
  attributes: {
    cards: Schema.Attribute.Component<'blocks.link-card', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 2;
        },
        number
      >;
  };
}

export interface BlocksSchedule extends Struct.ComponentSchema {
  collectionName: 'components_blocks_schedules';
  info: {
    displayName: 'Schedule';
  };
  attributes: {
    schedule: Schema.Attribute.Relation<'oneToOne', 'api::schedule.schedule'>;
  };
}

export interface BlocksSchoolIsGalery extends Struct.ComponentSchema {
  collectionName: 'components_blocks_school_is_galeries';
  info: {
    displayName: 'School Is Galery';
  };
  attributes: {
    view: Schema.Attribute.Enumeration<['carousel']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'carousel'>;
  };
}

export interface BlocksSponsorsGalery extends Struct.ComponentSchema {
  collectionName: 'components_blocks_sponsors_galeries';
  info: {
    displayName: 'Sponsors Galery';
  };
  attributes: {
    bronzeHeading: Schema.Attribute.String & Schema.Attribute.Required;
    donorsHeading: Schema.Attribute.String & Schema.Attribute.Required;
    goldHeading: Schema.Attribute.String & Schema.Attribute.Required;
    silverHeading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    copyright: Schema.Attribute.String & Schema.Attribute.Required;
    link: Schema.Attribute.Component<'shared.text-link', false>;
  };
}

export interface LayoutHeader extends Struct.ComponentSchema {
  collectionName: 'components_layout_headers';
  info: {
    displayName: 'Header';
  };
  attributes: {
    navLinks: Schema.Attribute.Component<'shared.nav-link', true>;
  };
}

export interface LayoutHero extends Struct.ComponentSchema {
  collectionName: 'components_layout_heroes';
  info: {
    displayName: 'Hero';
  };
  attributes: {
    background: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    badge: Schema.Attribute.String & Schema.Attribute.Required;
    dates: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    location: Schema.Attribute.Component<'shared.text-link', false>;
  };
}

export interface SharedAccordionItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_accordion_items';
  info: {
    displayName: 'Accordion Item';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    trigger: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    isInternal: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_links';
  info: {
    displayName: 'Nav Link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTextLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_links';
  info: {
    displayName: 'Text Link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    isInternal: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedThemedImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_themed_images';
  info: {
    displayName: 'Themed Image';
  };
  attributes: {
    darkTheme: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    lightTheme: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.accordion': BlocksAccordion;
      'blocks.call-to-action': BlocksCallToAction;
      'blocks.image': BlocksImage;
      'blocks.image-with-accordion': BlocksImageWithAccordion;
      'blocks.link-card': BlocksLinkCard;
      'blocks.link-card-grid': BlocksLinkCardGrid;
      'blocks.schedule': BlocksSchedule;
      'blocks.school-is-galery': BlocksSchoolIsGalery;
      'blocks.sponsors-galery': BlocksSponsorsGalery;
      'layout.footer': LayoutFooter;
      'layout.header': LayoutHeader;
      'layout.hero': LayoutHero;
      'shared.accordion-item': SharedAccordionItem;
      'shared.button': SharedButton;
      'shared.nav-link': SharedNavLink;
      'shared.text-link': SharedTextLink;
      'shared.themed-image': SharedThemedImage;
    }
  }
}
