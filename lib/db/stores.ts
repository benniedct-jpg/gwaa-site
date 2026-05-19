// Shared store/table name constants — no 'use client', safe for both server and client
export const STORES = {
  HERO:     'heroImages',
  ACTIVITY: 'activityCards',
  EVENT:    'eventCards',
  LOOKBOOK: 'lookbookItems',
  ARCHIVE:  'archiveEvents',
  PLACES:   'travelPlaces',
  HASHTAGS: 'pageHashtags',
  MATESHIP: 'mateshipPartners',
  GALLERY:  'galleryItems',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];
