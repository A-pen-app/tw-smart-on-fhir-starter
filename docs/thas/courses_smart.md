> 來源: https://thas.mohw.gov.tw/courses/smart

聯邦學習媒合平台

# SMART 教育專區

首頁

什麼是 SMART

SMART 教育專區

SMART APP 開發與工具
APP開發說明
上架流程範例
SMART 課程影片

### SMART APP 開發與工具
Step 1 : 選擇應用程式類型
面向提供者或患者的應用程式。
行動應用程式。
網路應用程式。
在現有的臨床應用程式中運行或是作為獨立的應用程式運行。

Step 2 : 使用者安全性驗證 
導入OpenID、OAuth 2.0，用以確保提供者可以在整合應用程式之間切換，而毋需每次都輸入其憑證。 也不需要在第三方解決方案中輸入密碼，因為授權是透過他們的EHR系統進行的。系統擁有者可以在EHR系統中定義不同使用者的權限和存取等級。常規符合 HIPAA 的應用程式開發（包括資料加密、安全連線的使用等）也適用於此。

Step 3 : 使用SMART沙盒進行測試 
由於醫療保健資料的多樣性質，測試醫療保健應用程式非常具有挑戰性。 對於所有SMART on FHIR的開發者，建議使用 SMART 沙盒來測試應用程式的功能。Epic 等 EHR 供應商也提供單獨的沙盒，透過使用其EHR系統測試開發者的產品。

Step 4 : 部署並新增至應用程式市集 
應用程式測試後，即可部署到伺服器或透過行動商店供醫生或患者使用。應用程式庫類似於行動商店，提供有關應用程式描述、要求和測試應用程式的相關資訊。

開發工具:
SMART 應用程式啟動 : 連接到 EHR 和健康管理入口，面向使用者的應用程式。
http://hl7.org/fhir/smart-app-launch/app-launch.html
SMART 後端服務：伺服器到伺服器的 FHIR 連接。
http://www.hl7.org/fhir/smart-app-launch/backend-services.html

測試環境:
SMART App Launcher （無需註冊）：SMART 應用程式開發人員工具
https://launch.smarthealthit.org/

SMART Bulk Data Server（無需註冊）：Bulk Data 用戶端開發人員工具
https://bulk-data.smarthealthit.org/

Logica Health Sandbox
https://sandbox.logicahealth.org/

資料生成:
Synthea：開源合成 FHIR 資料生成器
https://synthetichealth.github.io/synthea/

SMART 測試數據：使用 Python 對 60 條去標識化記錄，用於從 CSV 生成 FHIR
https://github.com/smart-on-fhir/sample-patients

(圖片來源：工研院整理製作)

(圖片來源：工研院整理製作)

### APP開發說明
基於瀏覽器的應用程式入門
如何建立藉由瀏覽器啟動的簡單SMART應用程式教學。
基於瀏覽器的應用程式入門

EHR 中執行 SMART APP 入門
針對支援可外掛 SMART on FHIR 應用程式的醫療IT系統。本教學將引導使用者完成如何建構基本的 SMART on FHIR 伺服器，用以支援使用者在 EHR 中執行 SMART APP。
EHR 中執行 SMART APP 入門

SMART APP 示範影片
本範例以 SMART APP 實現 CQL，並以連續血糖監測(08134B)為應用展示。

(圖片來源：工研院整理製作)

### 上架流程範例
上架 SMART App Gallery
以下將說明如何將開發好的SMART APP上架至官方市集(SMART App Gallery)。
https://apps.smarthealthit.org/apps/featured

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

(圖片來源：原始出處為SMART Gallery網站，經工研院整理截圖)

### SMART 課程影片
想更深入認識 SMART 嗎？您可前往「臺灣智慧醫療學校」的「研討會專區」，瀏覽相關課程影片，無須註冊即可直接觀看。

前往臺灣智慧醫療學校

臺灣健康應用空間

最新消息
簡介與沿革成立背景部長的話次長的話處長的話

SMART 介紹什麼是 SMARTSMART 教育專區

Marketplace
Sandbox
歷年活動國際研討會暨頒獎典禮

支援中心
計畫網站臺灣醫療資訊標準大平台臺灣健康資料空間臺灣健康規則空間臺灣健康應用空間SNOMED CTLOINCRxNorm臺灣智慧醫療學校臺灣智慧醫療三大中心全國臨床AI應用登錄平台全球醫療AI聯邦學習媒合平台

：(02) 8590-6347

：medstandard@itri.org.tw

：115204 台北市南港區忠孝東路6段488號

