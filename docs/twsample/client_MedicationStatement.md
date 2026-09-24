> 來源: https://twcore.mohw.gov.tw/twsample



FHIR Sample Code

FHIR Sample Code

FHIR Client

FHIR Server

問答專區

## MedicationStatement

共用參數

名稱

Value

伺服器網址

https://hapi.fhir.org/baseR4/ (此為範例網址，可替代為自己的 FHIR 伺服器網址)

請求方式

方法

用途

PUT

用於新增及更新FHIR資源

POST

用於新增FHIR資源

GET

用於取得及查詢FHIR資源

DELETE

用於刪除FHIR資源

MedicationStatement 查詢參數

Name

Type

Description

Sample

_id

token

Standard Parameters

[伺服器網址]/MedicationStatement?_id=[id]

[伺服器網址]/MedicationStatement/[id]

category

token

Returns statements of this category of medicationstatement

[伺服器網址]/MedicationStatement?category=[code]

code

token

Return statements of this medication code

[伺服器網址]/MedicationStatement?code=[code]

context

reference

Returns statements for a specific context (episode or episode of Care).

[伺服器網址]/MedicationStatement?context={Type/}[id]

effective

date

Date when patient was taking (or not taking) the medication

[伺服器網址]/MedicationStatement?effective={gt|lt|ge|le}[date]

identifier

token

Return statements with this external identifier

[伺服器網址]/MedicationStatement?identifier=[code]

medication

reference

Return statements of this medication reference

[伺服器網址]/MedicationStatement?medication={Type/}[id]

part-of

reference

Returns statements that are part of another event.

[伺服器網址]/MedicationStatement?part-of={Type/}[id]

patient

reference

Returns statements for a specific patient.

[伺服器網址]/MedicationStatement?patient={Type/}[id]

source

reference

Who or where the information in the statement came from

[伺服器網址]/MedicationStatement?source={Type/}[id]

status

token

Return statements that match the given status

[伺服器網址]/MedicationStatement?status=[code]

subject

reference

The identity of a patient, animal or group to list statements for

[伺服器網址]/MedicationStatement?subject={Type/}[id]

PUT

POST

GET

DELETE

1. 前置準備作業

1-1. 準備一個MedicationStatement.json的檔案，並儲存MedicationStatement格式的FHIR資料(使用PUT的方式必須要填寫id欄位)，範例如下顯示： 

```

```

2. 範例程式

PYTHON

JAVA

C#

#### PYTHON

2-1. 宣告

```
import requests
from bs4 import BeautifulSoup
import json
server_url = 'https://hapi.fhir.org/baseR4/' #可替代為自己的FHIR伺服器網址
```

2-2. FHIR資源讀檔

```
FileName = 'Json/MedicationStatement.json' #可替代為自己的檔案位置及檔名
with open(FileName, "r", encoding="utf-8") as json_file:
    MedicationStatementData = json.load(json_file)
```

2-3. 上傳資料

```
access_token = requests.put(server_url+"/MedicationStatement/"+MedicationStatementData['id'], json = MedicationStatementData, verify=False) #使用PUT方式必須在網址中加上id
RequestResult = json.loads(str(access_token.text))
print(RequestResult) #印出回傳資訊
```

2-4. 回傳資訊

上傳成功則回傳資訊包含使用者所設定的id，並顯示versionId

```

```

#### JAVA

2-1. 宣告

```
package com.example.FHIR; //需替換成自己設置的專案名稱

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
```

2-2. 上傳資料

```
String server_url = "https://hapi.fhir.org/baseR4/"; //可替代為自己的FHIR伺服器網址
Object ReadData = new JSONParser().parse(new FileReader("MedicationStatement.json")); //可替代為自己的檔案位置及檔名
JSONObject MedicationStatementData = (JSONObject) ReadData;
		
URL url = new URL(server_url + "MedicationStatement/" + (String) MedicationStatementData.get("id")); //使用PUT方式必須在網址中加上id
HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
httpCon.setRequestMethod("PUT");
httpCon.setDoOutput(true);
httpCon.setRequestProperty("Content-Type", "application/json");

OutputStream os = httpCon.getOutputStream();
os.write(MedicationStatementData.toString().getBytes("UTF-8"));
os.close();
httpCon.disconnect(); 
StringBuilder content = new StringBuilder();
try (BufferedReader in = new BufferedReader(new InputStreamReader(httpCon.getInputStream()))) {
    String line;
    while ((line = in.readLine()) != null) {
        content.append(line);
    }
}
System.out.println(content);
```

2-3. 回傳資訊

