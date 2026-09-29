import test from "node:test";
import assert from "node:assert/strict";
import { conceptText, dateOf, labelOf, valueOf, summarize, ownerOf, patientRefs, dedupe, groupByType, codeSystems, fieldCoverage, snippet, filterRows } from "../src/logic.js";

const L = "http://loinc.org", S = "http://snomed.info/sct";
const pt = { resourceType: "Patient", id: "p1", name: [{ given: ["Adán"], family: "Portillo" }] };
const subj = { subject: { reference: "Patient/p1" } };
const obs = (id, date, extra = {}) => ({ resourceType: "Observation", id, status: "final", ...subj, effectiveDateTime: date,
  code: { coding: [{ system: L, code: "29463-7", display: "Body Weight" }] }, valueQuantity: { value: 70, unit: "kg" }, ...extra });

test("conceptText: text > coding.display > coding.code, tolerates null", () => {
  assert.equal(conceptText({ text: "T", coding: [{ display: "D" }] }), "T");
  assert.equal(conceptText({ coding: [{ code: "C" }] }), "C");
  assert.equal(conceptText({ system: L, code: "X", display: "Coding itself" }), "Coding itself");
  assert.equal(conceptText(null), null);
});

test("dateOf: picks the right field per type and skips unparseable dates", () => {
  assert.equal(dateOf({ onsetDateTime: "2020-01-01" }), "2020-01-01");
  assert.equal(dateOf({ performedPeriod: { start: "2021-02-03" } }), "2021-02-03");
  assert.equal(dateOf({ billablePeriod: { start: "2019-05-05" } }), "2019-05-05");
  assert.equal(dateOf({ effectiveDateTime: "garbage", issued: "2022-01-01" }), "2022-01-01");
  assert.equal(dateOf({}), null);
});

test("labelOf: per-type concept, names, and generic fallback", () => {
  assert.equal(labelOf(pt), "Adán Portillo");
  assert.equal(labelOf({ resourceType: "Immunization", vaccineCode: { text: "Influenza" } }), "Influenza");
  assert.equal(labelOf({ resourceType: "Encounter", class: { code: "AMB" } }), "AMB");
  assert.equal(labelOf({ resourceType: "Encounter", class: { code: "AMB" }, type: [{ text: "Encounter for symptom" }] }), "Encounter for symptom");
  assert.equal(labelOf({ resourceType: "Claim", item: [{ productOrService: { text: "Visit" } }] }), "Visit");
  assert.equal(labelOf({ resourceType: "Organization", name: "臺大醫院" }), "臺大醫院");
  assert.equal(labelOf({ resourceType: "Goal", description: { text: "減重" } }), "減重");
  assert.equal(labelOf({ resourceType: "Basic", id: "b1" }), "b1");
});

test("valueOf: quantity, coded, and blood-pressure components", () => {
  assert.equal(valueOf(obs("o", "2020-01-01")), "70 kg");
  assert.equal(valueOf({ valueQuantity: { value: 173.45484138767452, unit: "cm" } }), "173.45 cm");
  assert.equal(valueOf({ valueCodeableConcept: { text: "Never smoker" } }), "Never smoker");
  assert.equal(valueOf({ valueBoolean: false }), "false");
  const bp = { component: [{ code: { text: "SBP" }, valueQuantity: { value: 120, unit: "mmHg" } }, { code: { text: "DBP" } }] };
  assert.equal(valueOf(bp), "SBP: 120 mmHg；DBP: —");
  assert.equal(valueOf({}), "");
});

test("ownerOf: self / other patient / plain reference; absolute and _history refs count", () => {
  assert.equal(ownerOf(pt, "p1"), "self");
  assert.equal(ownerOf(obs("o", "2020"), "p1"), "self");
  assert.equal(ownerOf({ resourceType: "Practitioner", id: "dr" }, "p1"), "ref");
  assert.equal(ownerOf({ resourceType: "Observation", subject: { reference: "Patient/p10" } }, "p1"), "other", "p10 must not match p1");
  assert.equal(ownerOf({ resourceType: "Patient", id: "p2" }, "p1"), "other");
  assert.equal(ownerOf({ resourceType: "Condition", subject: { reference: "https://x/fhir/Patient/p1/_history/3" } }, "p1"), "self");
  assert.deepEqual([...patientRefs({ a: [{ reference: "Patient/x" }], meta: { source: { reference: "Patient/y" } } })], ["x"], "meta is ignored");
});

