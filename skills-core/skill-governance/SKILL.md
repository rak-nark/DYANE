---
name: skill-governance
description: Skill madre para separar core skills de domain skills, crear nuevas capabilities reutilizables y validar trazabilidad documental.
---

# Skill Governance

La suite maneja dos capas:

## Core Skills

Ubicación:

```text
skills-core/
```

Definen cómo trabajar en cualquier proyecto.

## Domain Skills

Ubicación:

```text
skills/
```

Definen capacidades Dynatrace concretas.

## Regla de creación

Crear una nueva domain skill cuando:

- el procedimiento se repite
- hay DQL o comandos reutilizables
- se necesita trazabilidad
- hay una práctica de cliente que debe estandarizarse

## Validación

```cmd
dtx skill create "<capacidad>" --domain <dominio>
dtx skill validate <nombre-skill>
dtx skill list
```

Una skill madura debe tener:

- `SKILL.md`
- `references/evidence.json`
- comandos o DQL verificados
- límites y supuestos explícitos
