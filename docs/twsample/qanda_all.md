> 來源: https://twcore.mohw.gov.tw/twsample



FHIR Sample Code

FHIR Sample Code

FHIR Client

FHIR Server

問答專區

## 所有問題

許鐘元

#### 
Keycloak及HAPI FHIR 的LINUX版本及Windows版本有無限制

Keycloak及HAPI FHIR 的LINUX版本及Windows版本有無限制,類似Windows2025 & Redhat Linux任何版本都能嗎?

0

2026/2/5 下午 05:19:16

Kim Huang

#### 
範例問題

應修正為：
import requests
import json
server_url = 'https://hapi.fhir.org/baseR4/' 

SearchCode = "" #可填入想要搜尋的參數，若為空則搜尋整個Condition
access_token = requests.get(server_url+"Condition" + SearchCode, verify=False)
RequestResult = json.loads(str(access_token.text))
print(RequestResult)
否則網址是錯的

0

2025/7/4 上午 11:05:32

Jessie

#### 
twCore IG 0.3.2版本的範例測試 FHIR 臺灣公開測試伺服器(https://twcore.hapi.fhir.tw/) 錯誤訊息

twCore IG 0.3.2版本下example資料夾內的所有json 使用POST 送到FHIR 臺灣公開測試伺服器，有幾筆回傳httpStatusCode 422想請教~

這筆Procedure-pro-example.json 回傳error等級的錯誤訊息如下
1. "Unable to validate code https://twcore.mohw.gov.tw/ig/twcore/CodeSystem/icd-10-pcs-2021-tw#BU46ZZZ - Code is not found in CodeSystem: https://twcore.mohw.gov.tw/ig/twcore/CodeSystem/icd-10-pcs-2021-tw for 'https://twcore.mohw.gov.tw/ig/twcore/CodeSystem/icd-10-pcs-2021-tw#BU46ZZZ'", 
2. "Unable to validate code http://snomed.info/sct#9258009 - Code is not found in CodeSystem: http://snomed.info/sct for 'http://snomed.info/sct#9258009'"

想請問這樣打到公開測試伺服器不過是正常的嗎?

0

2025/6/5 下午 04:54:44

黃聖哲

#### 
windows hapi fhir 安裝問題

你好
我目前是使用windows環境安裝hapi fhir
到遇到幾點問題
1.JDK 目線可以下載倒的版本是21但文件是寫17，請問版本會影響嗎？
2.我使用 JDK 21 照步驟繼續安裝，到mvn -Pjetty jetty:run執行完之後出現以下錯誤
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  15.578 s
[INFO] Finished at: 2025-01-22T07:35:54+08:00
[INFO] ------------------------------------------------------------------------
[ERROR] No plugin found for prefix 'jetty' in the current project and in the plugin groups [org.apache.maven.plugins, org.codehaus.mojo] available from the repositories [local (C:\Users\Administrator\.m2\repository), central (https://repo.maven.apache.org/maven2)] -> [Help 1]
[ERROR]
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR]
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/NoPluginFoundForPrefixException
不知道我有少做什麼步驟，或是哪個環節出錯嗎，謝謝！

1

2025/1/22 上午 07:37:10

eric

#### 
keycloak沒有生效

您好!
依伺服器安裝說明以Linux docker安裝HAPI FHIR Server，也在pom.xml及application.yaml調整了搭配keycloak要做的設定。但HAPI FHIR Server執行後，用Postman測試新增一個Patient，在Authorization設定No Auth即可上傳成功。
似乎keycloak沒有發揮作用。想請教可能是哪裡的問題? 謝謝。

1

2024/12/17 下午 10:13:22

小河

#### 
FHIR版本

FHIR是甚麼版本

2

2024/4/8 下午 04:46:31

