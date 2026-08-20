---
name: dynatrace-skill-builder
description: Automatiza la creación, scaffolding, estructuración y validación de nuevas skills para Dynatrace respaldadas por la documentación oficial. Úsala cuando el usuario pida "crear una skill", "nueva skill", "desarrollar skill automática", "plantilla de skill", "generar procedimiento para Dynatrace" o cuando se identifique un flujo repetitivo que requiera estandarización y trazabilidad técnica.
---

# Generador Autónomo de Skills Validadas por Documentación

Esta meta-skill guía el pipeline de **11 pasos** para generar, validar y desplegar nuevas skills en `skills/<nombre-skill>/` y `.agents/skills/`, garantizando **0 alucinaciones** y respaldo técnico oficial desde `docs.dynatrace.com`.

## 1. Flujo del Pipeline de 11 Pasos

```text
┌────────────────────────────────────────┐
│ 1. Solicitud de Usuario / Capacidad    │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 2. Clasificación de Dominio & Objetivo │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 3. Búsqueda en Knowledge Base Local    │  dtx docs search "<término>"
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 4. Recuperación de Evidencia Técnica   │  URLs, conceptos, DQL, parámetros, APIs
└───────────────────┬────────────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ 5. ¿Docs        │
           │ suficientes?    │
           └────────┬────────┘
             NO     │     SÍ
             │      │
             ▼      ▼
┌───────────────────────┐   ┌────────────────────────────────────────┐
│ Solicitar más info o  │   │ 6. Validación Técnica de Documentos    │
│ ejecutar dtx docs     │   │    Fuente oficial, vigencia y contexto │
│ scrape                │   └───────────────────┬────────────────────┘
└───────────────────────┘                       │
                                                ▼
                                    ┌────────────────────────────────────────┐
                                    │ 7. Construcción de Skill (SKILL.md)    │
                                    │    Propósito, pasos, DQL, restricciones│
                                    └───────────────────┬────────────────────┘
                                                        │
                                                        ▼
                                    ┌────────────────────────────────────────┐
                                    │ 8. Grounding Check & Respaldo          │
                                    │    ¿Comandos 100% basados en docs?     │
                                    └───────────────────┬────────────────────┘
                                                        │
                                                        ▼
                                    ┌────────────────────────────────────────┐
                                    │ 9. Aprobación de Formato Estándar      │
                                    └───────────────────┬────────────────────┘
                                                        │
                                                        ▼
                                    ┌────────────────────────────────────────┐
                                    │ 10. Registro de Trazabilidad           │
                                    │     Guardar references/evidence.json   │
                                    └───────────────────┬────────────────────┘
                                                        │
                                                        ▼
                                    ┌────────────────────────────────────────┐
                                    │ 11. Disponible en .agents/skills/      │
                                    └────────────────────────────────────────┘
```

## 2. Ejecución Automatizada vía CLI

Puedes ejecutar el pipeline completo con un solo comando:

```powershell
# Generar skill automáticamente a partir de documentación oficial
.\dtx.cmd skill create "Monitoreo de Kubernetes y Dynakube Operator" --domain kubernetes

# Auditar la trazabilidad y respaldo documental de una skill
.\dtx.cmd skill validate dynatrace-kubernetes-operator

# Listar todas las skills y su estado de verificación
.\dtx.cmd skill list
```

## 3. Estructura Obligatoria de Archivos

```text
skills/<nombre-skill>/
├── SKILL.md              # Requerido: Instrucciones principales con YAML frontmatter
├── references/
│   └── evidence.json     # Requerido: Registro de trazabilidad y fuentes oficiales
├── scripts/              # Opcional: Scripts PowerShell / Node.js reutilizables
└── examples/             # Opcional: Ejemplos de DQL, JSONs o dashboards
```

## 4. Esquema del Registro de Trazabilidad (`evidence.json`)

```json
{
  "skillName": "dynatrace-ejemplo",
  "targetDomain": "grail",
  "requestedCapability": "...",
  "sufficiency": {
    "isSufficient": true,
    "confidence": 1.0,
    "reasoning": "Respaldada por 4 páginas oficiales de Dynatrace Docs."
  },
  "sources": [
    {
      "url": "https://docs.dynatrace.com/docs/...",
      "title": "...",
      "domain": "grail"
    }
  ],
  "groundingChecks": [
    {
      "claimOrInstruction": "...",
      "backedByUrl": "https://docs.dynatrace.com/docs/...",
      "status": "VERIFIED"
    }
  ],
  "createdAt": "2026-08-20T...",
  "version": "1.0.0"
}
```
