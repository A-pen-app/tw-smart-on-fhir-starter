import { loadPatient, loadVitals } from "./fhir.js";
import { CODES } from "./config.js";
import { formatName, ageOf, toBpPoints, toQuantityPoints, bpBand, latest, sessionInfo, minutesLeft, isAuthError } from "./logic.js";
import { h, lineChart, section, empty, failed, legend, badge, table, latestLine, kpis } from "./ui.js";

const root = document.getElementById("app");
const sessionEl = document.getElementById("session");   // in the top bar, outside #app
const status = msg => root.replaceChildren(h("p", { class: "state loading" }, msg));
const BAND = { high: "偏高", low: "偏低", normal: "正常範圍" };
const relogin = () => h("p", {}, h("a", { href: "launch.html" }, "重新登入"), "（若是從病歷系統開啟的，請回病歷系統重新開啟）");
const setSession = (text, cls = "") => { sessionEl.textContent = text; sessionEl.className = `session ${cls}`; };

/** Token expired / rejected: nothing on screen can be trusted to update, so replace everything. */
function showExpired() {
  root.replaceChildren(h("p", { class: "state error", role: "alert" }, "登入已過期或無效，請重新登入。"), relogin());
  setSession("登入已過期", "expired");
  document.body.dataset.ready = "expired";
}

/** Without a refresh token the session simply ends; tell the user instead of silently showing stale data. */
function watchExpiry({ expiresAt, canRefresh }) {
  if (canRefresh) return setSession("登入會自動續期");   // fhirclient refreshes automatically when it can
  if (expiresAt === null) return;
  const countdown = () => { const min = minutesLeft({ expiresAt }); setSession(`登入剩 ${min} 分鐘`, min <= 5 ? "soon" : ""); };
  const timer = setInterval(countdown, 15000);
  countdown();
  setTimeout(() => {
    clearInterval(timer);
    const t = new Date(expiresAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
    root.prepend(h("div", { class: "notice", role: "status" }, h("p", {}, `登入已於 ${t} 過期，畫面上的資料不會再更新。`), relogin()));
    setSession("登入已過期", "expired");
    document.body.dataset.expired = "1";
  }, Math.max(0, expiresAt - Date.now()));
}

function renderBanner(p) {
  const age = ageOf(p.birthDate);
  return h("header", { class: "banner" }, h("h1", {}, formatName(p.name)),
    h("p", {}, [p.gender, age === null ? null : `${age} 歲`, p.birthDate].filter(Boolean).join(" · ") || "（無基本資料）"));
}

const day = d => d.slice(0, 10);

/** Raw query result -> what both the summary strip and the card need. */
function prepareQuantity(id, title, res, codes) {
  if (!res.ok) return { id, title, state: "error", error: res.error };
  const pts = toQuantityPoints(res.observations, codes);
  if (!pts.length) return { id, title, state: "empty" };
  const last = latest(pts);
  return { id, title, state: "ok", pts, unit: last.unit, value: last.value.toFixed(1), date: day(last.date) };
}

function prepareBp(res) {
  const base = { id: "v-bp", title: "血壓" };
  if (!res.ok) return { ...base, state: "error", error: res.error };
  const pts = toBpPoints(res.observations, CODES.bp);
  if (!pts.length) return { ...base, state: "empty" };
  const last = latest(pts), band = bpBand(last);
  return { ...base, state: "ok", pts, unit: "mmHg", value: `${last.systolic.toFixed(0)}/${last.diastolic.toFixed(0)}`, date: day(last.date),
    extra: badge(BAND[band], band), band };
}

function quantitySection(v, cls) {
  if (v.state === "error") return section(v.title, failed(v.error), null, v.id);
  if (v.state === "empty") return section(v.title, empty("這位病人沒有這項資料。"), null, v.id);
  return section(v.title, h("div", {},
    latestLine(v.value, v.unit, v.date),
    lineChart([{ label: v.title, cls, points: v.pts.map(p => ({ t: p.t, v: p.value })) }], v.unit, x => x.toFixed(1)),
    table(["日期", `數值 (${v.unit})`], v.pts.slice().reverse().map(p => [day(p.date), p.value.toFixed(1)]))), null, v.id);
}

function bpSection(v) {
  if (v.state === "error") return section(v.title, failed(v.error), null, v.id);
  if (v.state === "empty") return section(v.title, empty("這位病人沒有血壓資料。"), null, v.id);
  return section(v.title, h("div", {},
    latestLine(v.value, "mmHg", v.date, badge(BAND[v.band], v.band)),
    lineChart([{ label: "收縮壓", cls: "s1", points: v.pts.map(p => ({ t: p.t, v: p.systolic })) },
               { label: "舒張壓", cls: "s2", points: v.pts.map(p => ({ t: p.t, v: p.diastolic })) }], "mmHg", x => x.toFixed(0)),
    legend([["s1", "收縮壓"], ["s2", "舒張壓"]]),
    table(["日期", "收縮壓", "舒張壓"], v.pts.slice().reverse().map(p => [day(p.date), p.systolic.toFixed(0), p.diastolic.toFixed(0)]))),
    "分級僅為示範，非臨床判斷。", v.id);
}

async function start() {
  status("載入中…");
  const client = await FHIR.oauth2.ready();
  const session = sessionInfo(client.state);
  if (session.expired && !session.canRefresh) return showExpired();   // e.g. page reloaded an hour later
  const [patient, vitals] = await Promise.all([loadPatient(client), loadVitals(client)]);
  if (Object.values(vitals).some(v => v.auth)) return showExpired();
  const bp = prepareBp(vitals.bp),
    weight = prepareQuantity("v-weight", "體重", vitals.weight, CODES.weight),
    bmi = prepareQuantity("v-bmi", "BMI", vitals.bmi, CODES.bmi),
    heartRate = prepareQuantity("v-hr", "心跳", vitals.heartRate, CODES.heartRate);
  root.replaceChildren(renderBanner(patient), kpis([bp, weight, bmi, heartRate]),
    bpSection(bp), quantitySection(weight, "s1"), quantitySection(bmi, "s1"), quantitySection(heartRate, "s1"));
  document.body.dataset.ready = "1";
  watchExpiry(session);
}

start().catch(e => {
  if (isAuthError(e)) return showExpired();
  root.replaceChildren(h("p", { class: "state error", role: "alert" }, `無法啟動：${e.message ?? e}`),
    h("p", {}, h("a", { href: "launch.html" }, "重新登入")));
  document.body.dataset.ready = "error";
});
