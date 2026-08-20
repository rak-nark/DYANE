# Playbook — montar el esquema en un cliente nuevo

Alta de un cliente externo en un tenant compartido: aislamiento de datos, catálogo de apps reducido y
solo consulta. Asume que la ingesta ya estampa `dt.security_context` (skill
`dynatrace-ingesta-openpipeline`).

**El orden importa.** Aditivo primero, restrictivo después, verificación al final.

---

## Fase 0 — Insumos

| Insumo | Sin esto |
|---|---|
| Nombre del **contexto de seguridad** | No hay boundary posible. Slug estable, minúsculas |
| **Management zone** del cliente | El alcance clásico queda abierto |
| **Cuenta de prueba** en el grupo del cliente | **No se puede cerrar la entrega** |
| **Tablas de Grail** que consume | Se termina otorgando de más |
| Ventana de aplicación | Es un cliente en producción |

**Verificá que la ingesta ya clasifica el dato**, antes de tocar IAM:

```
fetch bizevents, from: now()-30m | summarize count(), by:{dt.security_context}
```

Si el contexto del cliente no aparece, el problema es de ingesta. Pará acá.

---

## Fase 1 — Inventario del estado actual

**No diseñes sobre supuestos.** Listá lo que el grupo ya tiene y leé el `statementQuery` **completo**
de cada política atada.

```bash
GET /iam/v1/repo/environment/{env}/bindings
```

Filtrá por el grupo y, para cada política, buscá:

| Buscar | Trampa |
|---|---|
| `app-engine:apps:run` sin condición | Bloquea el allow-list (P1) |
| `document:documents:write` / `:delete` / `:admin` | T1 |
| `storage:system:read` | T2 |
| `storage:user.replays:read` | T2 |
| `DENY` sin condición que colisione con un ALLOW condicionado | T3 |
| `DENY` condicional sobre `storage:*` | T4 |
| Más de un boundary en un binding | T5 |

Anotá **de qué política viene cada permiso que sobra**. Esa lista es tu diseño.

---

## Fase 2 — Crear la política restringida

Solo si no existe ya una reutilizable. **Si ya la tenés de otro cliente, saltá a la fase 3** — ese es
el punto del diseño: una política, N boundaries.

Copiá el `statementQuery` de la política por defecto que vas a reemplazar y aplicá los cambios de
[`patrones.md`](patrones.md) (P1 y P3).

```bash
POST /iam/v1/repo/account/{acct}/policies
```

Verificá el parseo con un `GET`: que la condición `shared:app-id IN [...]` haya quedado bien y que
los DENY estén completos.

---

## Fase 3 — Boundary del cliente

Nivel **cuenta**. **Uno solo**, con las condiciones como líneas.

```bash
POST /iam/v1/repo/account/{acct}/boundaries
{ "name": "Customer Viewer <Cliente>",
  "boundaryQuery": "environment:management-zone IN (\"MZ-PROD-Customer-<Cliente>\");\nstorage:dt.security_context IN (\"<cliente>\");" }
```

---

## Fase 4 — Atar (aditivo, sin riesgo)

Si la política nueva es **subconjunto estricto** de la que reemplaza, atarla no otorga nada nuevo.
Se puede hacer sin ventana.

```bash
POST /iam/v1/repo/environment/{env}/bindings/{policyRestringida}/{grupo}
     { "boundaries": ["<boundaryUuid>"] }
```

Verificá:

```bash
GET /iam/v1/repo/environment/{env}/bindings/{policyRestringida}
```

---

## Fase 5 — Desatar (restrictivo)

**Esto es lo que cambia lo que ve el cliente.** Con la reversión escrita de antemano y en ventana
acordada.

```bash
# 1. respaldar
GET /iam/v1/repo/environment/{env}/bindings > BACKUP-bindings.json

# 2. desatar la política por defecto SOLO de este grupo
DELETE /iam/v1/repo/environment/{env}/bindings/{policyPorDefecto}/{grupo}   # → 204
```

Confirmá que **los otros grupos no se tocaron**:

```bash
GET /iam/v1/repo/environment/{env}/bindings/{policyPorDefecto}
```

Deben seguir todos los demás grupos.

**Reversión** (dos llamadas, tenelas listas):

```bash
POST   .../bindings/{policyPorDefecto}/{grupo}  -d '{"boundaries":["<boundary>"]}'
DELETE .../bindings/{policyRestringida}/{grupo}
```

