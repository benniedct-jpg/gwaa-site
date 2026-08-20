import { NextRequest, NextResponse } from 'next/server';
import { supaConfigured, db } from '@/lib/bookingsDb';
import { verifyAdmin } from '@/lib/adminAuth';

// 관리자 전용 — 회비·후원 결제 내역 조회 (최신순)
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req.cookies.get('gwaa_admin_auth')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supaConfigured()) return NextResponse.json([], { status: 200 });

  const { data, error } = await db()
    .from('payments').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? [], { headers: { 'Cache-Control': 'no-store' } });
}
