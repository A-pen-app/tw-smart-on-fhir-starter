# 臺灣醫療資訊標準大平台 — SMART on FHIR APP 開發說明（爬取整理）

抓取日期：2026-09-24
來源：https://medstandard.mohw.gov.tw/smart/app （工研院代營運，聯絡：medstandard@itri.org.tw）

> 🚀 **要開始開發產品？看 [`上手指南-開發產品.md`](上手指南-開發產品.md)**，可執行的範例產品在 `../smart-vitals-demo/`
>
> 🔰 **不熟這個領域？先看 [`00-入門簡介.md`](00-入門簡介.md)**（架構圖＋實作步驟，白話版）。可跑的範例在 `../smart-poc/`。實測結果見 [`沙盒驗證結果.md`](沙盒驗證結果.md)，可用資料見 [`可用資料清單.md`](可用資料清單.md)。

## 重點結論

`/smart/app` 本身**幾乎沒有原創技術內容**，只有三個區塊：

1. 「基於瀏覽器的應用程式入門」→ 外連 http://docs.smarthealthit.org/tutorials/javascript/
2. 「EHR 中執行 SMART APP 入門」→ 外連 http://docs.smarthealthit.org/tutorials/server-quick-start/
3. 「SMART APP 示範影片」：以 SMART APP 實現 CQL，以連續血糖監測（健保 08134B）為例
   - 影片：https://medstandard.mohw.gov.tw/videos/SMART_CQL_DEMO.mp4 （約 155 MB，已下載到 `../downloads/SMART_CQL_DEMO.mp4`）
   - 截圖：`assets/continuous-glucose-monitoring.png`

所以實際的開發依據是 SMART 官方文件，加上台灣端的 FHIR 資源（TW Core IG、測試 Server）。

## 本目錄內容

| 檔案 | 說明 |
|---|---|
| **`上手指南-開發產品.md`** | 以開發產品為前提的 8 步驟指南（定義→環境→最小 App→資料→功能→測試→部署→上架） |
| **`00-入門簡介.md`** | 給新手的白話簡介：架構圖、實作步驟、名詞小辭典 |
| **`沙盒驗證結果.md`** | THAS 沙盒實測：Standalone / EHR Launch / refresh token / 寫入 / 權限檢查 |
| **`可用資料清單.md`** | 沙盒各資源筆數、TW Core 定義的資料、應用對照與限制 |
| `thas/` | THAS 網站頁面（沙盒、市集、提案、FAQ）與 API 探測結果 |
| `twsample/` | FHIR Sample Code：20 個資源的 Client 範例、Server 安裝說明 |
| `external/` | HL7 SMART 規格、fhirclient.js 文件、健保署 IG、衛福部文章 |
| `smart-tutorial-javascript.md` | SMART JS client（fhirclient）教學全文 |
| `smart-tutorial-ehr-quick-start.md` | 讓 EHR 支援 SMART launch 的 server 端 quick-start 全文 |
| `site-pages/smart_about.txt` | 什麼是 SMART（沿革、核心概念） |
| `site-pages/courses_smart.txt` | SMART 教育專區：開發四步驟、工具與沙盒 |
| `site-pages/smart_listing-process.txt` | 上架 SMART App Gallery（內容都是截圖，僅文字標題） |
| `site-pages/fhir_tool.txt` | FHIR 工具清單 |
| `site-pages/rule-library_cql-service.txt` | CQL / CDS Hooks 測試環境與測試病人 ID |
| `../raw/` | 原始 HTML，供重新解析 |
| `../twcore-ig/` | TW Core IG v1.0.0 完整套件（Profile、ValueSet、範例） |
| `../downloads/` | 原始壓縮檔、IG 離線整站（170 MB）、示範影片（155 MB）。**不在 git 內**，重新下載：`https://twcore.mohw.gov.tw/ig/twcore/{package.tgz,full-ig.zip,examples.json.zip,definitions.json.zip}`、`https://medstandard.mohw.gov.tw/videos/SMART_CQL_DEMO.mp4` |
| `../smart-poc/` | 最小可執行範例（Standalone 與 EHR Launch，僅驗證登入流程） |
| `../smart-vitals-demo/` | **範例產品**：血壓/體重/BMI/心跳趨勢圖，含單元測試與端對端驗證 |

## 開發流程（平台 SMART 教育專區的建議）

