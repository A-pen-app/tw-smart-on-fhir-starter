# 臺灣 SMART on FHIR 開發入門（THAS 沙盒）

這個專案整理了在衛福部 **THAS 臺灣健康應用空間** 上開發 SMART on FHIR App 需要的資料、實測結果與可執行範例。
目標：讓新成員在**一週內**做出第一個能讀病人資料的 App。

> 不需要註冊帳號、不需要金鑰、不需要安裝套件。只要瀏覽器與 Python 3（或 Node 18+）。

---

## 線上版（不用安裝）

**<https://a-pen-app.github.io/tw-smart-on-fhir-starter/>**：三個 App 都已部署，打開就能用。每次 push 到 `main`，`.github/workflows/pages.yml` 會自動重新部署。

| App | Standalone | EHR Launch URL（貼到 [沙盒測試頁](https://thas.mohw.gov.tw/smart/sandbox)） |
|---|---|---|
| 資料瀏覽器 | [開啟](https://a-pen-app.github.io/tw-smart-on-fhir-starter/smart-data-explorer/launch.html) | `https://a-pen-app.github.io/tw-smart-on-fhir-starter/smart-data-explorer/ehr-launch.html` |
| 生命徵象趨勢圖 | [開啟](https://a-pen-app.github.io/tw-smart-on-fhir-starter/smart-vitals-demo/launch.html) | `https://a-pen-app.github.io/tw-smart-on-fhir-starter/smart-vitals-demo/ehr-launch.html` |
| 最小範例 | [開啟](https://a-pen-app.github.io/tw-smart-on-fhir-starter/smart-poc/launch.html) | `https://a-pen-app.github.io/tw-smart-on-fhir-starter/smart-poc/ehr-launch.html` |

✅ 已實測：THAS 沙盒接受公開的 HTTPS redirect_uri，不需要事先登記，所以部署到任何 HTTPS 靜態網站都能直接使用。

## 5 分鐘先看到東西（本機）

```bash
cd smart-data-explorer
python3 -m http.server 8091
```

打開 <http://localhost:8091/launch.html>，選任一位醫師並按 Login，搜尋 `Portillo`，點第一筆。
你會看到這位病人在伺服器上的**所有資料**：共 15 類 250 筆，每一類都附上取得資料的程式碼與原始 JSON。

---

## 學習路徑

| 階段 | 做什麼 | 讀什麼 | 完成標準 |
|---|---|---|---|
| **第 1 小時：懂概念** | 跑 `smart-poc/` | [`docs/00-入門簡介.md`](docs/00-入門簡介.md) | 能說出 App、授權伺服器、FHIR 伺服器各做什麼 |
| **半天：懂資料** | 跑 `smart-data-explorer/`，換不同病人看看 | [`docs/可用資料清單.md`](docs/可用資料清單.md)、[`docs/沙盒驗證結果.md`](docs/沙盒驗證結果.md) | 知道自己的點子需要哪些 Resource、沙盒裡有沒有這些資料 |
| **第 1～2 天：懂產品結構** | 跑 `smart-vitals-demo/` 與它的測試，完成下方練習 1～3 | [`docs/上手指南-開發產品.md`](docs/上手指南-開發產品.md) ①～⑥ | 能在範例裡加一張新的卡片 |
| **第 1 週：做自己的 App** | 複製 `smart-vitals-demo/` 當起點（見下方） | 上手指南 ⑥～⑧ | 自己的 App 在沙盒上用 Standalone 與 EHR Launch 都能執行 |

---

## 專案地圖

| 路徑 | 是什麼 | 什麼時候用 |
|---|---|---|
| [`smart-poc/`](smart-poc/) | 最小範例：3 個 HTML 檔，只驗證登入並取得 token | 第一次理解流程；實驗 scope（`launch.html?scope=...`） |
| [`smart-data-explorer/`](smart-data-explorer/) | **資料瀏覽器**：列出一位病人所有拿得到的資料、取得方式、代碼系統、欄位覆蓋率 | 規劃功能前確認資料在不在、長怎樣；匯出測試資料 |
| [`smart-vitals-demo/`](smart-vitals-demo/) | **範例產品**：血壓、體重、BMI、心跳趨勢圖，分層架構加上單元與端對端測試 | 新 App 的起點模板 |
| [`docs/`](docs/) | 教學與實測文件（見下表） | 隨時查 |
| [`twcore-ig/`](twcore-ig/) | TW Core IG v1.0.0 完整套件：Profile、ValueSet、98 個範例資源 | 確認台灣格式；用 `examples/` 測試 App 能否讀懂台灣資料 |
| `raw/` | 爬取的原始 HTML | 通常不用看 |

**`docs/` 內的文件**

| 文件 | 內容 |
|---|---|
| [`00-入門簡介.md`](docs/00-入門簡介.md) | 白話概念、架構圖、名詞小辭典 |
| [`上手指南-開發產品.md`](docs/上手指南-開發產品.md) | 從定義產品到上架的 8 個步驟，每步都有完成標準 |
| [`可用資料清單.md`](docs/可用資料清單.md) | 沙盒各資源筆數、TW Core 定義的資料、應用類型與資料的對照 |
| [`沙盒驗證結果.md`](docs/沙盒驗證結果.md) | 實測紀錄：什麼可以、什麼不行、有哪些坑 |
| [`docs/README.md`](docs/README.md) | 所有爬取資料的完整索引與外部連結 |

---

## 開一個新 App

```bash
cp -r smart-vitals-demo my-app
cd my-app
```

1. **`src/config.js`**：改 `CLIENT_ID`，把 `READ_SCOPES` 改成你**實際用到**的資源，並設定要查的代碼。
2. **`src/fhir.js`**：寫查詢。所有對伺服器的呼叫都放在這個檔案。
3. **`src/logic.js`**：把 FHIR 資源轉成你自己的簡單資料格式，並在 `test/` 寫單元測試。
4. **`src/ui.js`、`src/main.js`**：做畫面。載入中、沒有資料、出錯三種狀態都要處理。
5. 驗證：`node --test test/`，接著用 `python3 test/e2e.py` 跑 Standalone 與 EHR Launch。

先用 `smart-data-explorer` 找到你要的資料和它的代碼，再開始寫查詢。

---

## 動手練習

| # | 練習 | 提示 | 預期結果 |
|---|---|---|---|
| 1 | 用 explorer 打開病人 3539，找出 Condition 用的是哪個代碼系統 | 展開 Condition，看「用到的代碼系統」 | SNOMED CT。沙盒資料是美式的 Synthea，不是 TW Core 代碼 |
| 2 | 用 explorer 搜尋 `TWIDIR` 的病人，觀察紅色的警告區塊 | 讀 `smart-data-explorer/README.md` | 理解為什麼 `$everything` 的結果一定要依病人過濾 |
| 3 | 在 `smart-vitals-demo` 加一張「總膽固醇」卡片 | LOINC `2093-3`；改 `config.js` 的 `CODES` 與 `main.js` 各一行 | 病人 3539 顯示 3 筆資料 |
| 4 | 用 `http://localhost:8080/launch.html?scope=launch/patient%20patient/Patient.read%20openid%20fhirUser` 登入 `smart-poc`（token 裡沒有 Observation 權限），再到 console 讀取 Observation | `c = await FHIR.oauth2.ready(); await c.request("Observation?patient=" + c.patient.id + "&_summary=count")` | 讀得到（99 筆）。這表示沙盒通過不代表權限設定正確 |
| 5 | 複製 `smart-vitals-demo`，做一個 HbA1c 趨勢圖 | LOINC `4548-4`；病人 4896（搜尋 `Klocko`） | 55 筆資料畫成一條線 |
| 6 | 用 `curl` 查病人 3539 的總膽固醇，分別試編碼與不編碼的網址 | 見 `沙盒驗證結果.md`「查詢網址要編碼」 | 沒編碼的是 0 筆，編碼後是 3 筆 |

---

## 一定要知道的 6 件事

1. **Standalone 啟動要帶 `launch: "e30"`**，否則授權端點回 400（沙盒特有）。
2. **沙盒完全不檢查權限。** 不帶 token 也能讀寫、也能讀別的病人。所以沙盒通過不代表 scope 設定正確，要自己遵守最小權限。
3. **分頁要加 `pageLimit: 0`。** 只寫 `flat: true` 只會拿到第一頁。
4. **查詢網址要編碼。** `code=http://loinc.org|…` 沒編碼時會回 0 筆且不報錯。在 App 裡用 `client.patient.request` 就會自動編碼。
5. **`$everything` 可能夾帶其他病人的資料**，一定要依 subject 過濾。
6. **沙盒是美式合成資料**，不等於 TW Core。台灣格式請用 `twcore-ig/examples/` 測試。

細節與證據見 [`docs/沙盒驗證結果.md`](docs/沙盒驗證結果.md)。

---

## 測試指令

在專案根目錄執行（不需要 `npm install`，沒有任何相依套件）：

| 指令 | 做什麼 |
|---|---|
| `npm test` | 兩個範例的單元測試 |
| `npm run serve:vitals` / `serve:explorer` / `serve:poc` | 啟動本機伺服器（port 8090 / 8091 / 8080） |
| `npm run e2e:vitals` / `e2e:explorer` | 端對端測試（先啟動對應的 server；需要 Playwright） |

端對端測試可以加 `--browser=firefox` 或 `--browser=webkit`。加 `--app=https://a-pen-app.github.io/tw-smart-on-fhir-starter/smart-vitals-demo` 則是測線上版。詳見各範例的 README。
Playwright 安裝：`pip install playwright && python3 -m playwright install chromium firefox webkit`

**CI：** `.github/workflows/test.yml` 在每次 push 時跑單元測試。端對端測試會連到公開的共用沙盒，所以只在 GitHub Actions 頁面手動執行時才跑（勾選 `e2e`），會用三種瀏覽器各跑一次。

---

## 常用連結

| 用途 | 網址 |
|---|---|
| 沙盒 FHIR | `https://thas.mohw.gov.tw/v/r4/fhir` |
| 沙盒測試頁（EHR Launch） | <https://thas.mohw.gov.tw/smart/sandbox> |
| TW Core IG | <https://twcore.mohw.gov.tw/ig/twcore/> |
| SMART App Launch 規格 | <https://hl7.org/fhir/smart-app-launch/> |
| fhirclient.js 文件 | <http://docs.smarthealthit.org/client-js/> |
| 支援中心 | medstandard@itri.org.tw、(02) 8590-6347 |

`downloads/`（約 340 MB 的 IG 離線版與示範影片）不在 git 內，重新下載的網址見 [`docs/README.md`](docs/README.md)。
