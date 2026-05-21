'use client';

import { useState, useEffect, useCallback } from 'react';

export type StoreName =
  | 'heroImages'
  | 'activityCards'
  | 'eventCards'
  | 'archiveEvents'
  | 'travelPlaces'
  | 'mateshipPartners'
  | 'lookbookItems'
  | 'galleryItems'
  | 'pageHashtags';

// Frontend store name → API table name
const TABLE: Record<StoreName, string> = {
  heroImages:        'hero_images',
  activityCards:     'activity_cards',
  eventCards:        'event_cards',
  archiveEvents:     'archive_events',
  travelPlaces:      'travel_places',
  mateshipPartners:  'mateship_partners',
  lookbookItems:     'lookbook_items',
  galleryItems:      'gallery_items',
  pageHashtags:      'page_hashtags',
};

function url(store: StoreName) {
  return `/api/data/${TABLE[store]}`;
}

export function useGWAADB<T>(store: StoreName, initialData?: T[]) {
  const [data, setData]       = useState<T[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError]     = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(url(store));
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    if (!initialData) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const put = useCallback(async (item: T) => {
    const method = (item as any).id ? 'PUT' : 'POST';
    await fetch(url(store), { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
    await load();
  }, [store, load]);

  const remove = useCallback(async (id: number | string) => {
    await fetch(`${url(store)}?id=${id}`, { method: 'DELETE' });
    await load();
  }, [store, load]);

  return { data, loading, error, refresh: load, put, remove };
}

export function useGWAADBItem<T>(store: StoreName, id: number | string | null) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === null) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`${url(store)}?id=${id}`);
        setData(res.ok ? await res.json() : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [store, id]);

  return { data, loading };
}