1. 選類型：provider 或 patient 導向；行動或網頁；獨立或內嵌於 EHR
2. 驗證：OpenID Connect + OAuth 2.0（授權經由 EHR）
3. 用沙盒測試
4. 部署並上架 App Gallery

## 可用的環境與資源（連結來自站上頁面）

**SMART 規格與測試**
- SMART App Launch：http://hl7.org/fhir/smart-app-launch/app-launch.html
- SMART Backend Services：http://www.hl7.org/fhir/smart-app-launch/backend-services.html
- SMART App Launcher（免註冊）：https://launch.smarthealthit.org/
- SMART Bulk Data Server：https://bulk-data.smarthealthit.org/
- Logica Sandbox：https://sandbox.logicahealth.org/
- App Gallery（官方市集）：https://apps.smarthealthit.org/apps/featured

**測試資料**
- Synthea：https://synthetichealth.github.io/synthea/
- SMART sample-patients：https://github.com/smart-on-fhir/sample-patients

**FHIR Server / 工具**
- HAPI 公開 server：https://hapi.fhir.org/
- Firely：https://server.fire.ly/
- Inferno validator：https://inferno.healthit.gov/validator/
- FHIR validator：https://validator.fhir.org/
- Forge：https://simplifier.net/downloads/forge
- 平台 fhir/tool 頁列的 server：https://113.196.140.139:3003/ （本次連線逾時；建議改用 THAS Sandbox）

**台灣 IG / 標準（來自 `/tw-core-implementation-guide`）**
- TW Core IG：https://twcore.mohw.gov.tw/ig/twcore/
- FHIR Sample Code（Server/Client 範例原始碼）：https://twcore.mohw.gov.tw/twsample
- OpenFHIR：https://openfhir.mohw.gov.tw/
- IG Registry：https://twcore.mohw.gov.tw/twregistry/#/data
- EMR-IG：https://twcore.mohw.gov.tw/ig/emr/
- 電子處方箋 EMPD IG：https://nhicore.nhi.gov.tw/empd/
- 癌症用藥事前審查 PAS IG：https://nhicore.nhi.gov.tw/pas/
- 長照 IG：https://ltc-ig.fhir.tw/
- 傳染病檢驗報告 IG：https://twidir.cdc.gov.tw/twidir/
- 全國專門術語平台：https://fhir.mohw.gov.tw/ts/

**CQL / CDS Hooks（平台 Rule Library）**
- 測試流程與測試病人 ID 見 `site-pages/rule-library_cql-service.txt`
- 範例代碼：17022B、09139C（另有示範影片用 08134B）

## 第二輪補抓（2026-09-24）

### ⭐ THAS 臺灣健康應用空間 https://thas.mohw.gov.tw （真正的 SMART 開發入口）

`medstandard.mohw.gov.tw/smart/*` 是內容鏡像；實際的沙盒、市集、提案在 THAS。存於 `thas/`。

- **Sandbox（實測可用）**：FHIR Server `https://thas.mohw.gov.tw/v/r4/fhir`
  - HAPI FHIR 8.6.0、R4 (4.0.1)、CORS 開啟、資料為 Synthea 合成資料
  - `/.well-known/smart-configuration` 有提供：
    authorize `https://thas.mohw.gov.tw/v/r4/auth/authorize`、token `.../auth/token`、introspect `.../auth/introspect`、jwks `https://thas.mohw.gov.tw/keys`
  - 支援 launch-ehr、launch-standalone、public / confidential(symmetric、asymmetric) client、PKCE(S256)、OIDC、offline_access、permission-v1/v2
  - 頁面上的 EHR Launch 測試：輸入你的 Launch URL 後按「立即測試」，沙盒會開新視窗並帶上 `?iss=…&launch=…`（已實測走通）
  - FAQ 2.5 確認 Standalone 與 EHR Launch 兩種模式都支援
  - 探測結果存於 `thas/probe/`（metadata 約 2.7 MB、各資源筆數 `resource-counts.json`）
  - **實測重點（詳見 `沙盒驗證結果.md`）**：不需註冊 client；Standalone 需手動帶 `launch: "e30"`；`offline_access` 可得 refresh token；`$everything` 可用；**FHIR 伺服器不檢查 scope 與病人範圍，甚至不帶 token 也能讀寫**，所以沙盒測試通過不代表權限設定正確
