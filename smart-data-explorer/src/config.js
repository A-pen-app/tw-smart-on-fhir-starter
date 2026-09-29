// Everything that differs between environments lives here.
export const FHIR_BASE = "https://thas.mohw.gov.tw/v/r4/fhir";
export const CLIENT_ID = "data-explorer";        // free-form in the THAS sandbox; real EHRs usually require registration

// ⚠️ Deliberate exception to least privilege: an explorer's whole job is to show EVERY resource type,
// so it asks for patient/*.read. A product app must list only the types it uses
// (see smart-vitals-demo/src/config.js and docs/上手指南-開發產品.md ⑥).
export const READ_SCOPES = "patient/*.read openid fhirUser";
export const STANDALONE_SCOPE = `launch/patient ${READ_SCOPES}`;
export const EHR_SCOPE = `launch ${READ_SCOPES}`;

// Used only when Patient/$everything fails (a real hospital may not support it; TW Core defines it in
// twcore-ig/package/package/OperationDefinition-Patient-everything.json). Patient-compartment types that
// TW Core profiles, each searched with ?patient=<id>.
export const FALLBACK_TYPES = [
  "Observation", "Condition", "Encounter", "Procedure", "DiagnosticReport", "AllergyIntolerance",
  "Immunization", "ImagingStudy", "Specimen", "Media", "MedicationRequest", "MedicationStatement",
  "MedicationDispense", "CarePlan", "CareTeam", "Goal", "ServiceRequest", "Composition",
  "DocumentReference", "Coverage", "QuestionnaireResponse", "Device",
];

// Display names for the overview. Unknown types just show the English name.
export const TYPE_LABELS = {
  Patient: "病人", Observation: "檢驗 / 生命徵象", Condition: "診斷", Encounter: "就診", Procedure: "處置",
  DiagnosticReport: "檢查報告", AllergyIntolerance: "過敏", Immunization: "疫苗", ImagingStudy: "影像檢查",
  Specimen: "檢體", Media: "影音", MedicationRequest: "處方", MedicationStatement: "用藥紀錄",
  MedicationDispense: "調劑", MedicationAdministration: "給藥", Medication: "藥品", CarePlan: "照護計畫",
  CareTeam: "照護團隊", Goal: "照護目標", ServiceRequest: "醫囑 / 申請", Composition: "結構化文件",
  DocumentReference: "文件索引", Coverage: "保險", QuestionnaireResponse: "問卷回覆", Device: "裝置",
  Claim: "申報", ExplanationOfBenefit: "給付說明", Practitioner: "醫事人員", PractitionerRole: "人員角色",
  Organization: "機構", Location: "地點", AuditEvent: "稽核紀錄", Provenance: "來源紀錄",
};

// Friendly names for code systems, so you can see at a glance whether data is US (Synthea) or TW Core coded.
export const SYSTEM_LABELS = [
  ["http://loinc.org", "LOINC"],
  ["http://snomed.info/sct", "SNOMED CT"],
  ["http://www.nlm.nih.gov/research/umls/rxnorm", "RxNorm"],
  ["http://hl7.org/fhir/sid/cvx", "CVX（美國疫苗碼）"],
  ["http://hl7.org/fhir/sid/icd-10", "ICD-10"],
  ["https://twcore.mohw.gov.tw/", "TW Core"],
  ["http://twcore.mohw.gov.tw/", "TW Core"],
  ["https://www.nhi.gov.tw", "健保署"],
  ["http://terminology.hl7.org/CodeSystem/", "HL7 內建代碼"],
  ["http://hl7.org/fhir/", "FHIR 內建代碼"],
  ["http://unitsofmeasure.org", "UCUM 單位"],
  ["http://dicom.nema.org/resources/ontology/DCM", "DICOM"],
  ["https://bluebutton.cms.gov/", "CMS Blue Button（美國申報）"],
  ["urn:ietf:bcp:13", "MIME type"],
];
