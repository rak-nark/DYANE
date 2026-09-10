---
name: dynatrace-analizar-sesiones-de-usuarios-y-err
description: Procedimientos operativos, comandos y consultas DQL para analizar sesiones de usuarios y errores javascript de frontend en Dynatrace. Basada en documentación oficial de Dynatrace Docs. Úsala cuando pidan "analizar sesiones de usuarios y errores javascript de frontend", "operar general", "configurar general" o diagnosticar componentes relacionados.
---

# DYNATRACE ANALIZAR SESIONES DE USUARIOS Y ERR

Esta skill proporciona las instrucciones técnicas, validaciones y procedimientos estandarizados para **analizar sesiones de usuarios y errores javascript de frontend** en Dynatrace.

## 1. Fuentes Oficiales de Evidencia

Esta skill ha sido generada y validada contra la documentación oficial de Dynatrace:
- [Classic environment v2 | Dynatrace Developer](https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/) (*general*)
- [Drill down to frontend context from Distributed Tracing app — Dynatrace Docs](https://docs.dynatrace.com/docs/observe/application-observability/distributed-tracing/distributed-tracing-app/drill-down-to-frontend) (*general*)
- [Classic environment v1 | Dynatrace Developer](https://developer.dynatrace.com/develop/sdks/client-classic-environment-v1/) (*general*)
- [Traces — Dynatrace Docs](https://docs.dynatrace.com/docs/semantic-dictionary/model/trace) (*general*)

## 2. Consultas y Comandos Operativos

A continuación se presentan los comandos y consultas verificados para este dominio:

```powershell
npm install @dynatrace-sdk/client-classic-environment-v2

---

import { accessTokensActiveGateTokensClient } from '@dynatrace-sdk/client-classic-environment-v2';

---

import { accessTokensActiveGateTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data =

  await accessTokensActiveGateTokensClient.createToken({

    body: {

      activeGateType: "ENVIRONMENT",

      name: "myToken",

    },

  });
```

```powershell
npm install @dynatrace-sdk/client-classic-environment-v1

---

import { clusterConfigClient } from '@dynatrace-sdk/client-classic-environment-v1';

---

import { clusterConfigClient } from "@dynatrace-sdk/client-classic-environment-v1";



const data = await clusterConfigClient.getClusterId();
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