上傳成功則回傳資訊包含使用者所設定的id，並顯示versionId

```

```

#### C#

2-1. 宣告

```
using FHIR_json.Models;//需替換成自己設置的專案名稱
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
```

2-2. 上傳資料

```
String server_url = "https://hapi.fhir.org/baseR4/"; //可替代為自己的FHIR伺服器網址
StreamReader Json_Example = new StreamReader(@"C:\Users\MedicationStatement.json"); //可替代為自己的檔案位置及檔名
string jsonString = Json_Example.ReadToEnd();
JObject jsonObject = JObject.Parse(jsonString);
var data = new StringContent(jsonString, Encoding.UTF8, "application/json");
HttpClient client = new HttpClient();
var response = await client.PutAsync(server_url + "MedicationStatement/" + (string)jsonObject["id"], data); //使用PUT方式必須在網址中加上id
var result = JsonConvert.DeserializeObject(response.Content.ReadAsStringAsync().Result);
Console.WriteLine(result);
```

2-3. 回傳資訊

上傳成功則回傳資訊包含使用者所設定的id，並顯示versionId

```

```

1. 前置準備作業

1-1. 準備一個MedicationStatement.json的檔案，並儲存MedicationStatement格式的FHIR資料(使用POST的方式id欄位可選填)，範例如下顯示： 

```

```

2. 範例程式

PYTHON

JAVA

C#

#### PYTHON

2-1. 宣告

```
import requests
from bs4 import BeautifulSoup
import json
server_url = 'https://hapi.fhir.org/baseR4/' #可替代為自己的 FHIR 伺服器網址
```

2-2. FHIR資源讀檔

```
FileName = 'Json/MedicationStatement.json' #可替代為自己的檔案位置及檔名
with open(FileName, "r", encoding="utf-8") as json_file:
    MedicationStatementData = json.load(json_file)
```

2-3. 上傳資料

```
access_token = requests.post(server_url+"/MedicationStatement", json = MedicationStatementData, verify=False) 
RequestResult = json.loads(str(access_token.text))
print(RequestResult) #印出回傳資訊
```

2-4. 回傳資訊

上傳成功則回傳包含流水號id的資料，並顯示versionId

```

```

#### JAVA

2-1. 宣告

```
package com.example.FHIR; //需替換成自己設置的專案名稱

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
```

2-2. 上傳資料

```
String server_url = "https://hapi.fhir.org/baseR4/"; //可替代為自己的FHIR伺服器網址
Object ReadData = new JSONParser().parse(new FileReader("MedicationStatement.json")); 
JSONObject MedicationStatementData = (JSONObject) ReadData;
		
URL url = new URL(server_url + "MedicationStatement");
HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
httpCon.setRequestMethod("POST");
httpCon.setDoOutpost(true);
httpCon.setRequestProperty("Content-Type", "application/json");

OutpostStream os = httpCon.getOutpostStream();
os.write(MedicationStatementData.toString().getBytes("UTF-8"));
os.close();
httpCon.disconnect(); 
StringBuilder content = new StringBuilder();
try (BufferedReader in = new BufferedReader(new InpostStreamReader(httpCon.getInpostStream()))) {
    String line;
    while ((line = in.readLine()) != null) {
        content.append(line);
    }
}
System.out.println(content);
```

2-3. 回傳資訊

上傳成功則回傳包含流水號id的資料，並顯示versionId

```

```

#### C#

2-1. 宣告

```
using FHIR_json.Models;//需替換成自己設置的專案名稱
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
```

2-2. 上傳資料

```
String server_url = "https://hapi.fhir.org/baseR4/"; //可替代為自己的FHIR伺服器網址
StreamReader Json_Example = new StreamReader(@"C:\Users\MedicationStatement.json"); //可替代為自己的檔案位置及檔名
string jsonString = Json_Example.ReadToEnd();
var data = new StringContent(jsonString, Encoding.UTF8, "application/json");
HttpClient client = new HttpClient();
var response = await client.PostAsync(server_url + "MedicationStatement", data);
var result = JsonConvert.DeserializeObject(response.Content.ReadAsStringAsync().Result);
Console.WriteLine(result);
```

2-3. 回傳資訊

上傳成功則回傳包含流水號id的資料，並顯示versionId

```

```

1. 前置準備作業

1-1. 準備好需查詢的資源id，或依照MedicationStatement的查詢參數選擇查詢項目 

2. 範例程式

PYTHON

JAVA

C#

#### PYTHON

2-1. 宣告

