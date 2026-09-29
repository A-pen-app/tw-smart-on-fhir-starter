// DOM only. Text is always set with textContent (never innerHTML) so server data can't inject markup.
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
export const code = text => h("pre", { class: "code" }, h("code", {}, text));

/** Overview: one tile per type, click opens its section and jumps to it. */
const openTarget = e => { const el = document.getElementById(e.currentTarget.hash.slice(1)); if (el) el.open = true; };
export function tiles(groups, labels) {
  return h("ul", { class: "tiles" }, groups.map(g => h("li", {},
    h("a", { href: `#t-${g.key}`, onclick: openTarget }, h("strong", {}, String(g.resources.length)), h("span", {}, g.type), h("small", {}, labels[g.type] ?? "")))));
}

const PAGE = 50;
/** rows + matching resources -> table, first PAGE rows then a "show all" button. */
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
  const tbody = h("tbody", {}, rows.slice(0, PAGE).map(tr));
  const table = h("div", { class: "scroll" }, h("table", {}, h("thead", {}, h("tr", {}, ["日期", "內容", "數值", "狀態", ""].map(x => h("th", { class: "nowrap" }, x)))), tbody));
  if (rows.length <= PAGE) return table;
  const more = h("button", { type: "button", onclick: () => { tbody.append(...rows.slice(PAGE).map(tr)); more.remove(); } }, `顯示全部 ${rows.length} 筆`);
  return h("div", {}, table, more);
}

export function systemsList(systems) {
  if (!systems.length) return note("沒有使用任何代碼。");
  return h("ul", { class: "chips" }, systems.map(s => h("li", { title: s.system, class: /^(TW Core|健保署)/.test(s.label ?? "") ? "tw" : "" },
    `${s.label ?? s.system} · ${s.count}`)));
}

export function coverageList(fields) {
  return h("ul", { class: "chips" }, fields.map(f => h("li", { class: f.pct === 100 ? "" : "partial", title: `${f.count} 筆有此欄位` }, `${f.field} ${f.pct}%`)));
}

/** "Download everything as JSON" — handy for building offline fixtures from sandbox data. */
export function downloadButton(resources, filename) {
  return h("button", { type: "button", onclick: () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(resources, null, 2)], { type: "application/json" }));
    h("a", { href: url, download: filename }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } }, "下載全部 JSON");
}
