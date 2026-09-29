// The ONLY file that talks to the FHIR server. Everything it returns is already plain data,
// so switching EHR / data shape later means changing this file and logic.js, not the UI.
import { LOINC, CODES } from "./config.js";
import { isAuthError } from "./logic.js";

const query = codes =>
  `Observation?code=${codes.map(c => `${LOINC}|${c}`).join(",")}&_sort=-date&_count=100`;

// pageLimit: 0 = follow every "next" page; flat: true = return resources instead of Bundles.
// (flat alone would only give you page 1.)
const ALL = { pageLimit: 0, flat: true };

/** Fetch each vital independently: one failing query must not blank the whole screen. */
export async function loadVitals(client) {
  const names = Object.keys(CODES);
  const results = await Promise.allSettled(names.map(n => client.patient.request(query(CODES[n]), ALL)));
  return Object.fromEntries(names.map((n, i) => [n,
    results[i].status === "fulfilled"
      ? { ok: true, observations: results[i].value }
      : { ok: false, auth: isAuthError(results[i].reason), error: String(results[i].reason?.message ?? results[i].reason) }]));
}

export const loadPatient = client => client.patient.read();
