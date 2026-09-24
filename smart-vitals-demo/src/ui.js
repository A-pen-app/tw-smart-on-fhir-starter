// DOM only. Text is always set with textContent (never innerHTML) so server data can't inject markup.
import { tickDecimals } from "./logic.js";
const NS = "http://www.w3.org/2000/svg";
export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) k === "class" ? (e.className = v) : e.setAttribute(k, v);
  for (const k of kids.flat()) e.append(k?.nodeType ? k : document.createTextNode(String(k ?? "")));
  return e;
}
const s = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
const fmtDate = t => new Date(t).toISOString().slice(0, 10);

/** series: [{label, cls, points:[{t, v}]}] */
export function lineChart(series, unit) {
  const W = 640, H = 240, m = { l: 44, r: 12, t: 12, b: 28 };
  const all = series.flatMap(x => x.points);
  const ts = all.map(p => p.t), vs = all.map(p => p.v);
  const t0 = Math.min(...ts), t1 = Math.max(...ts);
  let v0 = Math.min(...vs), v1 = Math.max(...vs);
  const pad = (v1 - v0) * 0.1 || 1; v0 -= pad; v1 += pad;
  const X = t => m.l + (t1 === t0 ? (W - m.l - m.r) / 2 : ((t - t0) / (t1 - t0)) * (W - m.l - m.r));
  const Y = v => H - m.b - ((v - v0) / (v1 - v0)) * (H - m.t - m.b);
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", class: "chart", "aria-label": series.map(x => x.label).join(" / ") });
  const dec = tickDecimals(v0, v1);
  for (let i = 0; i <= 4; i++) {
    const v = v0 + ((v1 - v0) * i) / 4, y = Y(v);
    svg.append(s("line", { x1: m.l, x2: W - m.r, y1: y, y2: y, class: "grid" }));
    const lab = s("text", { x: m.l - 6, y: y + 4, class: "tick", "text-anchor": "end" }); lab.textContent = v.toFixed(dec); svg.append(lab);
  }
  for (const [t, anchor] of [[t0, "start"], [t1, "end"]]) {
    const lab = s("text", { x: X(t), y: H - 8, class: "tick", "text-anchor": t0 === t1 ? "middle" : anchor }); lab.textContent = fmtDate(t); svg.append(lab);
  }
  for (const x of series) {
    if (x.points.length > 1) svg.append(s("polyline", { class: `line ${x.cls}`, points: x.points.map(p => `${X(p.t)},${Y(p.v)}`).join(" ") }));
    for (const p of x.points) {
      const c = s("circle", { cx: X(p.t), cy: Y(p.v), r: 3.5, class: `dot ${x.cls}` });
      const tip = s("title"); tip.textContent = `${x.label}: ${p.v} ${unit} (${fmtDate(p.t)})`; c.append(tip); svg.append(c);
    }
  }
  return svg;
}

export function section(title, body, note) {
  return h("section", { class: "card" }, h("h2", {}, title), note ? h("p", { class: "note" }, note) : "", body);
}
export const empty = msg => h("p", { class: "state empty" }, msg);
export const failed = msg => h("p", { class: "state error", role: "alert" }, `讀取失敗：${msg}`);
export const legend = items => h("ul", { class: "legend" }, items.map(([cls, label]) => h("li", {}, h("span", { class: `swatch ${cls}` }), label)));
export const badge = (text, band) => h("span", { class: `badge ${band}` }, text);

/** Accessible text alternative to the chart. */
export function table(head, rows) {
  return h("details", { class: "raw" }, h("summary", {}, "以表格顯示"),
    h("table", {}, h("thead", {}, h("tr", {}, head.map(x => h("th", {}, x)))),
      h("tbody", {}, rows.map(r => h("tr", {}, r.map(c => h("td", {}, c)))))));
}
