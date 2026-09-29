import { loadPatient, loadVitals } from "./fhir.js";
import { CODES } from "./config.js";
import { formatName, ageOf, toBpPoints, toQuantityPoints, bpBand, latest, sessionInfo, isAuthError } from "./logic.js";
import { h, lineChart, section, empty, failed, legend, badge, table } from "./ui.js";

const root = document.getElementById("app");
const status = msg => root.replaceChildren(h("p", { class: "state" }, msg));
const BAND = { high: "偏高", low: "偏低", normal: "正常範圍" };
const relogin = () => h("p", {}, h("a", { href: "launch.html" }, "重新登入"), "（若是從病歷系統開啟的，請回病歷系統重新開啟）");

/** Token expired / rejected: nothing on screen can be trusted to update, so replace everything. */
function showExpired() {
  root.replaceChildren(h("p", { class: "state error", role: "alert" }, "登入已過期或無效，請重新登入。"), relogin());
  document.body.dataset.ready = "expired";
}

/** Without a refresh token the session simply ends; tell the user instead of silently showing stale data. */
function watchExpiry({ expiresAt, canRefresh }) {
  if (canRefresh || expiresAt === null) return;   // fhirclient refreshes automatically when it can
  setTimeout(() => {
    const t = new Date(expiresAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
    root.prepend(h("div", { class: "notice", role: "status" }, h("p", {}, `登入已於 ${t} 過期，畫面上的資料不會再更新。`), relogin()));
    document.body.dataset.expired = "1";
  }, Math.max(0, expiresAt - Date.now()));
}

function renderBanner(p) {
  const age = ageOf(p.birthDate);
  return h("header", { class: "banner" }, h("h1", {}, formatName(p.name)),
    h("p", {}, [p.gender, age === null ? null : `${age} 歲`, p.birthDate].filter(Boolean).join(" · ") || "（無基本資料）"));
}

function quantitySection(title, res, codes, cls) {
  if (!res.ok) return section(title, failed(res.error));
  const pts = toQuantityPoints(res.observations, codes);
  if (!pts.length) return section(title, empty("這位病人沒有這項資料。"));
  const unit = latest(pts).unit, last = latest(pts);
  return section(title, h("div", {},
    h("p", { class: "latest" }, `最近一次：${last.value.toFixed(1)} ${unit}（${last.date.slice(0, 10)}）`),
    lineChart([{ label: title, cls, points: pts.map(p => ({ t: p.t, v: p.value })) }], unit),
    table(["日期", `數值 (${unit})`], pts.slice().reverse().map(p => [p.date.slice(0, 10), p.value.toFixed(1)]))));
}

function bpSection(res) {
  const title = "血壓";
  if (!res.ok) return section(title, failed(res.error));
  const pts = toBpPoints(res.observations, CODES.bp);
  if (!pts.length) return section(title, empty("這位病人沒有血壓資料。"));
  const last = latest(pts);
  return section(title, h("div", {},
    h("p", { class: "latest" }, `最近一次：${last.systolic.toFixed(0)}/${last.diastolic.toFixed(0)} mmHg（${last.date.slice(0, 10)}） `, badge(BAND[bpBand(last)], bpBand(last))),
    lineChart([{ label: "收縮壓", cls: "s1", points: pts.map(p => ({ t: p.t, v: p.systolic })) },
               { label: "舒張壓", cls: "s2", points: pts.map(p => ({ t: p.t, v: p.diastolic })) }], "mmHg"),
    legend([["s1", "收縮壓"], ["s2", "舒張壓"]]),
    table(["日期", "收縮壓", "舒張壓"], pts.slice().reverse().map(p => [p.date.slice(0, 10), p.systolic.toFixed(0), p.diastolic.toFixed(0)]))),
    "分級僅為示範，非臨床判斷。");
}

async function start() {
  status("載入中…");
  const client = await FHIR.oauth2.ready();
  const session = sessionInfo(client.state);
  if (session.expired && !session.canRefresh) return showExpired();   // e.g. page reloaded an hour later
  const [patient, vitals] = await Promise.all([loadPatient(client), loadVitals(client)]);
  if (Object.values(vitals).some(v => v.auth)) return showExpired();
  root.replaceChildren(renderBanner(patient), bpSection(vitals.bp),
    quantitySection("體重", vitals.weight, CODES.weight, "s1"),
    quantitySection("BMI", vitals.bmi, CODES.bmi, "s1"),
    quantitySection("心跳", vitals.heartRate, CODES.heartRate, "s1"));
  document.body.dataset.ready = "1";
  watchExpiry(session);
}

start().catch(e => {
  if (isAuthError(e)) return showExpired();
  root.replaceChildren(h("p", { class: "state error", role: "alert" }, `無法啟動：${e.message ?? e}`),
    h("p", {}, h("a", { href: "launch.html" }, "重新登入")));
  document.body.dataset.ready = "error";
});
