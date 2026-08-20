---
name: dynatrace-api-setup
description: Valida, diagnostica y configura la conectividad, credenciales y autenticación con Dynatrace (Platform Tokens, OAuth Client Credentials, dtctl keyring y servidor MCP). Úsala cuando el usuario pida "configurar conexión", "revisar credenciales", "probar conexión", "dtx doctor", "configurar dtctl", "generar tokens" o cuando una llamada a la API o MCP falle por HTTP 401/403/400.
---

# Configuración y Diagnóstico de Conectividad Dynatrace

Esta skill proporciona los procedimientos paso a paso para verificar, reparar y aprovisionar el acceso a la plataforma Dynatrace a través de sus tres canales: **API**, **CLI (`dtctl` / `dtx`)** y **MCP Gateway**.

## 1. Verificación Rápida del Estado

Ejecuta el diagnóstico completo del entorno:

```powershell
.\dtx.cmd test
```

| Resultado | Diagnóstico | Acción requerida |
| :--- | :--- | :--- |
| `entorno = FALLO` | Falta `DT_ENVIRONMENT_ID` o `DT_ENVIRONMENT_URL` en `.env` | Editar `.env` y definir el tenant ID |
| `cli = FALLO` | `dtctl` no encontrado en PATH ni en `%LOCALAPPDATA%\dtctl` | Ejecutar `.\scripts\setup.ps1 -InstallDtctl` |
| `api = HTTP 401/403` | Token inválido o sin scopes requeridos | Reemitir Platform Token en MyAccount con scopes de lectura |
| `api = HTTP 400 (Invalid app context)` | Endpoint clásico llamado con Platform Token | Usar DQL (`/platform/storage/query/v1/query:execute`) |
| `mcp = HTTP 401/403` | Faltan scopes de gateway | Añadir `mcp-gateway:servers:read` y `mcp-gateway:servers:invoke` |
| `mcp = Servidor no alcanzable` | Problema de red, proxy o URL incorrecta | Verificar URL del gateway en `dtx mcp` |

## 2. Tipos de Autenticación y Scopes

### A. Platform Token (Recomendado)
- **Formato:** `dt0s16.<id>.<secreto>`
- **Ubicación:** `.env` $\rightarrow$ `DT_PLATFORM_TOKEN`
- **Scopes mínimos recomendados:**
  - `mcp-gateway:servers:read`, `mcp-gateway:servers:invoke` (para MCP)
  - `ai:operator:execute`, `davis-copilot:*:execute` (para herramientas de IA)
  - `storage:logs:read`, `storage:metrics:read`, `storage:entities:read`, `storage:events:read` (para DQL/Grail)

### B. OAuth Client Credentials
- **Formato:** Client ID (`dt0s02.*`) + Client Secret + Account URN (`urn:dtaccount:...`)
- **Ubicación:** `.env` $\rightarrow$ `DT_OAUTH_CLIENT_ID`, `DT_OAUTH_CLIENT_SECRET`, `DT_ACCOUNT_URN`
- **Uso:** Refresco automático de tokens de 5 minutos mediante `dtx token`.

## 3. Configuración de `dtctl`

Comprueba el contexto actual del CLI oficial:
```powershell
.\dtx.cmd dtctl doctor
```

Si se necesita crear o renovar el contexto:
```powershell
dtctl context set <nombre-contexto> --url https://<env-id>.apps.dynatrace.com --token <platform-token>
dtctl context use <nombre-contexto>
```

## 4. Activación de MCP en Clientes de IA

Para activar el servidor MCP en clientes como OpenCode o Cursor:
1. Verifica la URL con `.\dtx.cmd mcp`.
2. Actualiza `opencode.json` con `enabled: true` y la cabecera `Authorization: Bearer <DT_PLATFORM_TOKEN>`.
