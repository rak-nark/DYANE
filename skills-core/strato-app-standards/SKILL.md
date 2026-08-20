---
name: strato-app-standards
description: Skill madre para desarrollar Dynatrace Apps nativas con App Toolkit, React, TypeScript, Strato UI y DQL de solo lectura.
---

# Strato App Standards

Usa esta skill para cualquier Dynatrace App nativa.

## Base técnica

- App Toolkit `dt-app`
- React + TypeScript
- Strato UI
- `useDql` para consultas DQL desde la app
- `app.config.json` con scopes mínimos

## Reglas de UI

- La primera pantalla debe ser una experiencia útil, no una landing.
- Usar vistas compactas orientadas a operación técnica.
- Mantener consultas predeterminadas y parametrizadas.
- Limitar resultados por defecto.
- Separar catálogo DQL de componentes visuales.

## Scopes iniciales

```text
storage:logs:read
storage:metrics:read
storage:entities:read
storage:events:read
storage:buckets:read
```

## Validación

```cmd
cmd /c npm run build
```

Si PowerShell bloquea scripts, usar ejecutables `.cmd` o `cmd /c`.
