---
id: "f7a4d452c7c2448c"
url: "https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/app-dynatrace-azure-connector-microsoft-entra-identity-developer-connection"
title: "Settings API - Microsoft Entra ID schema table — Dynatrace Docs"
domain: "appengine"
crawledAt: "2026-08-20T19:47:10.410Z"
contentHash: "70d76e4ba637fea835d6269188ee9b45b7a036b2eff9e196814b0779af1715d3"
---

# Settings API - Microsoft Entra ID schema table — Dynatrace Docs

*Fuente oficial:* [https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/app-dynatrace-azure-connector-microsoft-entra-identity-developer-connection](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/app-dynatrace-azure-connector-microsoft-entra-identity-developer-connection)

Settings API - Microsoft Entra ID schema table — Dynatrace Docs 
# Settings API - Microsoft Entra ID schema table
 
- Published Jul 31, 2024 
 
### Microsoft Entra ID (`app:dynatrace.azure.connector:microsoft-entra-identity-developer-connection )`

Authentication settings for Microsoft Entra ID. Schema ID Schema groups Scope `app:dynatrace.azure.connector:microsoft-entra-identity-developer-connection` - `environment` Retrieve schema via Settings API 

 GET Managed `https://{your-domain}/e/{your-environment-id}/api/v2/settings/schemas/app:dynatrace.azure.connector:microsoft-entra-identity-developer-connection` GET SaaS `https://{your-environment-id}.live.dynatrace.com/api/v2/settings/schemas/app:dynatrace.azure.connector:microsoft-entra-identity-developer-connection` GET Environment ActiveGate `https://{your-activegate-domain}/e/{your-environment-id}/api/v2/settings/schemas/app:dynatrace.azure.connector:microsoft-entra-identity-developer-connection` 
## Authentication

To execute this request, you need an access token with **Read settings** (`settings.read`) scope. To learn how to obtain and use it, see Tokens and authentication . 
## Parameters
 Property Type Description Required Connection name
`name` text 

The name of the Microsoft Entra ID connection Required Description
`description` text - Optional Directory (tenant) ID
`directoryId` secret 

Directory (tenant) ID of Microsoft Entra ID Required Application (client) ID
`applicationId` secret 

Application (client) ID of your app registered in Microsoft Azure App registrations Required Client secret
`clientSecret` secret 

Client secret of your app registered in Microsoft Azure App registrations Required
