import { loadPatient, loadEverything } from "./fhir.js";
import { TYPE_LABELS } from "./config.js";
import { formatName, groupByType, codeSystems, fieldCoverage, snippet, isAuthError } from "./logic.js";
import { h, note, code, tiles, rowsTable, systemsList, coverageList, downloadButton } from "./ui.js";

const root = document.getElementById("app");
const status = msg => root.replaceChildren(note(msg));

function typeSection(g, patientId, base) {
  return h("details", { class: `card ${g.owner}`, id: `t-${g.key}` },
    h("summary", {}, h("h2", {}, g.owner === "other" ? `⚠️ ${g.type}（其他病人）` : g.type), h("span", { class: "muted" }, ` ${TYPE_LABELS[g.type] ?? ""} · ${g.resources.length} 筆`)),
    h("h3", {}, "在程式裡怎麼拿"), code(snippet(g.type, patientId, base, g.owner)),
    h("h3", {}, "用到的代碼系統"), systemsList(codeSystems(g.resources)),
    h("h3", {}, "欄位覆蓋率（有幾 % 的資料填了這個欄位）"), coverageList(fieldCoverage(g.resources)),
    h("h3", {}, "資料"), rowsTable(g.rows, g.resources));
}

function sourceNote(result, total) {
  if (result.source === "$everything") return `來源：Patient/$everything，共 ${total} 筆。`;
  const failed = result.errors.map(e => e.type).join("、");
  return `$everything 失敗（${result.everythingError}），改為逐類查詢，共 ${total} 筆。` + (failed ? ` 查詢失敗的類型：${failed}` : "");
}

async function start() {
  status("登入中…");
  const client = await FHIR.oauth2.ready();
  status("讀取這位病人的所有資料…（資料多的病人約需數秒）");
  const [patient, result] = await Promise.all([loadPatient(client), loadEverything(client)]);
  const id = client.patient.id, base = client.state.serverUrl;
  const groups = groupByType([patient, ...result.resources], id);
  const [own, other, refs] = ["self", "other", "ref"].map(o => groups.filter(g => g.owner === o));
  const count = gs => gs.reduce((n, g) => n + g.resources.length, 0);
  const total = count(groups);

  root.replaceChildren(...[
    h("header", { class: "banner" },
      h("h1", {}, formatName(patient.name) ?? `Patient/${id}`),
      h("p", {}, [`Patient/${id}`, patient.gender, patient.birthDate].filter(Boolean).join(" · ")),
      h("p", {}, sourceNote(result, total), " ", downloadButton([patient, ...result.resources], `patient-${id}.json`))),
    h("h2", {}, `這位病人的資料（${own.length} 種、${count(own)} 筆）`), tiles(own, TYPE_LABELS),
    other.length ? [h("h2", { class: "warn" }, `⚠️ 屬於其他病人的資料（${count(other)} 筆）`),
      note("伺服器的 $everything 透過資料之間的連結，把別的病人的資料也帶進來了。你的 App 必須用 subject / patient 過濾，不能直接全部顯示。", "warn"),
      tiles(other, TYPE_LABELS)] : [],
    refs.length ? [h("h2", {}, `被引用到的其他資源（${refs.length} 種）`),
      note("這些不屬於任何病人，而是病人資料裡引用到的醫師、機構等，伺服器順便附上。"), tiles(refs, TYPE_LABELS)] : [],
    h("p", { class: "muted" }, "點方塊或標題展開。虛線欄位 = 不是每筆都有，程式要能處理缺值。綠色代碼 = 台灣（TW Core / 健保）代碼。"),
    [...own, ...other, ...refs].map(g => typeSection(g, id, base)),
  ].flat());
  document.body.dataset.ready = "1";
}

start().catch(e => {
  root.replaceChildren(note(isAuthError(e) ? "登入已過期或無效（token 有效 1 小時），請重新登入。" : `無法啟動：${e.message ?? e}`, "error"), h("p", {}, h("a", { href: "launch.html" }, "重新登入")));
  document.body.dataset.ready = "error";
});
