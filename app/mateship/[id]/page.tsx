import { notFound } from 'next/navigation';
import { fetchStore } from '@/lib/db/serverFetch';
import { MateshipPartner } from '@/types';
import StayTemplate    from '@/components/sections/mateship/detail/StayTemplate';
import BrandTemplate   from '@/components/sections/mateship/detail/BrandTemplate';
import ServiceTemplate from '@/components/sections/mateship/detail/ServiceTemplate';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const partners = await fetchStore<MateshipPartner>('mateship_partners');
  const partner = partners.find(p => String(p.id) === id || String(p.order) === id);
  if (!partner) return {};
  return {
    title: `${partner.name} | GWAA 메이트쉽`,
    description: partner.detail?.description ?? `${partner.name} — GWAA 메이트쉽 회원 전용 ${partner.discount}`,
  };
}

export default async function PartnerDetailPage({ params }: Props) {
  const { id } = await params;
  const partners = await fetchStore<MateshipPartner>('mateship_partners');
  const partner = partners.find(p => String(p.id) === id || String(p.order) === id);

  if (!partner || !partner.detail) notFound();

  const { templateType } = partner.detail;

  if (templateType === 'stay')    return <StayTemplate    partner={partner} />;
  if (templateType === 'brand')   return <BrandTemplate   partner={partner} />;
  if (templateType === 'service') return <ServiceTemplate partner={partner} />;

  notFound();
}
