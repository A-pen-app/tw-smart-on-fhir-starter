// Pure functions: no network, no DOM. Everything here is unit-tested (test/logic.test.mjs).
import { SYSTEM_LABELS } from "./config.js";

// "a.b" path lookup that takes the first element of any array on the way (type[0], item[0].productOrService…).
const first = x => (Array.isArray(x) ? x[0] : x);
const get = (o, path) => first(path.split(".").reduce((x, k) => first(x)?.[k], o));
const time = d => { const t = Date.parse(d); return Number.isNaN(t) ? null : t; };

// Where each resource type keeps "when did this happen". First non-empty path wins; order matters.
const DATE_PATHS = [
  "effectiveDateTime", "effectivePeriod.start", "effectiveInstant", "onsetDateTime", "onsetPeriod.start",
  "performedDateTime", "performedPeriod.start", "occurrenceDateTime", "authoredOn", "recordedDate", "recorded",
  "period.start", "billablePeriod.start", "started", "issued", "date", "created", "birthDate",
];
// Where each type keeps its "what is this" concept. Types not listed fall back to GENERIC_LABEL.
const LABEL_PATHS = {
  Immunization: ["vaccineCode"],
  MedicationRequest: ["medicationCodeableConcept", "medicationReference.display"],
  MedicationStatement: ["medicationCodeableConcept", "medicationReference.display"],
  MedicationAdministration: ["medicationCodeableConcept", "medicationReference.display"],
  MedicationDispense: ["medicationCodeableConcept", "medicationReference.display"],
  Encounter: ["type", "class.display", "class.code"],
  Claim: ["type", "item.productOrService"],
  ExplanationOfBenefit: ["type", "item.productOrService"],
  ImagingStudy: ["description", "procedureCode", "modality.display", "modality.code"],
  CarePlan: ["title", "category"],
  AuditEvent: ["type.display", "type.code"],
};
const GENERIC_LABEL = ["code", "type", "category", "title", "name", "description"];

/** CodeableConcept | Coding | string -> display text, or null. */
export function conceptText(c) {
  if (c == null) return null;
  if (typeof c === "string") return c;
  if (c.text) return c.text;
  const coding = c.coding?.[0] ?? c;
  return coding.display ?? coding.code ?? null;
}

/** FHIR HumanName[] -> display string. TW Core often fills name.text; Synthea fills family/given. */
export function formatName(names) {
  const n = names?.[0];
  if (!n) return null;
  if (n.text) return n.text;
  return [...(n.prefix ?? []), ...(n.given ?? []), n.family].filter(Boolean).join(" ") || null;
}

export const dateOf = r => DATE_PATHS.map(p => get(r, p)).find(v => typeof v === "string" && time(v) !== null) ?? null;

export function labelOf(r) {
  if (["Patient", "Practitioner", "RelatedPerson"].includes(r.resourceType)) return formatName(r.name) ?? r.id;
  if (typeof r.name === "string") return r.name;   // Organization, Location, CareTeam…
  for (const p of LABEL_PATHS[r.resourceType] ?? GENERIC_LABEL) {
    const t = conceptText(get(r, p));
    if (t) return t;
  }
  return r.id ?? "(no label)";
}

/** Short value text: Observation values, component count, or nothing. */
export function valueOf(r) {
  const q = r.valueQuantity;   // Synthea emits values like 173.45484138767452; round for display only (raw JSON keeps them)
  if (q) return `${typeof q.value === "number" ? +q.value.toFixed(2) : q.value ?? "?"} ${q.unit ?? q.code ?? ""}`.trim();
  const v = r.valueCodeableConcept ?? r.valueString ?? r.valueBoolean ?? r.valueInteger;
  if (v != null) return String(conceptText(v) ?? v);
  if (r.component?.length) return r.component.map(c => `${conceptText(c.code) ?? "?"}: ${valueOf(c) || "—"}`).join("；");
  return "";
}

export const statusOf = r => r.status ?? conceptText(r.clinicalStatus) ?? "";

/** One row for the table. */
export const summarize = r => ({ type: r.resourceType, id: r.id, date: dateOf(r), label: labelOf(r), value: valueOf(r), status: statusOf(r) });

/** Ids of every Patient this resource points to (relative or absolute references, with or without _history). */
export function patientRefs(r) {
  const ids = new Set();
  const walk = x => {
    if (Array.isArray(x)) return x.forEach(walk);
    if (!x || typeof x !== "object") return;
    const m = typeof x.reference === "string" && x.reference.match(/(?:^|\/)Patient\/([^/]+)(?:\/_history\/[^/]+)?$/);
    if (m) ids.add(m[1]);
    for (const [k, v] of Object.entries(x)) if (k !== "meta" && k !== "text") walk(v);
  };
  walk(r);
  return ids;
}

