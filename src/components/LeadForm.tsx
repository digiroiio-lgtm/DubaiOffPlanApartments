'use client';
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { readUtm, track } from '@/lib/analytics';
import {
  AREA_OPTIONS, BUDGET_OPTIONS, CONSENT_SHORT, CONSENT_TEXT, CONSENT_VERSION, COUNTRY_CODES, DEPOSIT_OPTIONS,
  PURPOSE_OPTIONS, TIMELINE_OPTIONS, UNIT_OPTIONS, type Option,
} from '@/lib/leads/options';
import { Arrow, Chevron, UaeFlag } from './Icons';

type Errors = Partial<Record<string, string>>;
const STEP1 = ['budget', 'deposit', 'timeline', 'phone', 'consent'] as const;

function Select({ name, label, placeholder, options, error, defaultValue }: {
  name: string; label: string; placeholder: string; options: Option[]; error?: string; defaultValue?: string;
}) {
  return (
    <div className={`lf-field${error ? ' has-error' : ''}`}>
      <label htmlFor={`lf-${name}`}>{label}</label>
      <div className="lf-select">
        <select id={`lf-${name}`} name={name} defaultValue={defaultValue ?? ''} required aria-invalid={!!error} aria-describedby={error ? `lf-${name}-err` : undefined}>
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Chevron />
      </div>
      {error && <p className="lf-error" id={`lf-${name}-err`}>{error}</p>}
    </div>
  );
}

