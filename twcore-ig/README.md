# twcore-ig：TW Core IG v1.0.0

| 路徑 | 內容 | 用途 |
|---|---|---|
| `package/package/` | 官方 FHIR NPM 套件 `tw.gov.mohw.twcore#1.0.0`：99 個 StructureDefinition、129 個 SearchParameter、55 個 ValueSet、30 個 CodeSystem、6 個 ConceptMap、2 個 CapabilityStatement | 查 Profile 的必填欄位與代碼綁定；可直接交給 HAPI、FHIR validator、SUSHI 使用 |
| `examples/` | 98 個 JSON 範例資源 | 測試 App 能不能讀懂台灣格式的資料 |

來源：<https://twcore.mohw.gov.tw/ig/twcore/>。重新下載或升級版本：

```bash
curl -LO https://twcore.mohw.gov.tw/ig/twcore/package.tgz && mkdir -p package && tar -xzf package.tgz -C package
curl -LO https://twcore.mohw.gov.tw/ig/twcore/examples.json.zip && unzip -o -d examples examples.json.zip
```

以前還有一份 `definitions/`，是官方另外提供的 `definitions.json.zip` 解壓縮後的內容。它和 `package/package/` 重複：324 個檔案中，274 個完全相同，其餘 49 個只差在 `text`（給人看的 HTML 說明）。因此已經移除。需要時可以從上面的網址下載 `definitions.json.zip`。
