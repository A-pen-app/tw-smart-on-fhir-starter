// Everything that differs between environments lives here.
export const FHIR_BASE = "https://thas.mohw.gov.tw/v/r4/fhir";
export const CLIENT_ID = "vitals-demo";          // free-form in the THAS sandbox; real EHRs usually require registration

// Least privilege: only what this app reads. (The sandbox does NOT enforce scopes, so keep this list honest yourself.)
export const READ_SCOPES = "patient/Patient.read patient/Observation.read openid fhirUser";
export const STANDALONE_SCOPE = `launch/patient ${READ_SCOPES}`;
export const EHR_SCOPE = `launch ${READ_SCOPES}`;

// LOINC codes. Blood pressure appears under two different codes in the sandbox
// (Synthea uses 55284-4, hand-made data uses 85354-9), so we ask for both.
export const LOINC = "http://loinc.org";
export const CODES = {
  bp: ["55284-4", "85354-9"],
  weight: ["29463-7"],
  bmi: ["39156-5"],
  heartRate: ["8867-4"],
};
export const BP_COMPONENT = { systolic: "8480-6", diastolic: "8462-4" };
