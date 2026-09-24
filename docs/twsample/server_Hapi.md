> 來源: https://twcore.mohw.gov.tw/twsample



FHIR Sample Code

FHIR Sample Code

FHIR Client

FHIR Server

問答專區

## HAPI FHIR

#### Server 架設

#### Linux

#### Windows

1. 準備一台Linux環境的電腦(或虛擬機)

1-1. 準備一台Linux環境的電腦(或虛擬機)，並且進入Linux環境中。

2. 安裝HAPI FHIR Server

2-1. 安裝docker。

```
sudo snap install docker
```

2-2. 下載HAPI FHIR專案。 (若無法下載專案可點選下載2024/1/30前的版本)

```
git clone https://github.com/hapifhir/hapi-fhir-jpaserver-starter.git
```

2-3. 將原本docker-compose.yml檔案中的東西刪除，並改成使用docker配置的相關資訊，以下為完整內容。

```
version: '3.7'

services:
  fhir:
    container_name: fhir
    image: "hapiproject/hapi:latest"
    ports:
      - "8080:8080"
    configs:
      - source: hapi
        target: /app/config/application.yaml
    depends_on:
      - db

  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: admin
      POSTGRES_USER: admin
      POSTGRES_DB: hapi
    volumes:
      - ./hapi.postgress.data:/var/lib/postgresql/data

configs:
  hapi:
     file: ./hapi.application.yaml
```

2-4. 修改hapi.application.yaml 檔案中的資訊，以下為完整內容。

```
spring:
  datasource:
    url: 'jdbc:postgresql://db:5432/hapi'
    username: admin
    password: admin
    driverClassName: org.postgresql.Driver
  jpa:
    properties:
      hibernate.dialect: ca.uhn.fhir.jpa.model.dialect.HapiFhirPostgres94Dialect
      hibernate.search.enabled: false
```

2-5. 啟動 Docker Compose 專案。

```
sudo docker-compose up -d
```

3. 更換Logo

3-1. 先刪除原本的照片

```
rm hapi-fhir-jpaserver-starter/src/main/webapp/img/sample-logo.jpg
```

3-2. 將照片傳至Linux伺服器中(此步驟在不同Linux版本可能會有所不同)

3-3. 重新建立Image映像檔，先查看目前的Hapi Image名稱

```
sudo docker image ls
```

3-3. 刪除Hapi Image

```
sudo docker image rm hapi-fhir/hapi-fhir-jpaserver-starter
```

(若此步驟無法執行，可能是因為有容器使用了此Image，因此可以先將使用到的刪除)

```
sudo docker ps -a #查看所有容器
sudo docker stop <容器ID> #暫停容器
sudo docker rm <容器ID> #刪除容器
```

3-4. 建立新的Image

```
sudo docker build --no-cache -t hapi-fhir/hapi-fhir-jpaserver-starter .
sudo docker run -p8080:8080 -d --name Hsu_Lab_Hapi <新的Image ID>
```

圖文版教學手冊

(若使用手機板可能無法顯示，可點擊此開啟教學手冊)

示範網址

https://HAPI.standard-interoperability-lab.com

1. 準備一台Windows環境的電腦(或虛擬機)

1-1. 準備一台Windows環境的電腦(或虛擬機)，並且進入Windows環境中。

2. 連線Windows遠端桌面(若使用本機則可以省略本步驟)

2-1. 開啟遠端桌面輸入要連線的主機ip，並且輸入使用者帳號及密碼。

3. Windows開啟防火牆

3-1. 開啟「Windows Defender 防火牆」，並開啟「8080」port的授權規則。

4. 安裝jdk 17版本

4-1. 至「https://www.oracle.com/java/technologies/downloads/#jdk17-windows」下載並安裝符合電腦規格的jdk。
(若無法下載檔案可點選下載2024/1/30前的版本)

4-2. 新增環境變數「JAVA_HOME」，並指向jdk安裝的位置。

4-3. 編輯環境變數「PATH」，並指向jdk安裝的位置底下的/bin資料夾。

5. 安裝Maven

5-1. 至「https://maven.apache.org/download.cgi?.」下載符合電腦規格的Maven，並將下載的檔案解壓縮後，放在易於管理的路徑位置(不用安裝)。
(若無法下載檔案可點選下載2024/1/30前的版本)

5-2. 編輯環境變數「PATH」，並指向Maven資料夾底下的/bin資料夾。

6. 安裝PostgetSQL

6-1. 至「https://www.enterprisedb.com/downloads/postgres-postgresql-downloads」下載並安裝符合電腦規格的PostgetSQL。
(若無法下載檔案可點選下載2024/1/30前的版本)

6-2. 新增一個儲存HAPI FHIR 資料的資料庫。

7. 安裝HAPI FHIR starter

7-1. 至「https://github.com/hapifhir/hapi-fhir-jpaserver-starter」下載壓縮檔並解壓縮後放在易於管理的路徑位置(不用安裝)。 (若無法下載專案可點選下載2024/1/30前的版本)

7-2. 找到解壓縮後資料夾中的「/src/main/resources/application.yaml」，並修改spring中datasource及jpa的內容，修改內容如下(詳細內容可至圖文版教學手冊中察看)：

```
spring:
  datasource:
    url: 'jdbc:postgresql://localhost:5432/hapi' # hapi需改為6-2.中新增的資料庫名稱
    username: postgres # 需改為設定的使用者名稱
    password: password # 需改為設定的密碼
    driverClassName: org.postgresql.Driver
  jpa:
    properties:
      hibernate.dialect: ca.uhn.fhir.jpa.model.dialect.HapiFhirPostgres94Dialect
      hibernate.search.enabled: false
```

7-3. 在HAPI FHIR starter的資料夾中開啟「命令提示字元」，並輸入指令開始執行HAPI FHIR(命令提示字元不能關掉，否則無法連線)。

```
mvn -Pjetty jetty:run
```

8. 更換Logo

8-1. 將「src/main/webapp/img/」資料夾中的「sample-logo.jpg」替換成想要的照片。

8-2. 重新執行7-3步驟。

圖文版教學手冊

(若使用手機板可能無法顯示，可點擊此開啟教學手冊)

示範網址

https://HAPI.standard-interoperability-lab.com

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

