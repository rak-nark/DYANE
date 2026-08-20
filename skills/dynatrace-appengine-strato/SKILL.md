---
name: dynatrace-appengine-strato
description: Procedimientos operativos, comandos y consultas DQL para Desarrollo de Dynatrace Apps con Strato UI y consultas DQL en AppEngine en Dynatrace. Basada en documentación oficial de Dynatrace Docs. Úsala cuando pidan "Desarrollo de Dynatrace Apps con Strato UI y consultas DQL en AppEngine", "operar appengine", "configurar appengine" o diagnosticar componentes relacionados.
---

# DYNATRACE APPENGINE STRATO

Esta skill proporciona las instrucciones técnicas, validaciones y procedimientos estandarizados para **Desarrollo de Dynatrace Apps con Strato UI y consultas DQL en AppEngine** en Dynatrace.

## 1. Fuentes Oficiales de Evidencia

Esta skill ha sido generada y validada contra la documentación oficial de Dynatrace:
- [Calculate your consumption of AppEngine Functions (DPS) — Dynatrace Docs](https://docs.dynatrace.com/docs/license/capabilities/appengine-functions/consumption-details) (*appengine*)
- [AppEngine — Dynatrace Docs](https://docs.dynatrace.com/docs/platform/appengine) (*appengine*)
- [Dynatrace Apps — Dynatrace Docs](https://docs.dynatrace.com/docs/discover-dynatrace/dynatrace-apps) (*appengine*)
- [Developer Connect — Dynatrace Docs](https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/gcp/developerconnect) (*appengine*)

## 2. Consultas y Comandos Operativos

A continuación se presentan los comandos y consultas verificados para este dominio:

```powershell
# Consultar estado vía CLI dtx
.\dtx.cmd dql "fetch dt.entity.appengine | limit 10"
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
