# smart-vitals-demo：生命徵象趨勢圖（SMART on FHIR 範例產品）

對 THAS 沙盒讀取目前病人的**血壓、體重、BMI、心跳**，畫成趨勢圖。
它是 `docs/上手指南-開發產品.md` 第 ③～⑥ 步的可執行版本：無需建置工具、無外部圖表函式庫，只有 `fhirclient` 一個 CDN 依賴（已釘版本 2.6.3）。

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
```

## 結構：三層分離

```
src/config.js   環境設定：伺服器網址、scope、LOINC 代碼（換環境只改這裡）
src/fhir.js     唯一會呼叫 FHIR 伺服器的檔案；每個查詢獨立，一個失敗不影響其他
src/logic.js    純函式：FHIR Observation → 簡單資料點（有單元測試，不碰網路與 DOM）
src/ui.js       只負責畫面（SVG 圖表、表格）；文字一律用 textContent，不用 innerHTML
src/main.js     串起來：登入 → 讀取 → 三種狀態（有資料 / 沒資料 / 失敗）
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

## 驗證過的情境（2026-09-24，headless Chromium）

| 情境 | 結果 |
|---|---|
| Standalone、資料豐富的病人（3539） | ✅ 四個區塊正確；血壓 10 筆 = 20 個點；無 console 錯誤 |
| Standalone、沒有資料的病人（TWIDIR） | ✅ 四個區塊皆顯示「沒有資料」；無錯誤 |
| EHR Launch | ✅ 與 Standalone 相同結果；token scope 為 `launch patient/Patient.read patient/Observation.read openid fhirUser` |
| 體重查詢回 500（攔截模擬） | ✅ 只有體重顯示失敗，其餘正常 |
| 單元測試 | ✅ 12 項通過 |

## 已知限制

- **沙盒不檢查 scope**：本範例申請的是最小權限，但沙盒即使給更多也不會擋，見 `docs/沙盒驗證結果.md`。連真實系統時請重測。
- 血壓「偏高／偏低」的分級只是示範門檻，**不是臨床判斷**。
- 只在 Chromium 測過，未測 Safari / Firefox / 手機。
- 沒有做 token 過期後的自動更新畫面；`offline_access` 未在此範例申請。
- 圖表只有起訖兩個日期標籤，沒有縮放、單位換算或參考範圍。
- 尚未在真實醫院系統測試；每家醫院的代碼與欄位可能不同，需調整 `config.js` 與 `logic.js`。
- `fhirclient` 最新版是 3.0.0，本範例用 2.6.3，未測 3.x。
