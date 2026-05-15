export interface HeroImage {
  id: 1 | 2 | 3;
  imageData: string | null;
}

export interface ActivityCard {
  id?: number;
  order: number;
  imageData: string | null;
  tag: string;
  tagColor: 'green' | 'blue' | 'amber' | 'purple';
  icon: string;
  title: string;
  desc: string;
  link: string;
  linkText: string;
}

export type EventStatus = 'live' | 'soon' | 'upcoming' | 'ended';

export interface EventCard {
  id?: number;
  order: number;
  imageData: string | null;
  images: string[];
  title: string;
  date: string;
  loc: string;
  desc: string;
  content: string;
  status: EventStatus;
  link: string;
  benefit: string;
  ctaText: string;
}

export interface LookbookItem {
  id?: number;
  order: number;
  imageData: string | null;
  label: string;
  link: string;
  isMain: boolean;
}

export interface ArchiveEvent {
  id?: number;
  order: number;
  feat: boolean;
  year: number;
  title: string;
  loc: string;
  ppl: string;
  date: string;
  place: string;
  part: string;
  organizer: string;
  desc: string;
  imageData: string | null;
  imageData2: string | null;
  images?: string[];
}

export interface TravelPlace {
  id?: number;
  order: number;
  region: string;
  type: string;
  typeLabel: string;
  name: string;
  icon: string;
  address: string;
  feature: string;
  desc: string;
  petInfo: string;
  isPartner: boolean;
  imageData: string | null;
  mapUrl: string;
}

export interface PageHashtags {
  page: 'index' | 'events' | 'travel' | 'education' | 'mateship' | 'about';
  tags: string[];
}

export interface MateshipPartner {
  id?: number;
  order: number;
  name: string;
  region: string;
  type: string;
  discount: string;
  icon: string;
  gradient: string;
  link: string;
  imageData: string | null;
}

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children: NavChild[];
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface Benefit {
  num: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TocSection {
  id: string;
  label: string;
}

export interface GalleryItem {
  id?: number;
  order: number;
  imageData: string | null;
  caption: string;
  active: boolean;
}

export type TagColor = 'green' | 'blue' | 'amber' | 'gray' | 'dark' | 'live' | 'soon' | 'upcoming' | 'ended';
export type ButtonVariant = 'primary' | 'outline' | 'white' | 'dark' | 'ghost-white';
export type ButtonSize = 'sm' | 'md' | 'lg';
