/** Shared option lists for the lead form (client + server). Values are stored; labels are shown. */
export type Option = { value: string; label: string };

export const BUDGET_OPTIONS: Option[] = [
  { value: 'under-750k', label: 'Under AED 750,000' },
  { value: '750k-1m', label: 'AED 750,000 – 1M' },
  { value: '1m-1.5m', label: 'AED 1M – 1.5M' },
  { value: '1.5m-2m', label: 'AED 1.5M – 2M' },
  { value: '2m-3m', label: 'AED 2M – 3M' },
  { value: '3m-5m', label: 'AED 3M – 5M' },
  { value: '5m-plus', label: 'AED 5M+' },
];

export const DEPOSIT_OPTIONS: Option[] = [
  { value: 'under-100k', label: 'Under AED 100,000' },
  { value: '100k-200k', label: 'AED 100,000 – 200,000' },
  { value: '200k-400k', label: 'AED 200,000 – 400,000' },
  { value: '400k-750k', label: 'AED 400,000 – 750,000' },
  { value: '750k-plus', label: 'AED 750,000+' },
];

export const TIMELINE_OPTIONS: Option[] = [
  { value: 'within-1-month', label: 'Within 1 month' },
  { value: '1-3-months', label: 'In 1–3 months' },
  { value: '3-6-months', label: 'In 3–6 months' },
  { value: '6-12-months', label: 'In 6–12 months' },
  { value: 'researching', label: 'Just researching' },
];

export const AREA_OPTIONS: Option[] = [
  { value: 'open', label: 'Open to suggestions' },
  { value: 'jvc', label: 'Jumeirah Village Circle (JVC)' },
  { value: 'business-bay', label: 'Business Bay' },
  { value: 'dubai-south', label: 'Dubai South' },
  { value: 'dubai-creek-harbour', label: 'Dubai Creek Harbour' },
  { value: 'dubai-maritime-city', label: 'Dubai Maritime City' },
];

export const UNIT_OPTIONS: Option[] = [
  { value: 'open', label: 'Open to suggestions' },
  { value: 'studio', label: 'Studio' },
  { value: '1br', label: '1 bedroom' },
  { value: '2br', label: '2 bedrooms' },
  { value: '3br', label: '3 bedrooms' },
  { value: '4br+', label: '4+ bedrooms' },
];

export const PURPOSE_OPTIONS: Option[] = [
  { value: 'own-use', label: 'To live in' },
  { value: 'investment', label: 'Investment' },
  { value: 'both', label: 'Both / not sure yet' },
];

export const COUNTRY_CODES: { code: string; dial: string; label: string }[] = [
  { code: 'AE', dial: '971', label: 'United Arab Emirates' },
  { code: 'SA', dial: '966', label: 'Saudi Arabia' },
  { code: 'GB', dial: '44', label: 'United Kingdom' },
  { code: 'IN', dial: '91', label: 'India' },
  { code: 'PK', dial: '92', label: 'Pakistan' },
  { code: 'DE', dial: '49', label: 'Germany' },
  { code: 'FR', dial: '33', label: 'France' },
  { code: 'IT', dial: '39', label: 'Italy' },
  { code: 'RU', dial: '7', label: 'Russia / Kazakhstan' },
  { code: 'TR', dial: '90', label: 'Türkiye' },
  { code: 'US', dial: '1', label: 'United States / Canada' },
  { code: 'EG', dial: '20', label: 'Egypt' },
  { code: 'LB', dial: '961', label: 'Lebanon' },
  { code: 'QA', dial: '974', label: 'Qatar' },
  { code: 'KW', dial: '965', label: 'Kuwait' },
  { code: 'BH', dial: '973', label: 'Bahrain' },
  { code: 'OM', dial: '968', label: 'Oman' },
  { code: 'CN', dial: '86', label: 'China' },
  { code: 'NG', dial: '234', label: 'Nigeria' },
  { code: 'ZA', dial: '27', label: 'South Africa' },
];

/** Consent text shown next to the checkbox. Bump the version whenever the wording changes. */
export const CONSENT_VERSION = '2026-10-07.v1';
export const CONSENT_TEXT =
  'I agree to be contacted by a partner advisor on WhatsApp or phone about my request, and for DubaiOffPlanApartments.com to share the details I submit with that partner advisor, as described in the Privacy Policy.';
export const CONSENT_SHORT = 'I agree to be contacted by a partner advisor.';

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export function labelFor(options: Option[], value: string | null | undefined): string {
  return options.find((o) => o.value === value)?.label ?? (value || '—');
}
