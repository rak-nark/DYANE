---
name: dynatrace-negocio-integral
description: Orquesta el trabajo END-TO-END en Dynatrace para un cliente — desde auditar/construir la arquitectura de ingesta OpenPipeline (buckets, routing, pipelines, aislamiento multicliente) hasta construir el dashboard de negocio final estilo pilares con marca homologada y Business Flow. Úsala cuando el pedido cruce ambos mundos: "monta la ingesta y el dashboard de negocio para X", "arma todo el flujo desde cero para este cliente nuevo", "por qué mi dashboard no tiene datos" (cuando la causa puede estar en ingesta, no en el dashboard), o cualquier tarea que empiece en OpenPipeline y termine en un dashboard visible para el cliente. Si la tarea es SOLO auditar/optimizar ingesta sin dashboard, usa dynatrace-ingesta-openpipeline directamente; si la tarea es SOLO el dashboard y la ingesta ya existe y funciona, usa dynatrace-dashboards-negocio directamente. Esta skill es el puente entre las dos.
---

# Ingesta + Dashboard de negocio: flujo integral

Esta skill NO duplica contenido de las otras dos — es el mapa que las conecta y resuelve las
decisiones que quedan en la frontera entre ambas. Las dos skills originales siguen siendo la
fuente de verdad de su propio dominio:

- **[`dynatrace-ingesta-openpipeline`](../dynatrace-ingesta-openpipeline/SKILL.md)** — modelo
  mental de la cadena de ingesta (routing → pipeline → storage), antipatrones, aislamiento
  multicliente vía `dt.security_context` + boundaries IAM, y el playbook de replicar el esquema
  a un cliente nuevo desde cero.
- **[`dynatrace-dashboards-negocio`](../dynatrace-dashboards-negocio/SKILL.md)** — cómo, una vez
  que el dato ya fluye, convertirlo en un dashboard de negocio estilo pilares (easyTravel demo)
  con marca del cliente, honeycombs, funnel y Business Flow nativo.

## Cuándo entra en juego esta skill (y no una de las dos por separado)

Un dashboard de negocio vacío o con datos raros casi siempre tiene su causa raíz en la ingesta,
no en el dashboard mismo. Si estás por diagnosticar "por qué este dashboard no muestra nada" o
"por qué falta este campo", **empezá por la ingesta** (Fase 1) antes de tocar una sola query del
dashboard — es la misma disciplina que ya exige `dynatrace-dashboards-negocio` en su Paso 1
("diagnosticar cobertura antes de escribir reglas"), pero acá la extendemos a nivel de toda la
arquitectura, no solo del endpoint puntual.

## Fase 1 — Ingesta (delegar en `dynatrace-ingesta-openpipeline`)

Seguí su Paso 1 (inventariar) y Paso 2 (auditar antipatrones) tal cual están documentados ahí.
Puntos de esa skill que son especialmente relevantes cuando el destino final es un dashboard de
negocio de un proceso específico (no una auditoría completa del tenant):

- No hace falta auditar los 13 *kinds* — concentrate en `bizevents` (y `spans` si el dashboard
  también los usa para salud técnica).
- Si es un cliente nuevo o un proceso nuevo dentro de un cliente existente, seguí su Paso 3
  (replicar) completo — es el mismo procedimiento que `dynatrace-dashboards-negocio` resume en
  su propio `references/ingesta-prerequisitos.md`, pero el de `dynatrace-ingesta-openpipeline`
  tiene el detalle de aislamiento multicliente (`dt.security_context` + boundary IAM) que la
  skill de dashboards no cubre y que sí importa en tenants de partner con varios clientes en el
  mismo entorno.
- Verificá aislamiento con una cuenta real del grupo del cliente antes de dar la ingesta por
  cerrada — no falta a la regla del Paso 7 de esa skill aunque el objetivo final sea "solo" un
  dashboard.

## Fase 2 — Dashboard de negocio (delegar en `dynatrace-dashboards-negocio`)

Una vez que la ingesta está confirmada (dato fluyendo, campos con la cobertura esperada,
contexto de seguridad correcto si aplica), seguí el flujo de 6 pasos de esa skill tal cual —
diagnóstico de cobertura por endpoint, marca, layout de pilares, Business Flow opcional, apply.

Su Paso 0 ("auditar qué existe") y Paso 1 ("diagnosticar cobertura") van a menudo a encontrar
las mismas cosas que ya viste en la Fase 1 de acá — no es trabajo duplicado, es la misma
evidencia mirada con otro propósito (arquitectura vs. dato concreto de un endpoint).

## Punto de fricción real entre las dos skills: dtctl vs. REST

Las dos skills originales dan indicaciones distintas sobre la herramienta de ejecución, y esa
diferencia es real, no un error de una de las dos — depende del tenant y de si `dtctl` está
autenticado en esa sesión:

- `dynatrace-ingesta-openpipeline` fue escrita antes de confirmar `dtctl` en la máquina de
  trabajo y recomienda REST directo para los schemas `builtin:openpipeline.*`.
- `dynatrace-dashboards-negocio` se escribió DESPUÉS de usar `dtctl` extensivamente en
  producción real (ver su `references/dtctl-workflow.md`) y lo encontró plenamente capaz para
  get/apply/describe de esos mismos schemas, incluidos dashboards y Business Flow.

**Regla práctica para esta skill integral:** probá primero `dtctl get settings --schema
builtin:openpipeline.<kind>.<aspecto>` — si el contexto ya está autenticado (ver
`dtctl-contextos-disponibles` en memoria) es más simple y consistente que armar el roundtrip
REST a mano. Si `dtctl` no está disponible o falla contra ese schema puntual, caé al
procedimiento REST de `references/api.md` de `dynatrace-ingesta-openpipeline`. No asumas de
antemano cuál va a funcionar — ambas skills quedaron con información parcialmente distinta
porque se escribieron en momentos distintos del mismo tenant evolucionando.

## Checklist integral (de cero a dashboard entregado)

1. Inventariar ingesta existente (`dynatrace-ingesta-openpipeline` Paso 1).
2. Auditar antipatrones si es una ingesta que ya existía (Paso 2 de esa skill) — saltar si es
   100% nueva.
3. Definir identificador discriminante + crear bucket + security context + routing + pipeline +
   reglas de captura (Paso 3 de esa skill, o `references/ingesta-prerequisitos.md` de
   `dynatrace-dashboards-negocio` si es un proceso de negocio simple sin necesidad de
   aislamiento multicliente).
4. Verificar aislamiento con usuario real, si aplica.
5. Diagnosticar cobertura real de campos por endpoint (ambas skills coinciden en esta
   disciplina — no la saltees aunque la ingesta "parezca" completa).
6. Extraer/homologar marca del cliente.
7. Construir el dashboard de pilares.
8. Business Flow nativo si hay campo de correlación probado.
9. Aplicar todo con `dtctl --dry-run` + backup, o REST con backup si `dtctl` no cubre ese
   schema en este tenant.
