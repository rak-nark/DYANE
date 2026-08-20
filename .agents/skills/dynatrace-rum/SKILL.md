
---
name: dynatrace-rum
description: Analiza la experiencia digital de usuarios reales (Real User Monitoring / RUM), rendimiento web y móvil, errores de frontend (JavaScript/Crash), sesiones de usuario (User Sessions), embudos de conversión (Funnels) y Apdex en Dynatrace mediante consultas DQL a Grail y llamadas a la API/MCP. Úsala cuando pidan "analizar RUM", "sesiones de usuarios", "errores javascript", "experiencia de usuario", "apdex", "core web vitals", "performance web" o "tasa de conversión".
---

# Dynatrace Real User Monitoring (RUM) & User Experience

Esta skill permite consultar, correlacionar y analizar métricas de experiencia de usuario real (RUM) para aplicaciones web y móviles en Dynatrace.

## 1. Consultas DQL de RUM en Grail

Todas las consultas pueden ejecutarse mediante `.\dtx.cmd dql "<query>"` o mediante la herramienta MCP `execute-dql`.

### A. Resumen de Sesiones de Usuario
```dql
fetch userSession
| summarize 
    total_sessions = count(),
    unique_users = countDistinct(userId),
    avg_duration = avg(duration),
    apdex = countIf(userExperienceScore == "SATISFIED") * 100.0 / count(),
  by: { application }
| sort total_sessions desc
```

### B. Core Web Vitals (LCP, FID, CLS)
```dql
fetch userAction
| filter isNotNull(largestContentfulPaint)
| summarize 
    p75_LCP = percentile(largestContentfulPaint, 75),
    p75_FID = percentile(firstInputDelay, 75),
    p75_CLS = percentile(cumulativeLayoutShift, 75),
  by: { application, name }
| limit 20
```

### C. Top Errores de JavaScript en Frontend
```dql
fetch events
| filter event.kind == "ERROR_EVENT" and event.category == "JAVASCRIPT_ERROR"
| summarize count = count(), by: { error.message, error.location, application }
| sort count desc
| limit 15
```

### D. Análisis de Embudos de Conversión (Funnels)
```dql
fetch userAction
| filter application == "MiApp"
| summarize
    paso1_inicio = countIf(name == "Cargar /checkout/inicio"),
    paso2_datos = countIf(name == "Clic en Continuar a Datos"),
    paso3_pago = countIf(name == "Clic en Procesar Pago"),
    paso4_exito = countIf(name == "Cargar /checkout/confirmacion")
```

## 2. Procedimiento de Diagnóstico de Incidentes de UX

1. **Identificar la aplicación afectada:**
   ```powershell
   .\dtx.cmd dql "fetch dt.entity.application | fields id, entity.name"
   ```
2. **Revisar degradación del Apdex en la última hora:**
   ```powershell
   .\dtx.cmd dql "fetch userSession | summarize apdex = countIf(userExperienceScore == 'SATISFIED') * 100.0 / count(), by: { bin(timestamp, 5m) }"
   ```
3. **Correlacionar con llamadas de backend / fallos de red:**
   ```powershell
   .\dtx.cmd dql "fetch userAction | filter isError == true | summarize count(), by: { failedRequests, httpStatusCode } | limit 10"
   ```
4. **Extraer ejemplos de Session Replay / User ID:**
   ```powershell
   .\dtx.cmd dql "fetch userSession | filter userExperienceScore == 'FRUSTRATED' | fields userId, duration, errorsCount | limit 5"
   ```
