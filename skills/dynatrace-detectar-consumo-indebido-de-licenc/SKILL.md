---
name: dynatrace-detectar-consumo-indebido-de-licenc
description: Procedimientos operativos, comandos y consultas DQL para detectar consumo indebido de licencia dps y dashboards costosos en Dynatrace. Basada en documentación oficial de Dynatrace Docs. Úsala cuando pidan "detectar consumo indebido de licencia dps y dashboards costosos", "operar dashboards", "configurar dashboards" o diagnosticar componentes relacionados.
---

# DYNATRACE DETECTAR CONSUMO INDEBIDO DE LICENC

Esta skill proporciona las instrucciones técnicas, validaciones y procedimientos estandarizados para **detectar consumo indebido de licencia dps y dashboards costosos** en Dynatrace.

## 1. Fuentes Oficiales de Evidencia

Esta skill ha sido generada y validada contra la documentación oficial de Dynatrace:
- [Explore your DPS for Hybrid subscription with dashboards — Dynatrace Docs](https://docs.dynatrace.com/docs/license/dps-for-hybrid/api-export-business-events) (*dashboards*)
- [View DPS consumption with ready-made usage dashboards — Dynatrace Docs](https://docs.dynatrace.com/docs/manage-your-costs/view/usage-dashboards) (*dashboards*)
- [Dashboards Classic API - GET all dashboards — Dynatrace Docs](https://docs.dynatrace.com/docs/dynatrace-api/configuration-api/dashboards-api/get-all) (*dashboards*)
- [Dashboards Classic API - GET sharing configuration — Dynatrace Docs](https://docs.dynatrace.com/docs/dynatrace-api/configuration-api/dashboards-api/get-sharing-config) (*dashboards*)

## 2. Consultas y Comandos Operativos

A continuación se presentan los comandos y consultas verificados para este dominio:

```powershell
const ssoURL = "https://sso.dynatrace.com/sso/oauth2/token";
const secret = {
    "client_id": "",        // insert your OAuth client id here
    "client_secret": "",    // insert your OAuth client secret here
    "uuid": ""              // insert your account UUID id here
};


async function getToken() {
    var requestBody = [];
    requestBody.push(encodeURIComponent("grant_type") + "=" +
                     encodeURIComponent("client_credentials"));
    requestBody.push(encodeURIComponent("client_id") + "=" +
                     encodeURIComponent(secret.client_id));
    requestBody.push(encodeURIComponent("client_secret") + "=" +
                     encodeURIComponent(secret.client_secret));
    requestBody.push(encodeURIComponent("resource") + "=" +
                     encodeURIComponent("urn:dtaccount:" + secret.uuid));
    requestBody = requestBody.join("&");


    const tokenRequest = await fetch(
        ssoURL,
        {
            method: "POST",
            headers:{"Content-Type": "application/x-www-form-urlencoded"},
            body: requestBody
        }
    );
    const tokenResponse = await tokenRequest.json();
    const token = tokenResponse.access_token;
 

---

C:\Program Files\nodejs\node.exe .\script.js


Access token:
d3m0d3m0d3m0d3m0d3m0d3m0...

---

const apiURL = "https://api.dynatrace.com";
```

```powershell
{
  "dashboards": [
    {
      "created": 1776772474839,
      "id": "d6740373-ff26-4681-b95f-fd5b858c97f7",
      "lastModified": 1776858899692,
      "lastViewed": 1776945274839,
      "name": "Home dashboard",
      "owner": "admin",
      "popularity": 5
    },
    {
      "created": 1776772474839,
      "id": "54b34dbb-2ae7-4c27-9dbc-90a4f4c68b10",
      "lastModified": 1776858899692,
      "name": "Databases",
      "owner": "viewer"
    },
    {
      "id": "8525b0bf-e33c-4a92-a534-9dedc1391e10",
      "name": "Business value",
      "owner": "rocks"
    }
  ]
}

---

curl -X GET \
  https://mySampleEnv.live.dynatrace.com/api/config/v1/dashboards \
  -H 'Authorization: Api-Token dt0c01.abc123.abcdefjhij1234567890'

---

https://mySampleEnv.live.dynatrace.com/api/config/v1/dashboards
```

## 3. Procedimiento Operativo Paso a Paso

1. **Identificación y Descubrimiento:**
   - Comprobar la existencia de entidades y estado en Grail o mediante el CLI `dtx`.
2. **Diagnóstico y Telemetría:**
   - Ejecutar consultas DQL acotadas con filtros de tiempo y dimensiones específicas.
3. **Validación de Configuración y Alertas:**
   - Verificar la consistencia con las mejores prácticas documentadas en las referencias técnicas.

## 4. Trazabilidad y Validación Documental

- La evidencia técnica, fragmentos de código originales y enlaces de respaldo se encuentran registrados en `references/evidence.json`.
