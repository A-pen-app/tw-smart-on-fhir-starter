# smart-poc：最小 SMART on FHIR App 範例

對 THAS 沙盒（`https://thas.mohw.gov.tw/v/r4/fhir`）驗證用，無需安裝套件，只用瀏覽器與 `fhirclient.js`（CDN）。

| 檔案 | 用途 |
|---|---|
| `launch.html` | **Standalone launch**：向授權伺服器申請 token。可用 `?scope=...` 改 scope |
| `ehr-launch.html` | **EHR launch**：由沙盒頁面觸發，`iss` 與 `launch` 由網址帶入 |
| `index.html` | 授權完成後的頁面：讀取 Patient 與 Observation 並顯示 |

## 執行

```bash
cd smart-poc
python3 -m http.server 8080
```

**Standalone**：打開 `http://localhost:8080/launch.html` → 選任一位醫師（密碼已預填）→ 選病人（建議搜尋 `Portillo`，資料較完整）→ 回到 App。

**EHR Launch**：打開 <https://thas.mohw.gov.tw/smart/sandbox> → 選「EHR Launch」→ Launch URL 填 `http://localhost:8080/ehr-launch.html` → 「立即測試」。

## 注意
- `clientId` 可自取，沙盒不需註冊。
- Standalone 必須帶 `launch: "e30"`，否則授權端點回 400。EHR Launch 不需要。
- 沙盒不檢查 scope，測試通過不代表權限設定正確，見 `../docs/沙盒驗證結果.md`。
- `index.html` 只做展示，未處理錯誤畫面與 token 過期。
