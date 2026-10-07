import { NextResponse, type NextRequest } from 'next/server';
import { checkFormToken, hashIp, rateLimited, saveLead } from '@/lib/leads/store';
import { validateLead } from '@/lib/leads/validate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const noStore = { 'Cache-Control': 'no-store' };

function clientIp(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  const isJson = (req.headers.get('content-type') || '').includes('application/json');
  let raw: Record<string, unknown>;
  try {
    raw = isJson ? await req.json() : Object.fromEntries((await req.formData()).entries());
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400, headers: noStore });
  }

  // Reject cross-site posts.
  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) {
    return NextResponse.json({ ok: false, error: 'Invalid origin.' }, { status: 403, headers: noStore });
  }

  // Honeypot: real users never see or fill this field. Respond generically, store nothing.
  if (typeof raw.company_website === 'string' && raw.company_website.trim() !== '') {
    return NextResponse.json({ ok: false, error: 'We could not process this request.' }, { status: 400, headers: noStore });
  }

  // Minimum fill time via signed token (JS clients). No-JS clients rely on honeypot + rate limit.
  if (isJson) {
    const reason = checkFormToken(typeof raw.formToken === 'string' ? raw.formToken : undefined);
    if (reason === 'too-fast' || reason === 'bad-signature' || reason === 'malformed') {
      return NextResponse.json({ ok: false, error: 'Please wait a moment and try again.' }, { status: 429, headers: noStore });
    }
  }

  const v = validateLead(raw);
  if (!v.ok) {
    if (!isJson) return NextResponse.redirect(new URL('/request-received/?status=invalid', req.url), 303);
    return NextResponse.json({ ok: false, errors: v.errors, error: 'Please check the highlighted fields.' }, { status: 422, headers: noStore });
  }

  try {
    const ipHash = hashIp(clientIp(req));
    if (rateLimited(ipHash, Number(process.env.LEADS_RATE_LIMIT_PER_HOUR) || 5)) {
      if (!isJson) return NextResponse.redirect(new URL('/request-received/?status=error', req.url), 303);
      return NextResponse.json({ ok: false, error: 'Too many requests. Please try again later.' }, { status: 429, headers: noStore });
    }
    const result = saveLead(v.data, { ipHash });
    if (!isJson) return NextResponse.redirect(new URL(`/request-received/?ref=${result.id}`, req.url), 303);
    return NextResponse.json({ ok: true, leadId: result.id, duplicate: result.kind === 'duplicate' }, { status: result.kind === 'created' ? 201 : 200, headers: noStore });
  } catch (err) {
    console.error('[leads] save failed', err instanceof Error ? err.message : err);
    if (!isJson) return NextResponse.redirect(new URL('/request-received/?status=error', req.url), 303);
    return NextResponse.json({ ok: false, error: 'Sorry, we could not save your request. Please try again or contact us.' }, { status: 500, headers: noStore });
  }
}
