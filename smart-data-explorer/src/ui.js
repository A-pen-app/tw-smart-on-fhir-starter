// DOM only. Text is always set with textContent (never innerHTML) so server data can't inject markup.
import { filterRows } from "./logic.js";

export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const k of kids.flat()) e.append(k?.nodeType ? k : document.createTextNode(String(k ?? "")));
  return e;
}

export const note = (msg, cls = "") => h("p", { class: `state ${cls}` }, msg);

/** Copy-to-clipboard button. Class is "copy", NOT "link": e2e clicks the first button.link in a card to open JSON. */
export function copyButton(getText) {
  const btn = h("button", { type: "button", class: "copy", onclick: async () => {
    try { await navigator.clipboard.writeText(getText()); btn.textContent = "已複製"; btn.classList.add("done"); }
    catch { btn.textContent = "無法複製"; }
    setTimeout(() => { btn.textContent = "複製"; btn.classList.remove("done"); }, 2000);
  } }, "複製");
  return btn;
}

export const code = text => h("div", { class: "codebox" }, h("pre", { class: "code" }, h("code", {}, text)), copyButton(() => text));

/** Tiles and the side nav both link to #t-<key>: open that section so the jump lands on its content. */
const openTarget = e => { const el = document.getElementById(e.currentTarget.hash.slice(1)); if (el) el.open = true; };

/** Overview: one tile per type. */
export function tiles(groups, labels) {
  return h("ul", { class: "tiles" }, groups.map(g => h("li", {},
    h("a", { href: `#t-${g.key}`, onclick: openTarget }, h("strong", {}, String(g.resources.length)), h("span", {}, g.type), h("small", {}, labels[g.type] ?? "")))));
}

/** Always-visible list of every type (sidebar on wide screens, scrolling chip bar on narrow ones). Open sections are highlighted. */
export function typeNav(groups) {
  const links = groups.map(g => h("a", { href: `#t-${g.key}`, onclick: openTarget, class: g.owner },
    h("span", {}, g.owner === "other" ? `⚠️ ${g.type}` : g.type), h("small", {}, String(g.resources.length))));
  const nav = h("nav", { class: "typenav", "aria-label": "資料類型" }, links);
  // <details> fires "toggle" without bubbling, so listen in the capture phase.
  document.addEventListener("toggle", e => {
    const link = links.find(a => a.hash === `#${e.target.id}`);
    if (link) link.classList.toggle("open", e.target.open);
  }, true);
  return nav;
}

/** Open or close every type section at once. */
export function expandButtons() {
  const all = open => () => document.querySelectorAll("details.card").forEach(d => { d.open = open; });
  return h("span", { class: "bulk" }, h("button", { type: "button", onclick: all(true) }, "全部展開"), h("button", { type: "button", onclick: all(false) }, "全部收合"));
}

const PAGE = 50;
/** rows + matching resources -> filter box + table, first PAGE rows then a "show all" button. */
export function rowsTable(rows, resources) {
  const byKey = new Map(resources.map(r => [`${r.resourceType}/${r.id}`, r]));
  const tr = r => {
    // Raw JSON goes in a full-width row under this one, stringified only when first opened.
    const btn = h("button", { type: "button", class: "link", "aria-expanded": "false", onclick: () => {
      const next = row.nextElementSibling;
      if (next?.classList.contains("json")) { next.remove(); btn.setAttribute("aria-expanded", "false"); return; }
      row.after(h("tr", { class: "json" }, h("td", { colspan: "5" }, code(JSON.stringify(byKey.get(`${r.type}/${r.id}`), null, 2)))));
      btn.setAttribute("aria-expanded", "true");
    } }, "JSON");
    const row = h("tr", {}, h("td", { class: "nowrap" }, r.date?.slice(0, 10) ?? "—"), h("td", {}, r.label),
      h("td", {}, r.value), h("td", {}, r.status), h("td", {}, btn));
    return row;
  };

  let q = "", showAll = false;
  const tbody = h("tbody");
  const more = h("button", { type: "button", onclick: () => { showAll = true; render(); } });
  const count = h("span", { class: "muted", "aria-live": "polite" });
  const render = () => {
    const hits = filterRows(rows, q);
    tbody.replaceChildren(...(showAll ? hits : hits.slice(0, PAGE)).map(tr));
    if (!hits.length) tbody.append(h("tr", {}, h("td", { colspan: "5", class: "muted" }, "沒有符合的資料。")));
    more.hidden = showAll || hits.length <= PAGE;
    more.textContent = `顯示全部 ${hits.length} 筆`;
    count.textContent = q ? `符合 ${hits.length} / ${rows.length} 筆` : `共 ${rows.length} 筆`;
  };
  render();

  const table = h("div", { class: "scroll" }, h("table", {}, h("thead", {}, h("tr", {}, ["日期", "內容", "數值", "狀態", ""].map(x => h("th", { class: "nowrap" }, x)))), tbody));
  // A filter box only earns its place once there is more than a screenful.
  const filter = rows.length > 10
    ? h("div", { class: "filter" }, h("input", { type: "search", placeholder: "篩選（日期、內容、數值、狀態）", "aria-label": "篩選資料", oninput: e => { q = e.target.value; render(); } }), count)
    : "";
  return h("div", {}, filter, table, more);
}

export function systemsList(systems) {
  if (!systems.length) return note("沒有使用任何代碼。");
  const isTw = s => /^(TW Core|健保署)/.test(s.label ?? "");
  return h("div", {},
    h("ul", { class: "chips" }, systems.map(s => h("li", { title: s.system, class: isTw(s) ? "tw" : "" }, `${s.label ?? s.system} · ${s.count}`))),
    systems.some(isTw) ? h("p", { class: "legend" }, h("span", { class: "key tw" }), "綠框 = 台灣代碼（TW Core / 健保）") : "");
}

export function coverageList(fields) {
  return h("div", {},
    h("ul", { class: "chips" }, fields.map(f => h("li", { class: f.pct === 100 ? "" : "partial", title: `${f.count} 筆有此欄位` }, `${f.field} ${f.pct}%`))),
    fields.some(f => f.pct < 100) ? h("p", { class: "legend" }, h("span", { class: "key partial" }), "虛線 = 不是每筆都有，程式要能處理缺值") : "");
}

/** "Download everything as JSON" — handy for building offline fixtures from sandbox data. */
export function downloadButton(resources, filename) {
  return h("button", { type: "button", onclick: () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(resources, null, 2)], { type: "application/json" }));
    h("a", { href: url, download: filename }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } }, "下載全部 JSON");
}