export default function LeadForm({ location = 'hero', defaultArea }: { location?: string; defaultArea?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState<{ id: string; duplicate: boolean } | null>(null);
  const [country, setCountry] = useState('AE');
  const started = useRef(false);
  const token = useRef<string | null>(null);
  const submissionId = useRef<string>('');

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track('form_start', { form_location: location });
    fetch('/api/form-token', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => { token.current = j.token; })
      .catch(() => {});
  };

  const values = () => Object.fromEntries(new FormData(formRef.current!).entries()) as Record<string, string>;

  const checkStep1 = (v: Record<string, string>): Errors => {
    const e: Errors = {};
    if (!v.budget) e.budget = 'Please select your total budget.';
    if (!v.deposit) e.deposit = 'Please select your available initial payment.';
    if (!v.timeline) e.timeline = 'Please select when you plan to buy.';
    const digits = (v.phone || '').replace(/[\s\-().]/g, '').replace(/^0+/, '');
    if (!/^\d{6,14}$/.test(digits)) e.phone = 'Please enter a valid WhatsApp number.';
    if (!v.consent) e.consent = 'Please confirm that a partner advisor may contact you.';
    return e;
  };

  const next = () => {
    onStart();
    const e = checkStep1(values());
    setErrors(e);
    if (Object.keys(e).length) {
      formRef.current?.querySelector<HTMLElement>(`[name="${STEP1.find((k) => e[k])}"]`)?.focus();
      return;
    }
    setStep(2);
    track('form_step_complete', { step: 1, form_location: location });
    window.setTimeout(() => formRef.current?.querySelector<HTMLElement>('#lf-name')?.focus(), 30);
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (status === 'sending') return;
    const v = values();
    const e1 = checkStep1(v);
    if (Object.keys(e1).length) { setErrors(e1); setStep(1); return; }
    const e2: Errors = {};
    if (!v.name || v.name.trim().length < 2) e2.name = 'Please enter your name.';
    if (!v.area) e2.area = 'Please select a preferred area.';
    if (!v.unitType) e2.unitType = 'Please select an apartment type.';
    if (!v.purpose) e2.purpose = 'Please tell us the purpose.';
    setErrors(e2);
    if (Object.keys(e2).length) return;

    if (!submissionId.current) submissionId.current = crypto.randomUUID();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...v,
          consent: v.consent === 'yes',
          formToken: token.current,
          submissionId: submissionId.current,
          sourcePage: window.location.pathname,
          ...readUtm(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok && j.leadId) {
        // Fire the conversion only after the server confirmed the record was stored.
        if (!j.duplicate) track('lead_submitted', { form_location: location });
        setDone({ id: j.leadId, duplicate: !!j.duplicate });
        return;
      }
      if (j.errors) {
        setErrors(j.errors);
        if (STEP1.some((k) => j.errors[k])) setStep(1);
      }
      setMessage(j.error || 'Sorry, we could not save your request. Please try again.');
      setStatus('error');
    } catch {
      setMessage('Connection problem. Your request was not sent — please try again.');
      setStatus('error');
    }
  };

  if (done) {
    return (
      <div className="lead-card lf-done" role="status" aria-live="polite" id="match-form">
        <h2 className="lf-title">{done.duplicate ? 'We already have your request' : 'Your request has been received'}</h2>
        <p className="lf-sub">
          {done.duplicate
            ? 'We received a request from this WhatsApp number recently, so we have not created a second one.'
            : 'Thank you. A partner advisor will review your budget and preferences and contact you on WhatsApp to discuss suitable projects.'}
        </p>
        <p className="lf-ref">Reference: <strong>{done.id}</strong></p>
        <p className="lf-foot">No obligation. You can ask us to delete your details at any time — see our <Link href="/privacy/">Privacy Policy</Link>.</p>
      </div>
    );
  }

  const dial = COUNTRY_CODES.find((c) => c.code === country)?.dial ?? '971';

  return (
    <form
      ref={formRef}
      id="match-form"
      className="lead-card lead-form"
      data-step={step}
      action="/api/leads"
      method="post"
      noValidate
      onSubmit={submit}
      onFocus={onStart}
      onChange={onStart}
    >
      <h2 className="lf-title">Find your ideal project</h2>
      <p className="lf-sub">{step === 1 ? 'A shortlist built around you.' : 'Almost done — tell us a bit more.'}</p>

      <div className="lf-step1">
        <Select name="budget" label="Budget" placeholder="Select budget in AED" options={BUDGET_OPTIONS} error={errors.budget} />
        <Select name="deposit" label="Initial deposit" placeholder="Select deposit budget" options={DEPOSIT_OPTIONS} error={errors.deposit} />
        <Select name="timeline" label="Buying timeline" placeholder="When are you planning to buy?" options={TIMELINE_OPTIONS} error={errors.timeline} />
        <div className={`lf-field lf-phone-field${errors.phone ? ' has-error' : ''}`}>
          <label htmlFor="lf-phone">WhatsApp number</label>
          <div className="lf-phone">
            <div className="lf-cc">
              {country === 'AE' ? <UaeFlag /> : <span className="lf-cc-code">{country}</span>}
              <span>+{dial}</span>
              <Chevron />
              <select name="phoneCountry" aria-label="Country code" value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label} (+{c.dial})</option>)}
              </select>
            </div>
            <input id="lf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="e.g. 50 123 4567" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'lf-phone-err' : undefined} />
          </div>
          {errors.phone && <p className="lf-error" id="lf-phone-err">{errors.phone}</p>}
        </div>
      </div>

      <div className="lf-step2">
        <div className={`lf-field${errors.name ? ' has-error' : ''}`}>
          <label htmlFor="lf-name">Your name</label>
          <input id="lf-name" name="name" type="text" autoComplete="name" placeholder="First and last name" maxLength={80} required aria-invalid={!!errors.name} />
          {errors.name && <p className="lf-error">{errors.name}</p>}
        </div>
        <Select name="area" label="Preferred area" placeholder="Select an area" options={AREA_OPTIONS} error={errors.area} defaultValue={defaultArea} />
        <Select name="unitType" label="Apartment type" placeholder="Select apartment type" options={UNIT_OPTIONS} error={errors.unitType} />
        <Select name="purpose" label="Purpose" placeholder="Investment or own use?" options={PURPOSE_OPTIONS} error={errors.purpose} />
      </div>

      {/* Honeypot: hidden from people, often filled by bots. */}
      <div className="lf-hp" aria-hidden="true">
        <label htmlFor="lf-company">Company website</label>
        <input id="lf-company" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="sourcePage" value="/" />
      <input type="hidden" name="consentVersion" value={CONSENT_VERSION} />

      <button type="button" className="btn btn-green lf-next" onClick={next} data-cta="form_next" data-cta-location={location}>
        Get my 3 matches <Arrow />
      </button>
      <button type="submit" className="btn btn-green lf-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : <>Send my request <Arrow /></>}
      </button>

      <div className={`lf-consent${errors.consent ? ' has-error' : ''}`}>
        <input id={`lf-consent-${location}`} name="consent" type="checkbox" value="yes" aria-describedby="lf-consent-detail" />
        <label htmlFor={`lf-consent-${location}`}>{CONSENT_SHORT}</label>
      </div>
      <p id="lf-consent-detail" className="lf-consent-detail">
        {CONSENT_TEXT.replace(/ as described in the Privacy Policy\.$/, '')} — see our <Link href="/privacy/">Privacy Policy</Link>.
      </p>
      {errors.consent && <p className="lf-error">{errors.consent}</p>}
      {step === 2 && <button type="button" className="lf-back" onClick={() => setStep(1)}>← Back</button>}
      {message && <p className="lf-error lf-message" role="alert">{message}</p>}
      <p className="lf-foot">Free project matching. No obligation.</p>
    </form>
  );
}
