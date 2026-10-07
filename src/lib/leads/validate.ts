import {
  AREA_OPTIONS, BUDGET_OPTIONS, COUNTRY_CODES, DEPOSIT_OPTIONS, PURPOSE_OPTIONS,
  TIMELINE_OPTIONS, UNIT_OPTIONS, UTM_KEYS, type Option,
} from './options.ts';

export interface LeadInput {
  budget: string;
  deposit: string;
  timeline: string;
  area: string;
  unitType: string;
  purpose: string;
  name: string;
  phoneCountry: string; // ISO code
  phoneDial: string;
  phoneNational: string; // digits only
  phoneE164: string;
  consent: true;
  sourcePage: string;
  utm: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  submissionId: string | null;
}

export type FieldErrors = Partial<Record<string, string>>;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const inOpts = (opts: Option[], v: string) => opts.some((o) => o.value === v);

/** Validate untrusted form input. Returns either a clean LeadInput or field errors. */
export function validateLead(raw: Record<string, unknown>):
  | { ok: true; data: LeadInput }
  | { ok: false; errors: FieldErrors } {
  const e: FieldErrors = {};
  const budget = str(raw.budget);
  const deposit = str(raw.deposit);
  const timeline = str(raw.timeline);
  const area = str(raw.area);
  const unitType = str(raw.unitType);
  const purpose = str(raw.purpose);
  const name = str(raw.name).replace(/\s+/g, ' ');
  const phoneCountry = str(raw.phoneCountry).toUpperCase();
  const phoneNational = str(raw.phone).replace(/[\s\-().]/g, '').replace(/^0+/, '');

  if (!inOpts(BUDGET_OPTIONS, budget)) e.budget = 'Please select your total budget.';
  if (!inOpts(DEPOSIT_OPTIONS, deposit)) e.deposit = 'Please select your available initial payment.';
  if (!inOpts(TIMELINE_OPTIONS, timeline)) e.timeline = 'Please select when you plan to buy.';
  if (!inOpts(AREA_OPTIONS, area)) e.area = 'Please select a preferred area.';
  if (!inOpts(UNIT_OPTIONS, unitType)) e.unitType = 'Please select an apartment type.';
  if (!inOpts(PURPOSE_OPTIONS, purpose)) e.purpose = 'Please tell us the purpose.';
  if (name.length < 2 || name.length > 80 || !/^[\p{L}\p{M}' .-]+$/u.test(name)) e.name = 'Please enter your name.';

  const country = COUNTRY_CODES.find((c) => c.code === phoneCountry);
  if (!country) e.phone = 'Please choose a country code.';
  else if (!/^\d{6,14}$/.test(phoneNational) || country.dial.length + phoneNational.length > 15)
    e.phone = 'Please enter a valid WhatsApp number.';

  const consent = raw.consent === true || raw.consent === 'yes' || raw.consent === 'on';
  if (!consent) e.consent = 'Please confirm that a partner advisor may contact you.';

  if (Object.keys(e).length) return { ok: false, errors: e };

  // Source page: path only, never the query string (it can carry personal data).
  let sourcePage = str(raw.sourcePage);
  if (!/^\/[\w\-/.]*$/.test(sourcePage) || sourcePage.length > 200) sourcePage = '/';

  const utm: LeadInput['utm'] = {};
  for (const k of UTM_KEYS) {
    const v = str(raw[k]);
    if (v && /^[\w\-.+ ]{1,100}$/.test(v)) utm[k] = v;
  }
  const sid = str(raw.submissionId);

  return {
    ok: true,
    data: {
      budget, deposit, timeline, area, unitType, purpose, name,
      phoneCountry, phoneDial: country!.dial, phoneNational,
      phoneE164: `+${country!.dial}${phoneNational}`,
      consent: true, sourcePage, utm,
      submissionId: /^[\w-]{8,64}$/.test(sid) ? sid : null,
    },
  };
}
