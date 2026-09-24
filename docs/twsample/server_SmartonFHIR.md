> 來源: https://twcore.mohw.gov.tw/twsample



FHIR Sample Code

FHIR Sample Code

FHIR Client

FHIR Server

問答專區

## Smart on FHIR

#### Server 架設

1. 準備一台Linux環境的電腦(或虛擬機)

1-1. 準備一台Linux環境的電腦(或虛擬機)，並且進入Linux環境中。

2. 安裝Smart on FHIR Server

2-1. 安裝docker。

```
sudo snap install docker
```

2-2. 下載Smart on FHIR專案。 (若無法下載專案可點選下載2024/1/30前的版本)

```
git clone git clone https://github.com/smart-on-fhir/smart-dev-sandbox.git
```

2-3. 修改/smart-dev-sandbox資料夾中的.env檔案，並把localhost改為架設的ip位置。

2-4. 修改docker-compose.yml檔案。

2-4-1. 首先找到以下這段，將紅色的\刪除。

```
command: ["sh", "-c", "
    envsubst  \/usr/share/nginx/html/config/r2-local.json5 &&
    envsubst  \/usr/share/nginx/html/config/r3-local.json5 &&
    envsubst  \/usr/share/nginx/html/config/r4-local.json5 &&
    nginx -g 'daemon off;'"]
```

2-4-2. 接著在同個檔案中尋找以下這段，一樣將紅字部分刪除，這裡R4重複出現可能會造成執行錯誤，務必刪除。

```
environment:
    HOST                   : "${HOST}"
    R2_PORT                : "${R2_PORT}"
    R4_PORT                : "${R4_PORT}"
    R3_PORT                : "${R3_PORT}"
    R4_PORT                : "${R4_PORT}"
    PATIENT_BROWSER_PORT   : "${PATIENT_BROWSER_PORT}"
    FHIR_VIEWER_PORT       : "${FHIR_VIEWER_PORT}"
    LAUNCHER_PORT          : "${LAUNCHER_PORT}"
    R2_ENABLED             : "${R2_ENABLED}"
    R3_ENABLED             : "${R3_ENABLED}"
    R4_ENABLED             : "${R4_ENABLED}"
    PATIENT_BROWSER_ENABLED: "${PATIENT_BROWSER_ENABLED}"
    FHIR_VIEWER_ENABLED    : "${FHIR_VIEWER_ENABLED}"
    LAUNCHER_ENABLED       : "${LAUNCHER_ENABLED}"
```

2-5. 啟動 Docker Compose 專案。

```
sudo docker-compose up -d
```

圖文版教學手冊

(若使用手機板可能無法顯示，可點擊此開啟教學手冊)

本網站架設FHIR Server部分資訊來自各個FHIR Server建立的github資源，包含：

HAPI FHIR
、

Smart on FHIR
、

LinuxForHealth FHIR Server
、

Burni FHIR Server

本網站已根據 Apache 2.0 License取得授權

© 
Apache License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

