import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import type { DatabaseSync as DB } from 'node:sqlite';
import { CONSENT_TEXT, CONSENT_VERSION } from './options';
import type { LeadInput } from './validate';

export const LEAD_STATUSES = ['new', 'contact_attempted', 'contact_verified', 'qualified', 'not_qualified', 'routed', 'closed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Review checklist that must be complete before a lead can become `qualified`. */
export const REVIEW_ITEMS = {
  contactVerified: 'Contact verified (spoke to / heard back from the person)',
  budgetFit: 'Budget and initial payment reviewed as realistic',
  timelineReviewed: 'Buying timeline confirmed',
  preferencesReviewed: 'Area, apartment type and purpose confirmed',
  sharingConsentConfirmed: 'Consent to share with a partner advisor confirmed',
} as const;
export type ReviewKey = keyof typeof REVIEW_ITEMS;
export type Review = Partial<Record<ReviewKey, boolean>>;

export interface LeadRow {
  id: string;
  created_at: string;
  updated_at: string;
  status: LeadStatus;
  name: string;
  phone_country: string;
  phone_e164: string;
  budget: string;
  deposit: string;
  timeline: string;
  area: string;
  unit_type: string;
  purpose: string;
  source_page: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  consent_given: number;
  consent_version: string;
  consent_text: string;
  consent_at: string;
  review: string; // JSON
  notes: string;
  routed_to: string | null;
}

export function secret(): string {
  const s = process.env.LEADS_SECRET || '';
  if (s.length < 32) throw new Error('LEADS_SECRET must be set (min 32 chars)');
  return s;
}

let db: DB | null = null;
function getDb(): DB {
  if (db) return db;
  // Loaded lazily so a missing driver surfaces as a failed save, never as a fake success.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
  const file = resolve(process.env.LEADS_DB_PATH || './data/leads.sqlite');
  mkdirSync(dirname(file), { recursive: true });
  const d = new DatabaseSync(file);
  d.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      name TEXT NOT NULL,
      phone_country TEXT NOT NULL,
      phone_e164 TEXT NOT NULL,
      budget TEXT NOT NULL,
      deposit TEXT NOT NULL,
      timeline TEXT NOT NULL,
      area TEXT NOT NULL,
      unit_type TEXT NOT NULL,
      purpose TEXT NOT NULL,
      source_page TEXT NOT NULL,
      utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_term TEXT, utm_content TEXT,
      consent_given INTEGER NOT NULL,
      consent_version TEXT NOT NULL,
      consent_text TEXT NOT NULL,
      consent_at TEXT NOT NULL,
      submission_id TEXT UNIQUE,
      ip_hash TEXT,
      review TEXT NOT NULL DEFAULT '{}',
      notes TEXT NOT NULL DEFAULT '',
      routed_to TEXT
    );
    CREATE INDEX IF NOT EXISTS leads_phone_created ON leads (phone_e164, created_at);
    CREATE INDEX IF NOT EXISTS leads_status ON leads (status, created_at);
    CREATE TABLE IF NOT EXISTS lead_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id TEXT NOT NULL REFERENCES leads(id),
      at TEXT NOT NULL,
      type TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT,
      detail TEXT
    );
    CREATE TABLE IF NOT EXISTS submit_attempts (
      ip_hash TEXT NOT NULL,
      at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS submit_attempts_ip ON submit_attempts (ip_hash, at);
  `);
  db = d;
  return d;
}

export function hashIp(ip: string): string {
  return createHmac('sha256', secret()).update(ip).digest('hex').slice(0, 32);
}

function newLeadId(now: Date): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `DOP-${d}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

/* ---------- form token (minimum fill time) ---------- */
export function issueFormToken(now = Date.now()): string {
  const ts = String(now);
  const sig = createHmac('sha256', secret()).update(`form:${ts}`).digest('base64url');
  return `${ts}.${sig}`;
}
/** Returns null when valid, otherwise a reason. */
export function checkFormToken(token: string | undefined, now = Date.now()): string | null {
  if (!token) return 'missing';
  const [ts, sig] = token.split('.');
  if (!ts || !sig) return 'malformed';
  const expect = createHmac('sha256', secret()).update(`form:${ts}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return 'bad-signature';
  const age = now - Number(ts);
  if (age < 3000) return 'too-fast';
  if (age > 24 * 3600 * 1000) return 'expired';
  return null;
}

/* ---------- rate limiting ---------- */
export function rateLimited(ipHash: string, max = 5, windowMs = 3600_000): boolean {
  const d = getDb();
  const since = new Date(Date.now() - windowMs).toISOString();
  d.prepare('DELETE FROM submit_attempts WHERE at < ?').run(new Date(Date.now() - 24 * 3600_000).toISOString());
  const row = d.prepare('SELECT COUNT(*) AS n FROM submit_attempts WHERE ip_hash = ? AND at >= ?').get(ipHash, since) as { n: number };
  d.prepare('INSERT INTO submit_attempts (ip_hash, at) VALUES (?, ?)').run(ipHash, new Date().toISOString());
  return row.n >= max;
}

export type SaveResult =
  | { kind: 'created'; id: string }
  | { kind: 'duplicate'; id: string };

/**
 * Persist a lead. Idempotent on submissionId; a second request with the same WhatsApp number
 * within 24h is treated as a duplicate of the existing lead (no new record).
 */
export function saveLead(input: LeadInput, meta: { ipHash: string }): SaveResult {
  const d = getDb();
  if (input.submissionId) {
    const same = d.prepare('SELECT id FROM leads WHERE submission_id = ?').get(input.submissionId) as { id: string } | undefined;
    if (same) return { kind: 'duplicate', id: same.id };
  }
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const recent = d.prepare('SELECT id FROM leads WHERE phone_e164 = ? AND created_at >= ? ORDER BY created_at DESC LIMIT 1').get(input.phoneE164, since) as { id: string } | undefined;
  if (recent) {
    d.prepare('INSERT INTO lead_events (lead_id, at, type, detail) VALUES (?, ?, ?, ?)').run(
      recent.id, new Date().toISOString(), 'duplicate_submission', JSON.stringify({ sourcePage: input.sourcePage }),
    );
    return { kind: 'duplicate', id: recent.id };
  }

  const now = new Date();
  const iso = now.toISOString();
  const id = newLeadId(now);
  d.exec('BEGIN IMMEDIATE');
  try {
    d.prepare(`INSERT INTO leads (
      id, created_at, updated_at, status, name, phone_country, phone_e164, budget, deposit, timeline, area, unit_type, purpose,
      source_page, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      consent_given, consent_version, consent_text, consent_at, submission_id, ip_hash
    ) VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`).run(
      id, iso, iso, input.name, input.phoneCountry, input.phoneE164, input.budget, input.deposit, input.timeline,
      input.area, input.unitType, input.purpose, input.sourcePage,
      input.utm.utm_source ?? null, input.utm.utm_medium ?? null, input.utm.utm_campaign ?? null,
      input.utm.utm_term ?? null, input.utm.utm_content ?? null,
      CONSENT_VERSION, CONSENT_TEXT, iso, input.submissionId, meta.ipHash,
    );
    d.prepare('INSERT INTO lead_events (lead_id, at, type, to_status) VALUES (?, ?, ?, ?)').run(id, iso, 'created', 'new');
    d.exec('COMMIT');
  } catch (err) {
    d.exec('ROLLBACK');
    throw err;
  }
  return { kind: 'created', id };
}

/* ---------- internal admin ---------- */
export interface LeadFilter { status?: string; area?: string; budget?: string; q?: string }

export function listLeads(f: LeadFilter = {}, limit = 200): LeadRow[] {
  const where: string[] = [];
  const args: string[] = [];
  if (f.status && (LEAD_STATUSES as readonly string[]).includes(f.status)) { where.push('status = ?'); args.push(f.status); }
  if (f.area) { where.push('area = ?'); args.push(f.area); }
  if (f.budget) { where.push('budget = ?'); args.push(f.budget); }
  if (f.q) { where.push('(id LIKE ? OR name LIKE ? OR phone_e164 LIKE ?)'); const q = `%${f.q}%`; args.push(q, q, q); }
  const sql = `SELECT * FROM leads ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT ${Math.min(limit, 500)}`;
  return getDb().prepare(sql).all(...args) as unknown as LeadRow[];
}

export function getLead(id: string): { lead: LeadRow; events: { at: string; type: string; from_status: string | null; to_status: string | null; detail: string | null }[] } | null {
  const d = getDb();
  const lead = d.prepare('SELECT * FROM leads WHERE id = ?').get(id) as unknown as LeadRow | undefined;
  if (!lead) return null;
  const events = d.prepare('SELECT at, type, from_status, to_status, detail FROM lead_events WHERE lead_id = ? ORDER BY id DESC').all(id) as never;
  return { lead, events };
}

export function countByStatus(): Record<string, number> {
  const rows = getDb().prepare('SELECT status, COUNT(*) AS n FROM leads GROUP BY status').all() as { status: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}

export function updateLead(
  id: string,
  change: { status: LeadStatus; review: Review; notes: string; routedTo: string | null },
): { ok: true } | { ok: false; error: string } {
  const d = getDb();
  const cur = d.prepare('SELECT status FROM leads WHERE id = ?').get(id) as { status: string } | undefined;
  if (!cur) return { ok: false, error: 'Lead not found.' };
  if (!(LEAD_STATUSES as readonly string[]).includes(change.status)) return { ok: false, error: 'Unknown status.' };
  if (change.status === 'qualified' || change.status === 'routed') {
    const missing = (Object.keys(REVIEW_ITEMS) as ReviewKey[]).filter((k) => !change.review[k]);
    if (missing.length) return { ok: false, error: `Complete the review checklist before marking as ${change.status}: ${missing.map((k) => REVIEW_ITEMS[k]).join('; ')}.` };
  }
  if (change.status === 'routed' && !change.routedTo) return { ok: false, error: 'Enter which partner the lead was routed to.' };
  const iso = new Date().toISOString();
  d.prepare('UPDATE leads SET status = ?, review = ?, notes = ?, routed_to = ?, updated_at = ? WHERE id = ?').run(
    change.status, JSON.stringify(change.review), change.notes.slice(0, 4000), change.routedTo, iso, id,
  );
  d.prepare('INSERT INTO lead_events (lead_id, at, type, from_status, to_status, detail) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, iso, 'review_update', cur.status, change.status, null,
  );
  return { ok: true };
}

