// Pure functions: no network, no DOM. Everything here is unit-tested (test/logic.test.mjs).
import { LOINC, BP_COMPONENT } from "./config.js";

const isNum = v => typeof v === "number" && Number.isFinite(v);
const hasCode = (cc, code) => (cc?.coding ?? []).some(c => c.code === code && (!c.system || c.system === LOINC));
const dateOf = o => o.effectiveDateTime ?? o.effectivePeriod?.start ?? o.issued ?? null;
const time = d => { const t = Date.parse(d); return Number.isNaN(t) ? null : t; };

/** FHIR HumanName[] -> display string. TW Core often fills name.text; Synthea fills family/given. */
export function formatName(names) {
  const n = names?.[0];
  if (!n) return "(no name)";
  if (n.text) return n.text;
  return [...(n.prefix ?? []), ...(n.given ?? []), n.family].filter(Boolean).join(" ") || "(no name)";
}

export function ageOf(birthDate, now = new Date()) {
  const b = time(birthDate);
  if (b === null) return null;
  const d = new Date(b);
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

/** Observation[] (numeric valueQuantity) -> [{t, date, value, unit}] sorted oldest -> newest. Bad rows are dropped, not thrown. */
export function toQuantityPoints(observations, codes) {
  return (observations ?? [])
    .filter(o => o && o.status !== "entered-in-error" && codes.some(c => hasCode(o.code, c)))
    .map(o => ({ t: time(dateOf(o)), date: dateOf(o), value: o.valueQuantity?.value, unit: o.valueQuantity?.unit ?? "" }))
    .filter(p => p.t !== null && isNum(p.value))
    .sort((a, b) => a.t - b.t);
}

/** Blood-pressure Observation[] -> [{t, date, systolic, diastolic}]. Components are matched by LOINC code, never by array position. */
export function toBpPoints(observations, codes) {
  return (observations ?? [])
    .filter(o => o && o.status !== "entered-in-error" && codes.some(c => hasCode(o.code, c)))
    .map(o => {
      const comp = code => (o.component ?? []).find(c => hasCode(c.code, code))?.valueQuantity?.value;
      return { t: time(dateOf(o)), date: dateOf(o), systolic: comp(BP_COMPONENT.systolic), diastolic: comp(BP_COMPONENT.diastolic) };
    })
    .filter(p => p.t !== null && isNum(p.systolic) && isNum(p.diastolic))
    .sort((a, b) => a.t - b.t);
}

/** Demo-grade banding for display only. NOT clinical guidance. */
export function bpBand({ systolic, diastolic }) {
  if (systolic >= 140 || diastolic >= 90) return "high";
  if (systolic < 90 || diastolic < 60) return "low";
  return "normal";
}

export const latest = points => (points.length ? points[points.length - 1] : null);

/** Fewest decimals (0-3) that keep every axis tick label distinct, so a narrow range never renders "30, 30, 28, 28". */
export function tickDecimals(min, max, ticks = 4) {
  if (!isNum(min) || !isNum(max) || max <= min) return 0;
  for (let d = 0; d < 3; d++) {
    const labels = Array.from({ length: ticks + 1 }, (_, i) => (min + ((max - min) * i) / ticks).toFixed(d));
    if (new Set(labels).size === labels.length) return d;
  }
  return 3;
}

/** fhirclient's client.state -> login status. expiresAt is stored in SECONDS since epoch. */
export function sessionInfo(state, now = Date.now()) {
  const expiresAt = isNum(state?.expiresAt) ? state.expiresAt * 1000 : null;
  return {
    expiresAt,
    expired: expiresAt !== null && expiresAt <= now,
    canRefresh: Boolean(state?.tokenResponse?.refresh_token),   // only with the offline_access / online_access scope
  };
}

/** Did this fail because the token is missing, expired or rejected? (fhirclient's HttpError carries .status) */
export const isAuthError = e => e?.status === 401 || /\b401\b|unauthori[sz]ed|expired/i.test(String(e?.message ?? e ?? ""));
