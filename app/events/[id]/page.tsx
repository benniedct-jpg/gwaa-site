import { notFound } from 'next/navigation';
import Link from 'next/link';
import { dbGet } from '@/lib/db/serverDB';
import { fetchStore } from '@/lib/db/serverFetch';
import { EventCard } from '@/types';
import EventDetailClient from './EventDetailClient';

export const revalidate = 60;

const MAP: Record<string, string> = {
  image_data: 'imageData', image_data2: 'imageData2', tag_color: 'tagColor',
  link_text: 'linkText', date_text: 'date', location: 'loc', description: 'desc',
  pet_info: 'petInfo', type_label: 'typeLabel', is_partner: 'isPartner',
  is_main: 'isMain', cta_text: 'ctaText',
};
function fromDb(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[MAP[k] ?? k] = v;
  return out;
}

function isConfigured() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!(url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);

  let event: EventCard | null = null;

  if (isConfigured()) {
    try {
      const row = await dbGet('event_cards', numId);
      if (row) event = fromDb(row as Record<string, unknown>) as unknown as EventCard;
    } catch {
      event = null;
    }
  } else {
    const all = await fetchStore<EventCard>('event_cards');
    event = all.find((e) => e.id === numId) ?? null;
  }

  if (!event) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 48, color: '#111' }}>행사를 찾을 수 없어요</div>
        <Link href="/events" style={{ padding: '10px 24px', borderRadius: 9999, background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← 행사 목록으로</Link>
      </div>
    );
  }

  return <EventDetailClient event={event} />;
}
