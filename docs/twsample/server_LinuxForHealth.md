> 來源: https://twcore.mohw.gov.tw/twsample



FHIR Sample Code

FHIR Sample Code

FHIR Client

FHIR Server

問答專區

## LinuxForHealth FHIR

#### Server 架設

1. 準備一台Linux環境的電腦(或虛擬機)

1-1. 準備一台Linux環境的電腦(或虛擬機)，並且進入Linux環境中。

2. 安裝LinuxForHealth FHIR Server

2-1. 安裝docker。

```
sudo snap install docker
```

2-2. 下載LinuxForHealth FHIR server專案，並進入下載後的資料夾。 (若無法下載專案可點選下載2024/1/30前的版本)

```
git clone https://github.com/LinuxForHealth/FHIR.git
cd FHIR
```

2-3. 執行專案。

```
sudo docker run -d -p 9443:9443 -e BOOTSTRAP_DB=true ghcr.io/linuxforhealth/fhir-server
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