- **Marketplace**：已上架 115 個 App（medical AI、營運管理、資料視覺化、臨床決策支援），可當設計參考
- **提案流程**：Sandbox 測試 → 填提案表 → 資訊處審查 → 上架。**需登入會員；公開提案預計 2026 年開放**，目前第一波為「臺灣 50」徵案入選產品
- **FAQ**：`thas/faq.md`。與開發相關的重點：TW Core 相容性是必要條件；上架產品須符合 OAuth2.0 + OpenID Connect；串接真實醫院資料須自行與醫院洽談；市集 116 年後轉商業化（付費驗證＋上架費）；上架的醫療 AI 需向「臨床 AI 註冊網頁」註冊並定期回報
- 支援中心：medstandard@itri.org.tw、(02) 8590-6347、LINE @mohw；提問 6 個工作天內回覆
- 站上提到「沙盒教學影片」與「10/14 SMART 工作坊簡報」，但影片與簡報連結在頁面上抓不到（可能需登入或動態載入）

### TW Core IG 完整套件（`twcore-ig/`）

- `package/package/`：FHIR NPM package `tw.gov.mohw.twcore#1.0.0`（FHIR 4.0.1）
  - 99 個 StructureDefinition、129 個 SearchParameter、55 個 ValueSet、30 個 CodeSystem、6 個 ConceptMap、2 個 CapabilityStatement
  - 可直接餵給 HAPI、`fhir` validator、SUSHI 等工具
- `examples/`：98 個 JSON 範例資源
- `definitions/`：全部定義檔（JSON）
- `../downloads/`：原始壓縮檔，另有 `full-ig.zip`（170 MB，離線版整站）與 `SMART_CQL_DEMO.mp4`（155 MB 示範影片）

### FHIR Sample Code（`twsample/`）

`twcore.mohw.gov.tw/twsample`：20 個 TW Core resource 的 Client 範例（PUT/POST/GET/DELETE，Python/Java/C#），加上 5 種 Server 安裝說明（HAPI、Burni、Keycloak、LinuxForHealth、SMART on FHIR dev sandbox）與 Q&A。
- 頁面上的 Json 範例區塊是由 JS 載入而**為空**，請改看 `twcore-ig/examples/`
- 範例預設伺服器是 hapi.fhir.org，且程式碼用 `verify=False`，正式開發不要照抄

### 網路上的其他參考（`external/`）

| 檔案 | 內容 |
|---|---|
| `smart-app-launch-*.md` | HL7 SMART App Launch 規格（v2.2.0）：overview、app-launch、scopes、conformance、backend services |
| `clientjs-docs.md` / `clientjs-client.md` | fhirclient.js 官方文件（`npm i fhirclient`，瀏覽器與 Node 18+） |
| `nhi-pas-smart-scopes.md` | 健保署事前審查 IG 的 SMART 規範：必須支援 Patient Access for Standalone Apps 與 Clinician Access for EHR Launch，後端服務用 backend services，並要求 `/.well-known/smart-configuration` |
| `mohw-blog-smart.md` | 衛福部資訊處長〈台灣 SMART on FHIR 國家級基建〉：THAS 市集的架構與政策脈絡 |

其他值得看但沒抓的連結：
- HL7 CDS Hooks 規格與 CQL 規格：https://cds-hooks.hl7.org 、https://cql.hl7.org
- CDS-Sandbox 教學論文：https://pmc.ncbi.nlm.nih.gov/articles/PMC10283349/
- SMART client-js 原始碼：https://github.com/smart-on-fhir/client-js
- 健保署 IG：https://build.fhir.org/ig/TWNHIFHIR/pas/ 、EMPD：https://nhicore.nhi.gov.tw/empd/

## 需要留意

- 平台頁面是 Next.js SSR，可直接 curl；但**按鈕/圖片內的資訊抓不到**（如「上架流程」的操作步驟只有截圖，「TW APP Gallery」頁是空的，疑似前端動態載入或尚未開放）。
- SMART 官方教學使用 `r3.smarthealthit.org`（STU3）；本次測試 r3、r4 都回 502，可能是暫時性問題，開發時建議改用 launch.smarthealthit.org 或 HAPI。
- ~~平台沒有提供專屬 SMART endpoint~~ → 更正：THAS 有（見上方第二輪補抓）。~~client 註冊方式不明~~ → 已實測：**沙盒不需要註冊 client_id**，`localhost` 可當 redirect_uri。但正式上架的註冊要求仍以提案流程為準。
- 要接台灣實際醫院的 EHR，仍需與各院洽談。
- 影片與 IG 離線版已下載（`downloads/`，共約 340 MB）；若不需要可刪除。
