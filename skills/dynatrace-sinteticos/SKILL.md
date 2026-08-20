---
name: dynatrace-sinteticos
description: Supervisa, audita y diagnostica monitores sintéticos (HTTP checks, Browser clickpaths, disponibilidad de endpoints, tiempo de respuesta por ubicación geográfica y SLA/SLO de disponibilidad) en Dynatrace mediante DQL en Grail, dtctl y API/MCP. Úsala cuando pidan "monitores sintéticos", "pruebas sintéticas", "disponibilidad de APIs", "tiempo de respuesta por país", "clickpath", "estado de synthetic checks" o "SLO de disponibilidad".
---

# Monitoreo Sintético en Dynatrace (Synthetic Monitoring)

Esta skill define cómo consultar el estado de salud, disponibilidad y rendimiento de monitores sintéticos (HTTP y Browser) en Dynatrace.

## 1. Consultas DQL para Monitores Sintéticos en Grail

### A. Disponibilidad y Tiempo de Respuesta por Monitor
```dql
fetch dt.entity.synthetic_test
| fields id, entity.name, enabled, type
```

### B. Rendimiento y Errores por Ubicación Geográfica
```dql
fetch events
| filter event.kind == "SYNTHETIC_EVENT" or event.category == "SYNTHETIC"
| summarize 
    total_checks = count(),
    failed_checks = countIf(event.status == "FAILED"),
    availability_pct = (count() - countIf(event.status == "FAILED")) * 100.0 / count(),
    avg_response_time = avg(duration)
  by: { location, synthetic_test.name }
| sort availability_pct asc
```

### C. Últimas Fallas de Sintéticos con Causa Raíz
```dql
fetch events
| filter event.kind == "SYNTHETIC_EVENT" and event.status == "FAILED"
| fields timestamp, synthetic_test.name, location, failureReason, errorMessage
| sort timestamp desc
| limit 10
```

## 2. Inspección con `dtctl`

Listar los monitores sintéticos configurados:
```powershell
.\dtx.cmd dtctl get synthetic-monitors
```

Obtener detalles de un monitor específico:
```powershell
.\dtx.cmd dtctl get synthetic-monitor <MONITOR-ID> --output json
```

## 3. Flujo de Trabajo para Incidentes Sintéticos

1. **Detectar alertas activas de sintéticos:**
   ```powershell
   .\dtx.cmd problems --status OPEN
   ```
2. **Revisar si la falla es global o de una ubicación específica:**
   ```powershell
   .\dtx.cmd dql "fetch events | filter event.kind == 'SYNTHETIC_EVENT' | summarize count(), by: { location, event.status } | limit 20"
   ```
3. **Validar si el endpoint HTTP devuelve códigos 4xx/5xx o timeouts:**
   ```powershell
   .\dtx.cmd dql "fetch events | filter event.kind == 'SYNTHETIC_EVENT' and isNotNull(httpStatus) | summarize count(), by: { httpStatus, url }"
   ```