test("dedupe: same type/id once, drops junk", () => {
  assert.equal(dedupe([pt, pt, null, {}, obs("o", "2020")]).length, 2);
});

test("groupByType: counts per (owner, type), newest first, undated last", () => {
  const dr = { resourceType: "Practitioner", id: "dr", name: [{ text: "Dr. Lin" }] };
  const stranger = obs("z", "2021-01-01", { subject: { reference: "Patient/p2" } });
  const g = groupByType([pt, obs("a", "2020-01-01"), obs("b", "2023-01-01"), obs("c", undefined), dr, obs("a", "2020-01-01"), stranger], "p1");
  assert.deepEqual(g.map(x => [x.key, x.resources.length]), [["self-Observation", 3], ["other-Observation", 1], ["self-Patient", 1], ["ref-Practitioner", 1]]);
  assert.deepEqual(g[0].rows.map(r => r.id), ["b", "a", "c"]);
});

test("codeSystems: finds nested codings, labels known systems, TW Core by prefix", () => {
  const cond = { resourceType: "Condition", code: { coding: [{ system: S, code: "1" }, { system: "https://twcore.mohw.gov.tw/ig/twcore/CodeSystem/icd-10-cm-2023-tw", code: "E11" }] } };
  const res = codeSystems([obs("o", "2020"), cond, obs("p", "2020")]);
  assert.deepEqual(res.map(s => [s.label, s.count]), [["LOINC", 2], ["SNOMED CT", 1], ["TW Core · icd-10-cm-2023-tw", 1]]);
  assert.equal(codeSystems([{ system: "urn:x" }]).length, 0, "a bare system without code is not a Coding");
  assert.equal(codeSystems([{ meta: { tag: [{ system: "urn:t", code: "x" }] } }]).length, 0, "meta tags are not clinical codes");
});

test("fieldCoverage: percent of resources that fill each top-level field", () => {
  const cov = fieldCoverage([obs("a", "2020"), { ...obs("b", "2020"), note: [{ text: "x" }] }]);
  assert.equal(cov.find(f => f.field === "valueQuantity").pct, 100);
  assert.equal(cov.find(f => f.field === "note").pct, 50);
  assert.ok(!cov.some(f => f.field === "resourceType"));
});

test("summarize + snippet", () => {
  assert.deepEqual(summarize(obs("o", "2020-01-01")), { type: "Observation", id: "o", date: "2020-01-01", label: "Body Weight", value: "70 kg", status: "final" });
  assert.match(snippet("Condition", "p1", "https://x/fhir"), /client\.patient\.request\("Condition"/);
  assert.match(snippet("Condition", "p1", "https://x/fhir"), /GET https:\/\/x\/fhir\/Condition\?patient=p1/);
  assert.match(snippet("Patient", "p1", "B"), /client\.patient\.read\(\)/);
  assert.match(snippet("Practitioner", "p1", "B", "ref"), /client\.request\("Practitioner\/<id>"\)/);
  assert.match(snippet("Condition", "p1", "B", "other"), /ANOTHER patient/);
});

import { isAuthError } from "../src/logic.js";
test("isAuthError: 401 status or message, but not other failures", () => {
  assert.ok(isAuthError({ status: 401 }));
  assert.ok(isAuthError(new Error("401 Unauthorized")));
  assert.ok(!isAuthError({ status: 500, message: "500 Internal Server Error" }));
  assert.ok(!isAuthError(undefined));
});

test("filterRows: every term must match, case-insensitive; empty query keeps all", () => {
  const rows = [{ date: "2020-01-01", label: "Body Weight", value: "70 kg", status: "final" },
                { date: "2021-05-02", label: "Body Height", value: "170 cm", status: "final" }];
  assert.equal(filterRows(rows, "").length, 2);
  assert.equal(filterRows(rows, "   ").length, 2);
  assert.deepEqual(filterRows(rows, "weight").map(r => r.value), ["70 kg"]);
  assert.deepEqual(filterRows(rows, "body 2021").map(r => r.value), ["170 cm"]);
  assert.equal(filterRows(rows, "body nope").length, 0);
  assert.equal(filterRows([{ date: null, label: "X", value: "", status: "" }], "x").length, 1);
});