---

## Fase 6 — Launchpad del grupo

Opcional pero es lo que hace que la entrega se vea terminada.

**Requiere `isPrivate: false` + environment-share.** Un direct-share al grupo **no alcanza**: la app
Launcher no monta un documento privado como home de grupo, cae al fallback *"Getting started with
Dynatrace"* y **no da ningún error**.

```bash
POST  /platform/document/v1/documents          # -F name -F type=launchpad -F content=@lp.json
POST  /platform/document/v1/environment-shares { "documentId": "...", "access": "read" }
PATCH /platform/document/v1/documents/{id}?optimistic-locking-version={v}   # -F isPrivate=false
POST  /platform/classic/environment-api/v2/settings/objects
      [{ "schemaId": "app:dynatrace.launcher:home.launchpad", "scope": "environment",
         "value": { "groupLaunchpads": [ { "launchpadId": "...", "userGroupId": "...", "isEnabled": true } ] } }]
```

> **Es UN solo objeto de settings por entorno** con un array `groupLaunchpads`. Al agregar el segundo
> cliente hay que hacer `PUT` del objeto completo con las dos entradas, **no crear otro objeto**.

Estructura del launchpad y validaciones del schema: ver el runbook de lockdown. Lo que más falla:
los bloques `cards` **no aceptan** `action.type: "openApp"` (solo `openExternalLink` con ruta
relativa), el bloque `links` exige `appearance` y `contentType`, y el contenedor exige
`horizontalLayoutWeight`.

Requiere **recarga forzada** (Ctrl+Shift+R): la app Launcher cachea.

---

## Fase 7 — Verificación con usuario real

**No opcional. No se sustituye por inspección de configuración.**

Iniciá sesión con la cuenta del cliente:

```
# 1. Audit log — esperado: 0 records
fetch dt.system.events, from: now()-2h | filter event.kind == "AUDIT_EVENT" | limit 10

# 2. Alcance de datos — esperado: solo su contexto
fetch bizevents, from: now()-30m | summarize count(), by:{dt.security_context}

# 3. Sus datos existen
fetch bizevents, from: now()-30m | filter dt.security_context == "<cliente>" | summarize count()
```

| Resultado | Significa |
|---|---|
| (1) devuelve filas | **Fuga crítica.** Parar y revisar el boundary |
| (2) muestra `null` u otro contexto | **Fuga crítica.** Parar |
| (2) solo el suyo | Aislamiento correcto |
| (3) devuelve 0 | Entra y no ve nada — revisar ingesta y compartición de tableros |

Y en la interfaz:

- [ ] El menú de aplicaciones muestra **solo** las del allow-list
- [ ] El launchpad del grupo carga como inicio
- [ ] Un tablero abre con la marca **Read-only**
- [ ] Guardar / duplicar / eliminar falla

> **`0 records` no es error de permisos.** Si la consulta corre y devuelve vacío, el permiso está
> concedido y el boundary filtró. Es el comportamiento correcto.

---

## Fase 8 — Cierre

- [ ] Backup de bindings y del `statementQuery` previo, guardados
- [ ] Comandos de reversión escritos, con los UUID reales
- [ ] Políticas exportadas y versionadas en git
- [ ] Runbook con todos los UUID (grupo, boundary, políticas, launchpad)
- [ ] **Limitaciones documentadas por escrito** para el cliente: DQL ad-hoc, descarga de resultados,
      tableros predefinidos visibles, creación de tableros clásicos. Enmarcadas como comportamiento
      de la plataforma **sin exposición de información**, respaldado por la verificación de la fase 7

Esa última línea es la que te protege si el cliente lo descubre después.

---

## Resumen: qué se reutiliza y qué no

| Elemento | ¿Por cliente? |
|---|---|
| Política restringida | **No** — una sirve para todos |
| Boundary | **Sí** — uno por cliente |
| Binding (política, grupo) + boundary | **Sí** — dos llamadas |
| Grupo | **Sí** |
| Management zone y contexto de seguridad | **Sí** |
| Launchpad | **Sí**, pero comparten un solo objeto de settings |

**Cliente nuevo ≈ un grupo, un boundary, dos llamadas de binding y un launchpad.** Si estás creando
una política por cliente, algo está mal en el diseño.
