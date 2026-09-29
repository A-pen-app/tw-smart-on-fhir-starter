# smart-vitals-demo：生命徵象趨勢圖（SMART on FHIR 範例產品）

對 THAS 沙盒讀取目前病人的**血壓、體重、BMI、心跳**，畫成趨勢圖。
它是 `docs/上手指南-開發產品.md` 第 ③～⑥ 步的可執行版本：無需建置工具、無外部圖表函式庫，只有 `fhirclient` 一個 CDN 依賴（已釘版本 3.0.0）。

## 執行

```bash
cd smart-vitals-demo
python3 -m http.server 8090
```

- **Standalone**：開 `http://localhost:8090/launch.html` → 選醫師（密碼已預填）→ 搜尋 `Portillo` → 點第一筆。
- **EHR Launch**：開 <https://thas.mohw.gov.tw/smart/sandbox> → 「EHR Launch」→ Launch URL 填 `http://localhost:8090/ehr-launch.html` → 「立即測試」。
- **沒有資料的情境**：登入時搜尋 `TWIDIR`，會看到各區塊的「沒有這項資料」狀態。

單元測試（Node 18+，無需安裝）：

```bash
node --test test/logic.test.mjs
```

端對端測試（需 `pip install playwright && python3 -m playwright install chromium`，並先啟動上面的 server）：

```bash
python3 test/e2e.py standalone Portillo out.png   # 也可換成 TWIDIR 或 ehr
python3 test/e2e.py standalone Portillo out.png --expiry            # 另外模擬 token 過期的三種情況
python3 test/e2e.py standalone Portillo out.png --browser=firefox   # 或 webkit（Safari 的引擎）
python3 test/e2e.py standalone Portillo out.png --fail-weight       # 模擬體重查詢失敗，只有該卡片顯示錯誤
```

也可以在專案根目錄執行 `npm test`（兩個範例的單元測試）與 `npm run e2e:vitals`。

## 結構：三層分離

```
src/config.js   環境設定：伺服器網址、scope、LOINC 代碼（換環境只改這裡）
src/fhir.js     唯一會呼叫 FHIR 伺服器的檔案；每個查詢獨立，一個失敗不影響其他
src/logic.js    純函式：FHIR Observation → 簡單資料點（有單元測試，不碰網路與 DOM）
src/ui.js       只負責畫面（SVG 圖表、表格）；文字一律用 textContent，不用 innerHTML
src/main.js     串起來：登入 → 讀取 → 三種狀態（有資料 / 沒資料 / 失敗），加上登入過期的處理
```

## 這個範例處理了哪些真實資料的坑

| 現象 | 處理 |
|---|---|
| 血壓在沙盒有**兩種代碼**（Synthea 用 `55284-4`，手建資料用 `85354-9`） | 查詢一次帶兩個代碼 |
| 血壓的收縮壓/舒張壓在 `component[]` 裡，順序不保證 | 用 LOINC 代碼（8480-6 / 8462-4）比對，不用陣列位置 |
| 有些 Observation 沒有數值、日期壞掉、或 `entered-in-error` | 轉換時丟棄，不拋例外 |
| `code.coding[].system` 可能不是 LOINC | 有 system 時必須是 `http://loinc.org` 才算 |
| 結果有多頁 | `{ pageLimit: 0, flat: true }`（**只寫 `flat: true` 只會拿到第一頁**，已實測：5 筆 vs 99 筆） |
| 病人沒有某項資料 | 顯示「沒有這項資料」，不是錯誤 |
| 某個查詢失敗 | 只有該區塊顯示錯誤，其他照常（`Promise.allSettled`） |
| 姓名格式不一 | `name.text` 優先，否則 prefix + given + family |
| Token 只有 1 小時，沒有 refresh token | 過期時在畫面上方提示「登入已過期」，資料保留；重新整理時若已過期或伺服器回 401，整頁改成重新登入說明（`sessionInfo`、`isAuthError`、`watchExpiry`） |

## 驗證過的情境（2026-09-29，fhirclient 3.0.0，headless Chromium / Firefox / WebKit）

| 情境 | 結果 |
|---|---|
| Standalone、資料豐富的病人（3539） | ✅ 四個區塊正確；血壓 10 筆 = 20 個點；無 console 錯誤 |
| Standalone、沒有資料的病人（TWIDIR） | ✅ 四個區塊皆顯示「沒有資料」；無錯誤 |
| EHR Launch | ✅ 與 Standalone 相同結果；token scope 為 `launch patient/Patient.read patient/Observation.read openid fhirUser` |
| 體重查詢回 500（攔截模擬） | ✅ 只有體重顯示失敗，其餘正常（`--fail-weight`） |
| Chromium、Firefox、WebKit | ✅ 三個瀏覽器結果相同，無 console 錯誤 |
| 登入中途過期（`--expiry`） | ✅ 上方出現「登入已於 HH:MM 過期」，四張卡片保留 |
| 重新整理時已過期 | ✅ 不發查詢，直接顯示重新登入說明 |
| Token 被伺服器拒絕（401） | ✅ 顯示重新登入說明，不是一般錯誤訊息 |
| fhirclient 2.6.3 → 3.0.0 | ✅ 所有情境結果相同（3.x 的檔案路徑改成 `bundle/fhir-client.js`） |
| 單元測試 | ✅ 14 項通過 |

## 已知限制

- **沙盒不檢查 scope**：本範例申請的是最小權限，但沙盒即使給更多也不會擋，見 `docs/沙盒驗證結果.md`。連真實系統時請重測。
- 血壓「偏高／偏低」的分級只是示範門檻，**不是臨床判斷**。
- 測過 Chromium、Firefox、WebKit 的桌面版，**沒有在真的 Safari 或手機上測**。WebKit 很接近 Safari，但不完全相同。
- 為了最小權限，沒有申請 `offline_access`，所以 1 小時後要重新登入。需要長時間使用時，在 `config.js` 的 scope 加上 `offline_access`，fhirclient 會自動更新 token。
- 圖表只有起訖兩個日期標籤，沒有縮放、單位換算或參考範圍。
- 尚未在真實醫院系統測試；每家醫院的代碼與欄位可能不同，需調整 `config.js` 與 `logic.js`。
