// DOM only. Text is always set with textContent (never innerHTML) so server data can't inject markup.
import { tickDecimals, nearestIndex } from "./logic.js";
const NS = "http://www.w3.org/2000/svg";
export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) k === "class" ? (e.className = v) : e.setAttribute(k, v);
  for (const k of kids.flat()) e.append(k?.nodeType ? k : document.createTextNode(String(k ?? "")));
  return e;
}
const s = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
const fmtDate = t => new Date(t).toISOString().slice(0, 10);

/**
 * series: [{label, cls, points:[{t, v}]}], fmt: number -> display text.
 * Returns the <svg class="chart"> inside a wrapper that also holds the hover / tap tooltip.
 */
export function lineChart(series, unit, fmt = v => String(v)) {
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
  const cursor = s("line", { y1: m.t, y2: H - m.b, class: "cursor", visibility: "hidden" });
  svg.append(cursor);
  const dots = new Map();   // "cls@t" -> circle, to highlight the hovered points
  for (const x of series) {
    if (x.points.length > 1) svg.append(s("polyline", { class: `line ${x.cls}`, points: x.points.map(p => `${X(p.t)},${Y(p.v)}`).join(" ") }));
    for (const p of x.points) {
      const c = s("circle", { cx: X(p.t), cy: Y(p.v), r: 3.5, class: `dot ${x.cls}` });
      const tip = s("title"); tip.textContent = `${x.label}: ${p.v} ${unit} (${fmtDate(p.t)})`; c.append(tip); svg.append(c);
      dots.set(`${x.cls}@${p.t}`, c);
    }
  }

  // Tooltip: ONE transparent rect catches mouse and touch (the dots are too small to tap, and <title> never shows on touch).
  // Deliberately not extra circles: e2e counts circles per card.
  const times = [...new Set(ts)].sort((a, b) => a - b);
  const tipBox = h("div", { class: "tip", hidden: "" });
  const hit = s("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, class: "hit" });
  let active = [];
  const hide = () => { tipBox.hidden = true; cursor.setAttribute("visibility", "hidden"); active.forEach(c => c.classList.remove("on")); active = []; };
  const show = e => {
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    const t = times[nearestIndex(times, t0 + ((x - m.l) / (W - m.l - m.r)) * (t1 - t0 || 1))];
    const cx = X(t);
    cursor.setAttribute("x1", cx); cursor.setAttribute("x2", cx); cursor.setAttribute("visibility", "visible");
    active.forEach(c => c.classList.remove("on"));
    active = series.map(x => dots.get(`${x.cls}@${t}`)).filter(Boolean);
    active.forEach(c => c.classList.add("on"));
    tipBox.replaceChildren(h("strong", {}, fmtDate(t)), ...series.flatMap(x => {
      const p = x.points.find(p => p.t === t);
      return p ? [h("span", {}, h("i", { class: `swatch ${x.cls}` }), `${x.label} ${fmt(p.v)} ${unit}`)] : [];
    }));
    // Keep the box inside the chart: anchor it on whichever side of the cursor has room.
    const pct = (cx / W) * 100;
    Object.assign(tipBox.style, pct > 50 ? { left: "", right: `${100 - pct + 1.5}%` } : { right: "", left: `${pct + 1.5}%` });
    tipBox.hidden = false;
  };
  hit.addEventListener("pointermove", show);
  hit.addEventListener("pointerdown", show);
  // Touch fires pointerleave right after the tap ends: only hide for a mouse, a tap keeps the tooltip until the next tap.
  hit.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hide(); });
  svg.append(hit);
  return h("div", { class: "chartbox" }, svg, tipBox);
}

export function section(title, body, note, id) {
  return h("section", { class: "card", ...(id ? { id } : {}) }, h("h2", {}, title), note ? h("p", { class: "note" }, note) : "", body);
}
export const empty = msg => h("p", { class: "state empty" }, msg);
export const failed = msg => h("p", { class: "state error", role: "alert" }, `讀取失敗：${msg}`);
export const legend = items => h("ul", { class: "legend" }, items.map(([cls, label]) => h("li", {}, h("span", { class: `swatch ${cls}` }), label)));
export const badge = (text, band) => h("span", { class: `badge ${band}` }, text);

/** "最近一次" line: big value, unit, date, optional badge. */
export const latestLine = (value, unit, date, extra = "") =>
  h("p", { class: "latest" }, h("span", { class: "label" }, "最近一次"), h("span", { class: "big" }, value), h("span", { class: "unit" }, unit), h("span", { class: "date" }, date), extra);

/** Summary strip under the banner. items: [{id, title, value, unit, date, extra, state: "ok"|"empty"|"error"}]. Not section.card on purpose. */
export function kpis(items) {
  return h("nav", { class: "kpis", "aria-label": "最新數值" }, items.map(k => h("a", { href: `#${k.id}`, class: `kpi ${k.state}` },
    h("span", { class: "kpi-title" }, k.title),
    k.state === "ok" ? [h("strong", {}, k.value, h("small", {}, ` ${k.unit}`)), h("span", { class: "kpi-meta" }, k.date, k.extra ?? "")]
      : h("span", { class: "kpi-meta" }, k.state === "empty" ? "無資料" : "讀取失敗"))));
}

/** Accessible text alternative to the chart. */
export function table(head, rows) {
  return h("details", { class: "raw" }, h("summary", {}, `以表格顯示（${rows.length} 筆）`),
    h("div", { class: "scroll" }, h("table", {}, h("thead", {}, h("tr", {}, head.map(x => h("th", {}, x)))),
      h("tbody", {}, rows.map(r => h("tr", {}, r.map(c => h("td", {}, c))))))));
}
