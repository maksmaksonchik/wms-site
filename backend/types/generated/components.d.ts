import type { Schema, Struct } from '@strapi/strapi';

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

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
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
      'layout.footer': LayoutFooter;
      'layout.header': LayoutHeader;
      'sections.hero': SectionsHero;
      'shared.nav-link': SharedNavLink;
      'shared.text-link': SharedTextLink;
    }
  }
}
