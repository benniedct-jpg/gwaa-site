import type { MetadataRoute } from 'next';
import { fetchStore } from '@/lib/db/serverFetch';
import { EventCard } from '@/types';

const SITE = 'https://gwaa.or.kr';

export const revalidate = 3600;

// 홈 + 정적 페이지 + 모든 행사 상세(자동 포함: 새 행사 올리면 반영)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/about', '/education', '/events', '/travel', '/mateship', '/contact', '/support', '/membership'];
  const now = new Date();
  const base: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE}${p}`, lastModified: now,
    changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7,
  }));

  let events: EventCard[] = [];
  try { events = await fetchStore<EventCard>('event_cards'); } catch { events = []; }
  const eventUrls: MetadataRoute.Sitemap = events
    .filter((e) => e && e.id != null)
    .map((e) => ({ url: `${SITE}/events/${e.id}`, lastModified: now, changeFrequency: 'daily', priority: 0.9 }));

  return [...base, ...eventUrls];
}
