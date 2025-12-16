import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCallToAction extends Struct.ComponentSchema {
  collectionName: 'components_blocks_call_to_actions';
  info: {
    displayName: 'Call To Action';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.button', false>;
    description: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksLinkCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_link_cards';
  info: {
    displayName: 'Link Card';
  };
  attributes: {
    href: Schema.Attribute.String;
    isInternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
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

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    copyright: Schema.Attribute.String;
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
    background: Schema.Attribute.Media<'images'>;
    badge: Schema.Attribute.String;
    dates: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    location: Schema.Attribute.Component<'shared.text-link', false>;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    href: Schema.Attribute.String;
    isInternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
  };
}

export interface SharedNavLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_links';
  info: {
    displayName: 'Nav Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    label: Schema.Attribute.String;
  };
}

export interface SharedTextLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_links';
  info: {
    displayName: 'Text Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    isInternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.call-to-action': BlocksCallToAction;
      'blocks.link-card': BlocksLinkCard;
      'blocks.schedule': BlocksSchedule;
      'layout.footer': LayoutFooter;
      'layout.header': LayoutHeader;
      'layout.hero': LayoutHero;
      'shared.button': SharedButton;
      'shared.nav-link': SharedNavLink;
      'shared.text-link': SharedTextLink;
    }
  }
}
