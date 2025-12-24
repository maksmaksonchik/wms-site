import { Accordion } from "./accordion.types";
import { CallToAction } from "./call-to-action.types";
import { LinkCard } from "./link-card.types";
import { Image } from "./image.types";
import { ImageWithAccordion } from "./image-with-accordion.types";
import { LinkCardGrid } from "./link-card-grid.types";
import { SchoolIsGallery } from "./school-is-gallery.types";
import { SponsorsGallery } from "./sponsors-gallery.types";
import { Schedule } from "./schedule.types";

type Block =
  | LinkCard
  | CallToAction
  | ImageWithAccordion
  | LinkCardGrid
  | SchoolIsGallery
  | SponsorsGallery
  | Schedule;

export type {
  Block,
  LinkCard,
  CallToAction,
  Accordion,
  Image,
  ImageWithAccordion,
  LinkCardGrid,
  SchoolIsGallery,
  SponsorsGallery,
  Schedule,
};
