---
name: project-bootstrap
description: Skill madre obligatoria para iniciar cualquier desarrollo en esta suite Dynatrace. Define terminal, comandos base, verificación, estructura del repo y criterios mínimos antes de implementar.
---

# Project Bootstrap

Usa esta skill al iniciar cualquier desarrollo en la suite.

## Terminal

En Windows, preferir comandos simples con `cmd`:

```cmd
cmd /c npm run build
cmd /c npm run typecheck
cmd /c node dist/index.js test --smoke
```

Evitar depender de wrappers `.ps1` como `npm.ps1` o `npx.ps1` porque pueden fallar por Execution Policy.

## Verificación inicial

Antes de desarrollar:

```cmd
node -v
npm -v
dtx config
dtx test --smoke
dtx skill list
```

## Orden de trabajo

1. Identificar si el pedido es CLI, API, MCP, documentación, skill o Dynatrace App.
2. Buscar una domain skill existente.
3. Consultar documentación local con `dtx docs search`.
4. Implementar cambios pequeños y verificables.
5. Validar con TypeScript/build o con el comando operativo equivalente.
6. Documentar nuevas convenciones si se vuelven repetibles.

## Criterio mínimo de cierre

Todo desarrollo debe indicar:

- archivos tocados
- comando de validación ejecutado
- limitaciones o pasos pendientes
