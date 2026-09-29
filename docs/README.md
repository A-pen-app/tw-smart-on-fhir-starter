# 參考資料索引

> 👋 **第一次來請看專案根目錄的 [`../README.md`](../README.md)**（學習路徑、專案地圖、練習題）。
> 本檔是參考用的索引：平台資訊、本目錄每個檔案的內容、外部連結。

---

## 1. 平台：該去哪裡

| 網站 | 角色 |
|---|---|
| **THAS 臺灣健康應用空間** <https://thas.mohw.gov.tw> | **真正的開發入口**：沙盒、市集、提案都在這裡。頁面存於 `thas/` |
| 臺灣醫療資訊標準大平台 <https://medstandard.mohw.gov.tw/smart/app> | 內容鏡像與教育資源。`/smart/app` 幾乎沒有原創技術內容，只連到 SMART 官方教學與一支示範影片 |

示範影片：以 SMART App 實作 CQL，範例是連續血糖監測（健保 08134B）。<https://medstandard.mohw.gov.tw/videos/SMART_CQL_DEMO.mp4>（155 MB），截圖在 `assets/continuous-glucose-monitoring.png`。

實際的開發依據是 **SMART 官方規格 + TW Core IG + THAS 沙盒**。

---

## 2. THAS 沙盒

| 項目 | 值 |
|---|---|
| FHIR Server | `https://thas.mohw.gov.tw/v/r4/fhir`（HAPI FHIR 8.6.0、R4 4.0.1、CORS 開啟、Synthea 合成資料） |
| 探索文件 | `/.well-known/smart-configuration`（完整內容：`thas/probe/.well-known_smart-configuration.json`） |
| 授權 / Token / Introspect | `https://thas.mohw.gov.tw/v/r4/auth/{authorize,token,introspect}` |
| JWKS | `https://thas.mohw.gov.tw/keys` |
| 支援 | EHR Launch、Standalone Launch、public 與 confidential client、PKCE（S256）、OIDC、`offline_access`、scope v1 與 v2 |
| 測試頁 | <https://thas.mohw.gov.tw/smart/sandbox>：填入 Launch URL，按「立即測試」 |

**實測重點**（證據與細節見 [`沙盒驗證結果.md`](沙盒驗證結果.md)）：

- 不需要註冊 `client_id`，`localhost` 可以當 redirect_uri。正式上架的註冊要求以提案流程為準。
- Standalone 要手動帶 `launch: "e30"`。
- **不檢查 scope 與病人範圍**，甚至不帶 token 也能讀寫。
- 查詢網址沒編碼時會回 0 筆。
- `$everything` 可能夾帶其他病人的資料。

探測結果在 `thas/probe/`：CapabilityStatement（約 2.7 MB）、各資源筆數 `resource-counts.json`。

---

## 3. 上架與市集

- **Marketplace**：已上架 115 個 App，類別有醫療 AI、營運管理、資料視覺化、臨床決策支援，可以當設計參考。
- **提案流程**：Sandbox 測試 → 填提案表 → 資訊處審查 → 上架。
  - 需要登入會員。
  - 公開提案預計 2026 年開放；目前第一波是「臺灣 50」徵案入選的產品。
- **FAQ 重點**（`thas/faq.md`）：
  - TW Core 相容是必要條件。
  - 須符合 OAuth 2.0 + OpenID Connect。
  - 串接真實醫院資料要自己和醫院洽談。
  - 116 年後市集轉為商業營運，會有付費驗證與上架費。
  - 上架的醫療 AI 要到「臨床 AI 註冊網頁」註冊並定期回報。
- **支援中心**：medstandard@itri.org.tw、(02) 8590-6347、LINE @mohw，6 個工作天內回覆。
- 平台建議的開發四步驟（SMART 教育專區）：
  1. 選類型：provider 或 patient 導向、行動或網頁、獨立或內嵌 EHR。
  2. 驗證：OIDC + OAuth 2.0。
  3. 用沙盒測試。
  4. 部署並上架。

---

## 4. 本目錄的檔案

**我們寫的**

| 檔案 | 內容 |
|---|---|
| [`00-入門簡介.md`](00-入門簡介.md) | 給新手的白話簡介：架構圖、實作步驟、名詞小辭典 |
| [`上手指南-開發產品.md`](上手指南-開發產品.md) | 開發產品的 8 個步驟：定義 → 環境 → 最小 App → 資料 → 功能 → 測試 → 部署 → 上架 |
| [`沙盒驗證結果.md`](沙盒驗證結果.md) | 沙盒實測：兩種 Launch、refresh token、寫入、權限檢查、查詢編碼、`$everything` |
| [`可用資料清單.md`](可用資料清單.md) | 沙盒各資源筆數、TW Core 定義的資料、應用類型與資料的對照（看單一病人請用 `../smart-data-explorer/`） |

**從網站抓下來的**（2026-09-24 抓取，原始 HTML 在 `../raw/`）