/**
 * Whose data is this?  "self"  = the patient, or points to them
 *                      "other" = points to some OTHER patient only ($everything can pull these in via links — filter them out!)
 *                      "ref"   = points to no patient: a Practitioner, Organization… referenced by the patient's data
 */
export function ownerOf(r, patientId) {
  if (r.resourceType === "Patient") return r.id === patientId ? "self" : "other";
  const ids = patientRefs(r);
  return ids.has(patientId) ? "self" : ids.size ? "other" : "ref";
}

/** Remove duplicates (same type/id), e.g. when the fallback path returns a resource twice. */
export function dedupe(resources) {
  const seen = new Set();
  return (resources ?? []).filter(r => r?.resourceType && !seen.has(`${r.resourceType}/${r.id}`) && seen.add(`${r.resourceType}/${r.id}`));
}

/**
 * resources -> [{key, owner, type, rows:[summary], resources}], one group per (owner, type),
 * sorted by count desc, rows newest first. owner: see ownerOf.
 */
export function groupByType(resources, patientId) {
  const by = new Map();
  for (const r of dedupe(resources)) {
    const key = `${ownerOf(r, patientId)}:${r.resourceType}`;
    (by.get(key) ?? by.set(key, []).get(key)).push(r);
  }
  return [...by].map(([key, rs]) => ({
    key: key.replace(":", "-"),
    owner: key.split(":")[0],
    type: rs[0].resourceType,
    resources: rs,
    rows: rs.map(summarize).sort((a, b) => (time(b.date) ?? -Infinity) - (time(a.date) ?? -Infinity)),
  })).sort((a, b) => b.resources.length - a.resources.length || a.type.localeCompare(b.type));
}

/** "LOINC", or for a family of systems "TW Core · icd-10-cm-2023-tw"; null if unknown. */
export function systemLabel(s) {
  const hit = SYSTEM_LABELS.find(([prefix]) => s.startsWith(prefix));
  if (!hit) return null;
  const tail = s.slice(hit[0].length).split("/").filter(Boolean).pop();
  return tail ? `${hit[1]} · ${tail}` : hit[1];
}

/** Every `system` used by a Coding anywhere inside the resources (except meta tags) -> [{system, label, count}] by count desc. */
export function codeSystems(resources) {
  const counts = new Map();
  const walk = x => {
    if (Array.isArray(x)) return x.forEach(walk);
    if (!x || typeof x !== "object") return;
    if (typeof x.system === "string" && "code" in x) counts.set(x.system, (counts.get(x.system) ?? 0) + 1);
    for (const [k, v] of Object.entries(x)) if (k !== "meta") walk(v);
  };
  walk(resources);
  return [...counts].map(([system, count]) => ({ system, label: systemLabel(system), count })).sort((a, b) => b.count - a.count);
}

/** Top-level fields and how many resources fill them -> [{field, count, pct}]. Shows what you can rely on. */
export function fieldCoverage(resources) {
  const counts = new Map();
  for (const r of resources) for (const k of Object.keys(r)) if (k !== "resourceType") counts.set(k, (counts.get(k) ?? 0) + 1);
  return [...counts].map(([field, count]) => ({ field, count, pct: Math.round((count / resources.length) * 100) }))
    .sort((a, b) => b.count - a.count || a.field.localeCompare(b.field));
}

/** How to fetch this type yourself: fhirclient call + raw REST URL. `owner` from ownerOf. */
export function snippet(type, patientId, base, owner = "self") {
  if (owner === "other") return `// Belongs to ANOTHER patient. Your app should not read or show this.\n// A search scoped to the current patient never returns it:\nconst list = await client.patient.request("${type}", { pageLimit: 0, flat: true });`;
  if (type === "Patient") return `const patient = await client.patient.read();\n// GET ${base}/Patient/${patientId}`;
  if (owner === "ref") return `// Not the patient's data: other resources point to it (e.g. Encounter.participant). Read it by reference:\nconst x = await client.request("${type}/<id>");\n// GET ${base}/${type}/<id>`;
  return `const list = await client.patient.request("${type}", { pageLimit: 0, flat: true });\n// GET ${base}/${type}?patient=${patientId}` +
    `\n// If fhirclient throws 'Cannot filter "${type}" resources by patient' (e.g. Device on THAS), search explicitly:\n// await client.request(\`${type}?patient=\${client.patient.id}\`, { pageLimit: 0, flat: true });`;
}

/** Did this fail because the token is missing, expired or rejected? (fhirclient's HttpError carries .status) */
export const isAuthError = e => e?.status === 401 || /\b401\b|unauthori[sz]ed|expired/i.test(String(e?.message ?? e ?? ""));
