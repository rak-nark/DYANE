---
name: dynatrace-monitoreo-y-autoescalado-de-ku
description: Procedimientos operativos, comandos y consultas DQL para Monitoreo y autoescalado de Kubernetes con Dynatrace Operator en Dynatrace. Basada en documentación oficial de Dynatrace Docs. Úsala cuando pidan "Monitoreo y autoescalado de Kubernetes con Dynatrace Operator", "operar kubernetes", "configurar kubernetes" o diagnosticar componentes relacionados.
---

# DYNATRACE MONITOREO Y AUTOESCALADO DE KU

Esta skill proporciona las instrucciones técnicas, validaciones y procedimientos estandarizados para **Monitoreo y autoescalado de Kubernetes con Dynatrace Operator** en Dynatrace.

## 1. Fuentes Oficiales de Evidencia

Esta skill ha sido generada y validada contra la documentación oficial de Dynatrace:
- [Dynatrace Operator release notes version 1.10.0 — Dynatrace Docs](https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-1-10-0) (*kubernetes*)
- [Predict and autoscale Kubernetes workloads — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/self-service-kubernetes-use-case) (*kubernetes*)
- [Dynatrace Operator release notes version 1.10.1 — Dynatrace Docs](https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-1-10-1) (*kubernetes*)
- [Dynatrace Operator release notes version 0.11.2 — Dynatrace Docs](https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-0-11-2) (*kubernetes*)

## 2. Consultas y Comandos Operativos

A continuación se presentan los comandos y consultas verificados para este dominio:

```powershell
# Consultar estado vía CLI dtx
.\dtx.cmd dql "fetch dt.entity.kubernetes | limit 10"
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