| 檔案 | 內容 |
|---|---|
| `thas/` | THAS 網站頁面：沙盒、市集、提案、FAQ、支援 |
| `twsample/` | TW Core 官方 FHIR Sample Code：20 個資源的 Client 範例（Python / Java / C#），以及 5 種 Server 的安裝說明（HAPI、Burni、Keycloak、LinuxForHealth、SMART dev sandbox）⚠️ 範例預設連 hapi.fhir.org，並使用 `verify=False`，不要照抄到正式環境。頁面上的 JSON 範例是空的，請改看 `../twcore-ig/examples/` |
| `external/smart-app-launch-*.md` | HL7 SMART App Launch 規格 v2.2.0：overview、app-launch、scopes、conformance、backend services |
| `external/clientjs-*.md` | fhirclient.js 官方文件 |
| `external/nhi-pas-smart-scopes.md` | 健保署事前審查 IG 的 SMART 規範：要支援 Standalone 病人存取與 EHR Launch 臨床存取、後端服務用 backend services、要提供 `/.well-known/smart-configuration` |
| `external/mohw-blog-smart.md` | 衛福部資訊處長〈台灣 SMART on FHIR 國家級基建〉：THAS 的架構與政策脈絡 |
| `external/thas-home.md`、`external/smarthealth-home.md` | THAS 與 SMART Health IT 首頁 |
| `smart-tutorial-javascript.md` | SMART 官方 JS 教學全文（用的是 STU3 的 r3.smarthealthit.org，本專案範例改用 THAS） |
| `smart-tutorial-ehr-quick-start.md` | 讓 EHR 支援 SMART launch 的 server 端教學全文 |
| `site-pages/smart_about.txt` | 什麼是 SMART：沿革與核心概念 |
| `site-pages/courses_smart.txt` | SMART 教育專區：開發四步驟、工具與沙盒 |
| `site-pages/smart_listing-process.txt` | 上架流程（原頁面內容幾乎都是截圖，只抓得到標題） |
| `site-pages/fhir_tool.txt` | FHIR 工具清單 |
| `site-pages/rule-library_cql-service.txt` | CQL / CDS Hooks 測試環境與測試病人 ID（範例代碼 17022B、09139C） |

**專案其他位置**

| 路徑 | 內容 |
|---|---|
| `../twcore-ig/` | TW Core IG v1.0.0：官方套件與 98 個範例，見該目錄的 README |
| `../downloads/` | **不在 git 內。** IG 離線整站 `full-ig.zip`（170 MB）、示範影片（155 MB）、原始壓縮檔。重新下載：`https://twcore.mohw.gov.tw/ig/twcore/{package.tgz,full-ig.zip,examples.json.zip,definitions.json.zip}`、`https://medstandard.mohw.gov.tw/videos/SMART_CQL_DEMO.mp4` |
| `../raw/` | 爬取的原始 HTML，要重新解析時才用得到 |

---

## 5. 外部連結

**SMART 規格與測試**
- SMART App Launch：<https://hl7.org/fhir/smart-app-launch/app-launch.html>
- SMART Backend Services：<https://hl7.org/fhir/smart-app-launch/backend-services.html>
- SMART App Launcher（免註冊的另一個沙盒）：<https://launch.smarthealthit.org/>
- SMART Bulk Data Server：<https://bulk-data.smarthealthit.org/>
- Logica Sandbox：<https://sandbox.logicahealth.org/>
- SMART App Gallery：<https://apps.smarthealthit.org/apps/featured>
- fhirclient.js 原始碼：<https://github.com/smart-on-fhir/client-js>

**台灣 IG 與標準**
- TW Core IG：<https://twcore.mohw.gov.tw/ig/twcore/>
- FHIR Sample Code：<https://twcore.mohw.gov.tw/twsample>
- IG Registry：<https://twcore.mohw.gov.tw/twregistry/#/data>
- EMR-IG：<https://twcore.mohw.gov.tw/ig/emr/>
- 電子處方箋 EMPD IG：<https://nhicore.nhi.gov.tw/empd/>
- 癌症用藥事前審查 PAS IG：<https://nhicore.nhi.gov.tw/pas/>（開發版 <https://build.fhir.org/ig/TWNHIFHIR/pas/>）
- 長照 IG：<https://ltc-ig.fhir.tw/>
- 傳染病檢驗報告 IG：<https://twidir.cdc.gov.tw/twidir/>（沙盒裡 `TWIDIR` 開頭的病人疑似來自這裡）
- 全國專門術語平台：<https://fhir.mohw.gov.tw/ts/>
- OpenFHIR：<https://openfhir.mohw.gov.tw/>

**FHIR 伺服器與工具**
- FHIR validator：<https://validator.fhir.org/>
- Inferno validator：<https://inferno.healthit.gov/validator/>
- HAPI 公開 server：<https://hapi.fhir.org/>
- Firely：<https://server.fire.ly/>
- Forge：<https://simplifier.net/downloads/forge>

**測試資料**
- Synthea：<https://synthetichealth.github.io/synthea/>
- SMART sample-patients：<https://github.com/smart-on-fhir/sample-patients>

**CQL / CDS Hooks**
- CDS Hooks：<https://cds-hooks.hl7.org>
- CQL：<https://cql.hl7.org>
- CDS-Sandbox 教學論文：<https://pmc.ncbi.nlm.nih.gov/articles/PMC10283349/>

---

## 6. 抓取時的限制（2026-09-24）

- 平台頁面是 Next.js SSR，可以直接 curl；但**圖片與按鈕裡的內容抓不到**。例如「上架流程」只有截圖，「TW APP Gallery」頁是空的。
- 站上提到「沙盒教學影片」與「10/14 SMART 工作坊簡報」，但頁面上找不到連結（可能要登入或是動態載入）。
- 平台 fhir/tool 頁列出的 server `https://113.196.140.139:3003/` 連線逾時；請改用 THAS 沙盒。
- SMART 官方教學用的 `r3.smarthealthit.org` 與 `r4.smarthealthit.org` 當時都回 502。
