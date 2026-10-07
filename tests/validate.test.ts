import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLead } from '../src/lib/leads/validate.ts';

const good = {
  budget: '1m-1.5m', deposit: '200k-400k', timeline: '3-6-months', area: 'jvc', unitType: '1br', purpose: 'investment',
  name: 'Sara Example', phoneCountry: 'AE', phone: '050 123 4567', consent: true, sourcePage: '/areas/jvc/?name=x',
  utm_source: 'google', utm_campaign: '<script>', foo: 'bar', submissionId: '1234abcd-5678',
};

test('accepts a complete submission and normalises the phone', () => {
  const r = validateLead(good);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.data.phoneE164, '+971501234567');
  assert.equal(r.data.sourcePage, '/'); // query strings are never stored
  assert.deepEqual(r.data.utm, { utm_source: 'google' }); // unsafe UTM dropped, unknown keys ignored
});

test('requires explicit consent', () => {
  for (const consent of [false, undefined, '', 'no']) {
    const r = validateLead({ ...good, consent });
    assert.equal(r.ok, false);
    if (!r.ok) assert.ok(r.errors.consent);
  }
});

test('rejects unknown option values and bad phones', () => {
  const r = validateLead({ ...good, budget: '999', phone: '12', phoneCountry: 'XX' });
  assert.equal(r.ok, false);
  if (!r.ok) { assert.ok(r.errors.budget); assert.ok(r.errors.phone); }
});

test('rejects names with markup', () => {
  const r = validateLead({ ...good, name: '<b>hi</b>' });
  assert.equal(r.ok, false);
});