```
import requests
from bs4 import BeautifulSoup
import json
server_url = 'https://hapi.fhir.org/baseR4/' #可替代為自己的 FHIR 伺服器網址
```

2-2. 搜尋資料

```
SearchCode = "" #可填入想要搜尋的參數，若為空則搜尋整個MedicationStatement
access_token = requests.get(server_url+"/MedicationStatement" + SearchCode, verify=False)
RequestResult = json.loads(str(access_token.text))
print(RequestResult)
```

2-3. 回傳資訊

成功則回傳Json格式的FHIR資料

```

```

#### JAVA

2-1. 宣告

```
package com.example.FHIR; //需替換成自己設置的專案名稱

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
```

2-2. 搜尋資料

```
String server_url = "https://hapi.fhir.org/baseR4/"; //可替代為自己的FHIR伺服器網址
String SearchCode = ""; //可填入想要搜尋的參數，若為空則搜尋整個MedicationStatement
URL url = new URL(server_url + "MedicationStatement" + SearchCode);
	    
HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
httpCon.setRequestMethod("GET");
InputStream is = httpCon.getInputStream();

try (BufferedReader in = new BufferedReader(new InputStreamReader(is, "UTF-8"))) {
    String line;
    while ((line = in.readLine()) != null) {
        System.out.println(line);
    }
}
```

2-3. 回傳資訊

成功則回傳Json格式的FHIR資料

```

```

#### C#

2-1. 宣告

```
using FHIR_json.Models;//需替換成自己設置的專案名稱
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
```

2-2. 搜尋資料

```
String server_url = "https://hapi.fhir.org/baseR4/"; //可替代為自己的FHIR伺服器網址
HttpClient client = new HttpClient();
String SearchCode = ""; //可填入想要搜尋的參數，若為空則搜尋整個MedicationStatement
HttpResponseMessage response = await client.GetAsync(server_url + "MedicationStatement" + SearchCode);
var result = JsonConvert.DeserializeObject(response.Content.ReadAsStringAsync().Result);
Console.WriteLine(result);
```

2-3. 回傳資訊

成功則回傳Json格式的FHIR資料

```

```

1. 前置準備作業

1-1. 準備好需刪除的資源id，或依照MedicationStatement的查詢參數選擇刪除項目 

2. 範例程式

PYTHON

JAVA

C#

#### PYTHON

2-1. 宣告

```
import requests
from bs4 import BeautifulSoup
import json
server_url = 'https://hapi.fhir.org/baseR4/' #可替代為自己的 FHIR 伺服器網址
```

2-2. 刪除資料

```
SearchCode = "/id" #填入想刪除的id，也可填入搜尋參數一次刪除多個資源
access_token = requests.delete(server_url+"/MedicationStatement" + SearchCode, verify=False)
RequestResult = json.loads(str(access_token.text))
print(RequestResult)
```

2-3. 回傳資訊

成功則會回傳Successfully deleted的資訊

```

```

#### JAVA

2-1. 宣告

```
package com.example.FHIR; //需替換成自己設置的專案名稱

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
```

2-2. 刪除資料

```
String server_url = "https://hapi.fhir.org/baseR4/"; //可替代為自己的FHIR伺服器網址
String SearchCode = "/id"; //填入想刪除的id，也可填入搜尋參數一次刪除多個資源MedicationStatement
URL url = new URL(server_url + "MedicationStatement" + SearchCode);

HttpURLConnection httpCon = (HttpURLConnection) url.openConnection();
httpCon.setRequestMethod("DELETE");
httpCon.disconnect(); 

StringBuilder content = new StringBuilder();
try (BufferedReader in = new BufferedReader(new InputStreamReader(httpCon.getInputStream()))) {
    String line;
    while ((line = in.readLine()) != null) {
        content.append(line);
    }
}
System.out.println(content);
```

2-3. 回傳資訊

上傳成功則回傳包含流水號id的資料，並顯示versionId

```

```

#### C#

2-1. 宣告

```
using FHIR_json.Models;//需替換成自己設置的專案名稱
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
```

2-2. 刪除資料

```
String server_url = "https://hapi.fhir.org/baseR4/"; //可替代為自己的FHIR伺服器網址
HttpClient client = new HttpClient();
String SearchCode = "/id";
var response = await client.DeleteAsync(server_url + "MedicationStatement" + SearchCode);
var result = JsonConvert.DeserializeObject(response.Content.ReadAsStringAsync().Result);
Console.WriteLine(result);
```

2-3. 回傳資訊

上傳成功則回傳包含流水號id的資料，並顯示versionId

```

```

本網站所有教學資訊均來自

FHIR官網

