import test from "node:test";
import assert from "node:assert/strict";
import { formatName, ageOf, toQuantityPoints, toBpPoints, bpBand, latest } from "../src/logic.js";

const L = "http://loinc.org";
const bpSynthea = (date, s, d) => ({ resourceType: "Observation", status: "final", code: { coding: [{ system: L, code: "55284-4" }] },
  effectiveDateTime: date, component: [
    { code: { coding: [{ system: L, code: "8462-4" }] }, valueQuantity: { value: d } },   // diastolic FIRST on purpose
    { code: { coding: [{ system: L, code: "8480-6" }] }, valueQuantity: { value: s } }] });
const bpPanel = (date, s, d) => ({ ...bpSynthea(date, s, d), code: { coding: [{ system: L, code: "85354-9" }] } });

test("BP: matches components by code, not position", () => {
  const [p] = toBpPoints([bpSynthea("2024-01-01T00:00:00Z", 120, 80)], ["55284-4"]);
  assert.equal(p.systolic, 120); assert.equal(p.diastolic, 80);
});
test("BP: accepts both the 55284-4 and 85354-9 codes, sorted oldest first", () => {
  const pts = toBpPoints([bpPanel("2024-03-01", 130, 85), bpSynthea("2024-01-01", 118, 76)], ["55284-4", "85354-9"]);
  assert.deepEqual(pts.map(p => p.systolic), [118, 130]);
});
test("BP: drops rows with missing components, bad dates, or entered-in-error", () => {
  const noDia = { ...bpSynthea("2024-01-01", 120, 80), component: [bpSynthea("x", 120, 80).component[1]] };
  const badDate = bpSynthea("not-a-date", 120, 80);
  const err = { ...bpSynthea("2024-01-01", 120, 80), status: "entered-in-error" };
  assert.deepEqual(toBpPoints([noDia, badDate, err, null, undefined], ["55284-4"]), []);
});
test("BP: tolerates undefined input", () => { assert.deepEqual(toBpPoints(undefined, ["55284-4"]), []); });

test("quantity: reads value/unit, skips non-numeric and other codes", () => {
  const w = (date, v) => ({ status: "final", code: { coding: [{ system: L, code: "29463-7" }] }, effectiveDateTime: date, valueQuantity: { value: v, unit: "kg" } });
  const other = { status: "final", code: { coding: [{ system: L, code: "8302-2" }] }, effectiveDateTime: "2024-01-01", valueQuantity: { value: 170, unit: "cm" } };
  const str = { status: "final", code: { coding: [{ system: L, code: "29463-7" }] }, effectiveDateTime: "2024-01-01", valueString: "heavy" };
  const pts = toQuantityPoints([w("2024-02-01", 61), w("2024-01-01", 60), other, str], ["29463-7"]);
  assert.deepEqual(pts.map(p => [p.value, p.unit]), [[60, "kg"], [61, "kg"]]);
});
test("quantity: a code from another system is not matched", () => {
  const o = { status: "final", code: { coding: [{ system: "http://example.org/local", code: "29463-7" }] }, effectiveDateTime: "2024-01-01", valueQuantity: { value: 60 } };
  assert.deepEqual(toQuantityPoints([o], ["29463-7"]), []);
});

test("bpBand", () => {
  assert.equal(bpBand({ systolic: 120, diastolic: 80 }), "normal");
  assert.equal(bpBand({ systolic: 140, diastolic: 80 }), "high");
  assert.equal(bpBand({ systolic: 120, diastolic: 90 }), "high");
  assert.equal(bpBand({ systolic: 85, diastolic: 70 }), "low");
});
test("formatName: prefers text, falls back to given+family, survives empty", () => {
  assert.equal(formatName([{ text: "王小明" }]), "王小明");
  assert.equal(formatName([{ prefix: ["Mr."], given: ["Adán"], family: "Portillo" }]), "Mr. Adán Portillo");
  assert.equal(formatName([]), "(no name)"); assert.equal(formatName(undefined), "(no name)");
  assert.equal(formatName([{ family: "X" }]), "X");
});
test("ageOf: birthday not yet reached this year; invalid date", () => {
  assert.equal(ageOf("2000-06-15", new Date("2024-06-14T00:00:00Z")), 23);
  assert.equal(ageOf("2000-06-15", new Date("2024-06-15T00:00:00Z")), 24);
  assert.equal(ageOf("nope"), null); assert.equal(ageOf(undefined), null);
});
test("latest", () => { assert.equal(latest([]), null); assert.equal(latest([{ a: 1 }, { a: 2 }]).a, 2); });

import { tickDecimals } from "../src/logic.js";
test("tickDecimals: whole steps need none, small ranges get decimals, bad input is safe", () => {
  assert.equal(tickDecimals(60, 140), 0);        // step 20
  assert.equal(tickDecimals(28, 30), 1);         // step 0.5 -> 28.0, 28.5, 29.0 ... (no duplicate labels)
  assert.equal(tickDecimals(28.0, 28.4), 1);     // step 0.1
  assert.equal(tickDecimals(5, 5), 0);           // zero range
  assert.equal(tickDecimals(NaN, 5), 0);
});
test("tickDecimals: adjacent tick labels are never identical", () => {
  for (const [a, b] of [[28, 30], [28.2, 30.7], [82, 92], [69, 144], [0.1, 0.35]]) {
    const d = tickDecimals(a, b), labels = [0, 1, 2, 3, 4].map(i => (a + ((b - a) * i) / 4).toFixed(d));
    assert.equal(new Set(labels).size, 5, `${a}-${b}: ${labels}`);
  }
});
