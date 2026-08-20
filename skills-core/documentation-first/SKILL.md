---
name: documentation-first
description: Skill madre para reducir consumo de tokens usando primero la Knowledge Base local de Dynatrace Docs antes de buscar en web.
---

# Documentation First

Antes de buscar en internet o pedir contexto externo, consultar la documentación local.

## Flujo

```cmd
dtx docs search "<tema>" --domain <dominio> --limit 5
```

Si falta evidencia:

```cmd
dtx docs scrape --domain <dominio> --limit 25
```

Después:

```cmd
dtx docs search "<tema>" --domain <dominio> --limit 10
```

## Regla

No generar instrucciones definitivas si no hay evidencia suficiente. Si el tema debe quedar reusable, crear skill con trazabilidad:

```cmd
dtx skill create "<capacidad>" --domain <dominio>
dtx skill validate <nombre-skill>
```

## Ubicación de fuentes

```text
data/docs/index.json
data/docs/*.md
skills/<skill>/references/evidence.json
```
