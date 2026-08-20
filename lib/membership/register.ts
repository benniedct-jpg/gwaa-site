import { db } from '@/lib/bookingsDb';

// 전화번호 정규화 (카카오 로그인 매칭과 동일 규칙)
export function normPhone(p?: string | null): string {
  let d = (p || '').replace(/[^0-9]/g, '');
  if (d.startsWith('82')) d = '0' + d.slice(2);
  return d;
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

// 현재 만료일 이후(또는 오늘)에서 +1개월
export function nextExpiry(currentExpires?: string | null): string {
  const now = new Date();
  const base = currentExpires && new Date(currentExpires) > now ? new Date(currentExpires) : now;
  base.setMonth(base.getMonth() + 1);
  return ymd(base);
}

// 회비 결제 성공 시 members 테이블에 회원 등록/갱신(+1개월). billingKey가 있으면 정기결제용으로 저장.
export async function registerOrExtendMember(opts: {
  name?: string; phone?: string; email?: string; billingKey?: string;
}): Promise<boolean> {
  const phone = normPhone(opts.phone);
  if (!phone) return false;

  const { data: all } = await db().from('members').select('*');
  const members = (all as Record<string, unknown>[]) || [];
  const match = members.find((m) => normPhone(m.phone as string) === phone);

  if (match) {
    const patch: Record<string, unknown> = {
      status: 'active',
      name: opts.name || match.name,
      email: opts.email || match.email,
      plan: 'monthly',
      expires_at: nextExpiry(match.expires_at as string),
    };
    if (opts.billingKey) patch.billing_key = opts.billingKey;
    const { error } = await db().from('members').update(patch).eq('id', match.id);
    return !error;
  }

  const year = new Date().getFullYear();
  const memberNo = `GWAA-${year}-${String(members.length + 1).padStart(4, '0')}`;
  const { error } = await db().from('members').insert({
    member_no: memberNo,
    name: opts.name,
    phone,
    email: opts.email,
    status: 'active',
    plan: 'monthly',
    joined_at: ymd(new Date()),
    expires_at: nextExpiry(null),
    order: members.length + 1,
    note: '회비 결제 자동 등록',
    billing_key: opts.billingKey ?? null,
  });
  return !error;
}
