import { NextResponse, type NextRequest } from 'next/server';
import { REVIEW_ITEMS, updateLead, type LeadStatus, type Review, type ReviewKey } from '@/lib/leads/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Protected by basic auth in middleware.ts.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const origin = req.headers.get('origin');
  if (!origin || origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const review: Review = {};
  for (const k of Object.keys(REVIEW_ITEMS) as ReviewKey[]) review[k] = body.review?.[k] === true;
  const routedTo = typeof body.routedTo === 'string' && body.routedTo.trim() ? body.routedTo.trim().slice(0, 120) : null;
  const r = updateLead((await params).id, { status: String(body.status) as LeadStatus, review, notes: typeof body.notes === 'string' ? body.notes : '', routedTo });
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 422 });
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
