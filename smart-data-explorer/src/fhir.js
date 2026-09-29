// The ONLY file that talks to the FHIR server.
import { FALLBACK_TYPES } from "./config.js";

// pageLimit: 0 = follow every "next" page; flat: true = return resources instead of Bundles.
const ALL = { pageLimit: 0, flat: true };

export const loadPatient = client => client.patient.read();

/**
 * Everything the server will give us about the current patient.
 * 1st choice: Patient/<id>/$everything — one call, also includes referenced resources (Practitioner, Organization…).
 * Fallback: one search per type in FALLBACK_TYPES; each is independent, so one failure doesn't hide the rest.
 * Note: $everything goes through client.request. client.patient.request rejects it ("Cannot filter "$everything" resources by patient").
 * The fallback also builds ?patient= itself: client.patient.request("Device") throws the same error on THAS.
 */
export async function loadEverything(client) {
  const id = client.patient.id;
  try {
    const resources = await client.request(`Patient/${id}/$everything?_count=200`, ALL);
    return { source: "$everything", resources, errors: [] };
  } catch (e) {
    const settled = await Promise.allSettled(FALLBACK_TYPES.map(t => client.request(`${t}?patient=${id}&_count=200`, ALL)));
    return {
      source: "per-type",
      everythingError: String(e?.message ?? e),
      resources: settled.flatMap(r => (r.status === "fulfilled" ? r.value : [])),
      errors: settled.flatMap((r, i) => (r.status === "rejected" ? [{ type: FALLBACK_TYPES[i], error: String(r.reason?.message ?? r.reason) }] : [])),
    };
  }
}
