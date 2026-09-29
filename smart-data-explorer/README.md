# smart-data-explorer：列出一位病人所有拿得到的資料

登入 THAS 沙盒、選一位病人後，把伺服器能給的**所有資料**依資源類型列出來。每一類都附上：

| 區塊 | 用途 |
|---|---|
| **在程式裡怎麼拿** | 可直接複製的 `fhirclient` 程式碼與對應的 REST 網址 |
| **用到的代碼系統** | LOINC、SNOMED、TW Core、健保…一眼看出資料是美式（Synthea）還是台灣代碼 |
| **欄位覆蓋率** | 每個欄位有幾 % 的資料有填。虛線 = 不是每筆都有，你的程式要處理缺值 |
| **資料** | 日期、內容、數值、狀態，每筆可展開原始 JSON |
| **下載全部 JSON** | 把這位病人的資料存成檔案，當作離線測試資料 |

跟 `smart-vitals-demo` 的分工：**explorer 用來「看有什麼」，vitals-demo 示範「做成產品」。** 規劃新功能時，先用 explorer 確認資料在不在、長怎樣，再照 vitals-demo 的結構寫。

## 執行

```bash
cd smart-data-explorer
python3 -m http.server 8091
```

- **Standalone**：開 `http://localhost:8091/launch.html`，選醫師（密碼已預填），搜尋 `Portillo`，點第一筆。
- **EHR Launch**：開 <https://thas.mohw.gov.tw/smart/sandbox>，選「EHR Launch」，Launch URL 填 `http://localhost:8091/ehr-launch.html`，按「立即測試」。
- **資料很少的病人**：登入時搜尋 `TWIDIR`（也會看到下面「其他病人的資料」的狀況）。

單元測試（Node 18+，不需安裝套件）：

```bash
node --test test/logic.test.mjs
```

端對端測試（需要 `pip install playwright && python3 -m playwright install chromium`，並先啟動上面的 server）：

```bash
python3 test/e2e.py standalone Portillo out.png
python3 test/e2e.py standalone TWIDIR   out.png
python3 test/e2e.py ehr        Portillo out.png
python3 test/e2e.py standalone Portillo out.png --no-everything   # 模擬 $everything 失敗，走逐類查詢
python3 test/e2e.py standalone Portillo out.png --browser=webkit   # 或 firefox
```

## 怎麼拿到「全部」資料

1. **先用 `Patient/<id>/$everything`**：一次拿回病人相關的所有資源，外加被引用到的醫師、機構等。這不是沙盒特有的功能，TW Core 有定義這個操作（`twcore-ig/package/package/OperationDefinition-Patient-everything.json`）。
   - 要用 `client.request(...)`。用 `client.patient.request(...)` 會直接拋錯：`Cannot filter "$everything" resources by patient` ✅。
   - 一定要加 `{ pageLimit: 0, flat: true }`，否則只拿到第一頁。
2. **`$everything` 失敗時，改成逐類查詢**：對 `src/config.js` 的 `FALLBACK_TYPES`（TW Core 有 Profile、且屬於病人的類型）各查一次 `?patient=<id>`。每個查詢各自獨立，一個失敗不影響其他。真實醫院不一定支援 `$everything`，所以要有這條備援。
   - 備援路徑不會查 Claim、ExplanationOfBenefit 這類申報資料（不在清單內）。實測：`$everything` 得到 250 筆，逐類查詢得到 181 筆。

## 實測發現：`$everything` 會帶進「其他病人」的資料

用 `TWIDIR` 搜尋到的病人（`57a8e6eb…`）測試，`$everything` 回傳 233 筆，但**只有 37 筆屬於他**。另外 190 筆（Procedure、Condition、Encounter…）屬於另一位病人（`75296123…`），是透過 Composition 的引用被一起帶進來的。改用 `Procedure?patient=57a8e6eb…` 查詢則是 0 筆。

所以 explorer 把結果分成三組：

| 分組 | 判斷方式 | 你的 App 該怎麼做 |
|---|---|---|
| 這位病人的資料 | 本身是該病人，或有引用 `Patient/<目前病人>` | 正常使用 |
| ⚠️ 屬於其他病人的資料 | 只引用到別的 `Patient/…` | **不可顯示**，要依 subject / patient 過濾 |
| 被引用到的其他資源 | 沒有引用任何病人（醫師、機構…） | 需要時依引用讀取 |

判斷邏輯在 `src/logic.js` 的 `ownerOf()`，有單元測試。

## 「在程式裡怎麼拿」的程式碼驗證過嗎？

有。在病人 3539、TWIDIR、4896 上，把每一類的 `client.patient.request(type, { pageLimit: 0, flat: true })` 實際執行一次，筆數都與畫面上的數字相同（例如 Observation 1,179 = 1,179）。

例外：`client.patient.request("Device")` 在 THAS 會拋出 `Cannot filter "Device" resources by patient`（fhirclient 依伺服器的 CapabilityStatement 判斷能不能依病人過濾）。遇到這種錯誤，改用 `` client.request(`Device?patient=${client.patient.id}`) ``，程式碼區塊的註解也有寫。

## 結構（與 smart-vitals-demo 相同的分層）

```
src/config.js   伺服器、scope、備援類型清單、中文名稱、代碼系統名稱
src/fhir.js     唯一會呼叫 FHIR 的檔案：$everything，失敗時逐類查詢
src/logic.js    純函式：日期、標籤、數值、歸屬判斷、代碼系統、欄位覆蓋率（有單元測試）
src/ui.js       只負責畫面；一律用 textContent，不用 innerHTML
src/main.js     串起來：登入 → 讀取 → 分組 → 顯示
```

## ⚠️ 這個工具刻意違反「最小權限」

explorer 要列出所有類型，所以申請 `patient/*.read`。**這只適用於開發工具。** 產品要像 `smart-vitals-demo/src/config.js` 那樣，只列出實際用到的資源（見 `docs/上手指南-開發產品.md` 第 ⑥ 步）。

## 驗證過的情境（2026-09-29，fhirclient 3.0.0，headless Chromium / Firefox / WebKit）

| 情境 | 結果 |
|---|---|
| Standalone，病人 3539（Portillo） | ✅ 250 筆、15 類，與直接呼叫 API 的結果相同；自己的 12 類共 244 筆，被引用的 3 類（Practitioner 3、Organization 2、CareTeam 1）；無 console 錯誤 |
| Standalone，TWIDIR 病人 | ✅ 自己的 37 筆、其他病人的 190 筆被標示出來 |
| EHR Launch | ✅ 與 Standalone 結果相同 |
| `$everything` 回 500（攔截模擬） | ✅ 改走逐類查詢，得 181 筆（9 類） |
| Chromium、Firefox、WebKit | ✅ 三個瀏覽器結果相同 |
| fhirclient 2.6.3 → 3.0.0 | ✅ 所有情境結果相同，「在程式裡怎麼拿」的筆數也相同 |
| 單元測試 | ✅ 11 項通過 |

## 限制

- 看不到整個伺服器有哪些資料，只看目前病人。全伺服器的各資源筆數見 `docs/可用資料清單.md`。
- 「內容」「數值」欄是為了好讀而簡化的摘要（數值取到小數 2 位），要看完整內容請展開 JSON。
- 沒有在真的 Safari 或手機上測。
- Token 過期時只顯示「請重新登入」，沒有像 vitals-demo 那樣事先提醒（這是開發工具，通常用不到 1 小時）。
