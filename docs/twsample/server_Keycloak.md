> 來源: https://twcore.mohw.gov.tw/twsample



FHIR Sample Code

FHIR Sample Code

FHIR Client

FHIR Server

問答專區

## Keycloak

#### Server 架設

1. 準備一台Windows環境的電腦(或虛擬機)

1-1. 準備一台Windows環境的電腦(或虛擬機)，並且進入Windows環境中。

2. 安裝docker(如果第三步驟需要使用docker來安裝keycloak，則需先安裝docker，若不需要則這部可以省略)

2-1. https://docs.docker.com/desktop/install/windows-install/下載並安裝docker。

2-2. 在Windows的「開啟或關閉Windows功能」中，安裝Hyper-V。

3. 安裝Keycloak

Docker方式

安裝檔

3-1. https://docs.docker.com/desktop/install/windows-install/下載並安裝docker。

```
docker run -d -p 8080:8080 -p 8443:8443 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin alvearie/smart-keycloak
```

3-2. 開啟http://localhost:8080/並已預設的admin帳號密碼登入(admin:admin)。

3-1. https://www.keycloak.org/downloads下載Keycloak。 (若無法下載專案可點選下載2024/1/30前的版本)

3-2. 進入到Keycloak下載檔中，並開啟「命令提示字元」後執行下列指令。

```
bin\kc.bat start-dev
```

3-3. 開啟http://localhost:8080/並建立admin帳號密碼。

3-4. 登入admin。

4. 配置Keycloak

4-1. 新增一個Realms。

4-2. 新增一個Clients。

4-3. 將Access Type改為confidential，並開啟所有認證方式。

4-4. 若設定頁面出現Credentials分頁，表示設定成功，可以到Credentials分頁中取得Client Secret。

5. 修改HAPI FHIR的設定

5-1. 「hapi-fhir-jpaserver-starter-master/pom.xml」檔案中新增keycloak設定：

```
<dependency>
    <groupId>org.smartregister</groupId>
    <artifactId>hapi-fhir-keycloak</artifactId>
    <version>0.0.7-SNAPSHOT</version>
</dependency>
```

5-2. 新增連接至Keycloak的設定，開啟「hapi-fhir-jpaserver-starter-master/src/main/resources/application.yaml」在最底下新增以下程式：

```
keycloak:
  auth-server-url: http://localhost:8080/auth/
  realm: <Realm名稱>
  resource: <Clients名稱>
  credentials:
    secret: <剛剛複製的Secret>
  ssl-required: none
```

6. 重新啟動FHIR Server

6-1. 若HAPI與Keycloak架在同台機器上，可能會導致port衝突，可以另外將HAPI以其他port執行(修改「hapi-fhir-jpaserver-starter-master/src/main/resources/application.yaml」中的port號)。

6-2. 刪除「hapi-fhir-jpaserver-starter-master/target」暫存資料夾，若未刪除可能會保留原本的設定而無法正常執行。

6-3. 開始執行HAPI FHIR Server

```
mvn -Pjetty -Djetty.port=<與設定檔中一樣的port> jetty:run
```

圖文版教學手冊

(若使用手機板可能無法顯示，可點擊此開啟教學手冊)

#### 設定帳號密碼

1. 新增使用者

1-1. 新增使用者帳號

1-2. 設定使用者預設密碼。

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

