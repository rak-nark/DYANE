# Patrones probados

Tres patrones aplicados en producción. Se combinan: el cliente externo de solo consulta usa los tres.

---

## P1 — Allow-list de aplicaciones

**Problema.** Limitar qué apps ve un grupo en el catálogo, de forma que las apps nuevas de futuros
upgrades queden denegadas por defecto.

**Por qué no sirve el deny-list.** `DENY app-engine:apps:run WHERE shared:app-id = "X"` requiere una
línea por app (en un tenant típico, más de 110) y **toda app nueva queda visible**. El deny-list se
degrada con cada release.

**El obstáculo.** `Standard User` otorga `ALLOW app-engine:apps:run` **sin condición**. Como el
efectivo es la unión de los ALLOW, una lista blanca condicionada no recorta nada mientras esa
política siga atada. Un ALLOW condicionado **no puede** recortar un ALLOW incondicional.

**Solución.** Reemplazar `Standard User` para ese grupo por una copia propia idéntica salvo:

```
ALLOW app-engine:apps:run WHERE shared:app-id IN (
  "dynatrace.appshell",              // contenedor de la plataforma — OBLIGATORIO
  "dynatrace.launcher",              // launchpads / inicio — OBLIGATORIO
  "dynatrace.dashboards",            // lo que el cliente sí usa
  "dynatrace.classic.dashboards",
  "dynatrace.classic.user.settings"
);
ALLOW app-engine:functions:run;      // los tiles invocan funciones internas
```

Después: `DELETE` del binding de `Standard User` **solo para ese grupo**. Los demás grupos no se
tocan.

> **`dynatrace.appshell` y `dynatrace.launcher` son obligatorias.** Sin ellas la interfaz no carga.
> No son apps visibles para el usuario.

**Obtener los app-id reales del tenant:**

```
GET /platform/app-engine/registry/v1/apps?include-deactivated=false&include-non-runnable=false
```

**Verificación.** Iniciar sesión como usuario del grupo y abrir el menú de aplicaciones: deben
aparecer exactamente las de la lista.

**Límite conocido.** Dynatrace **no oculta los ítems del menú según permisos**; los muestra y falla
al invocarlos. La excepción es cuando la app destino no está disponible (ej. "Add to notebook" sale
atenuado si Notebooks no está en la lista).

---

## P2 — Aislamiento multicliente en un tenant compartido

**Problema.** N clientes finales en un mismo tenant, cada uno viendo solo lo suyo.

**Arquitectura.** Dos piezas que deben coincidir:

| Capa | Responsabilidad |
|---|---|
| **Ingesta** | Estampar `dt.security_context` en cada registro (ver skill `dynatrace-ingesta-openpipeline`) |
| **IAM** | Un boundary por grupo con `storage:dt.security_context IN ("<cliente>")` |

**La clave del diseño: una política, N boundaries.**

Como el boundary se ata al **binding** *(política, grupo)* y no a la política, la misma política
sirve a los N clientes:

```bash
# misma política, distinto grupo, distinto boundary
POST /iam/v1/repo/environment/{env}/bindings/{policyUuid}/{grupoClienteA}
     { "boundaries": ["<boundaryClienteA>"] }
POST /iam/v1/repo/environment/{env}/bindings/{policyUuid}/{grupoClienteB}
     { "boundaries": ["<boundaryClienteB>"] }
```

Cliente nuevo = un grupo + un boundary + dos llamadas. **Cero políticas nuevas.**

**El boundary** (nivel cuenta, una condición por línea, **uno solo por binding**):

```
environment:management-zone IN ("MZ-PROD-Customer-<Cliente>");
storage:dt.security_context IN ("<cliente>");
```

Las dos condiciones cubren ámbitos distintos: la primera acota el mundo clásico
(`environment:roles:*`), la segunda acota Grail (`storage:*`). Los permisos que ninguna cubre —
`document:*`, por ejemplo — quedan **sin acotar**, que es lo que permite al cliente leer los tableros
que se le comparten.

**Semántica verificada.** El boundary es *deny-by-default*: excluye contexto distinto **y campo
nulo**. Un cliente no ve los registros sin clasificar.

**Verificación obligatoria**, con cuenta real de cada cliente:

```
fetch bizevents, from: now()-30m | summarize count(), by:{dt.security_context}
```

Solo debe devolver filas del cliente. Si aparece `null` u otro contexto → parar.

---

## P3 — Cliente externo de solo consulta

**Problema.** El cliente ve sus tableros y nada más: no crea, no edita, no duplica, no elimina, no
comparte.

**Composición.** P1 + P2 + documentos en solo lectura.

### Política base

Copia de `Standard User` con tres cambios:

1. `app-engine:apps:run` → allow-list (P1)
2. Documentos en solo lectura
3. Fuera: Hub, Workflows, Davis Copilot, Email, escrituras de segmentos

```
// --- Documentos: SOLO LECTURA ---
ALLOW document:documents:read,
      document:environment-shares:read,
      document:environment-shares:claim,
      document:direct-shares:read;

// --- DENY explícitos: más fuertes que la ausencia de ALLOW ---
DENY document:documents:write;
DENY document:documents:delete;
DENY document:documents:admin;
DENY document:environment-shares:write;
DENY document:environment-shares:delete;
DENY document:direct-shares:write;
DENY document:direct-shares:delete;
DENY document:trash.documents:restore;
DENY document:trash.documents:delete;
```

> **Por qué DENY explícito y no solo ausencia de ALLOW.** Con políticas compartidas entre varios
> grupos, un DENY sobrevive a que alguien ate a futuro otra política que otorgue el permiso. La
> ausencia de ALLOW no sobrevive. Y los boundaries no aplican a los DENY, así que valen aunque el
> boundary esté mal.

### Lecturas de Grail acotadas

No uses `All Grail data read access` (T2). Otorgá solo lo que el cliente consulta:

```
ALLOW storage:bizevents:read;
ALLOW storage:spans:read;
ALLOW storage:metrics:read;
ALLOW storage:events:read;
ALLOW storage:entities:read;
ALLOW storage:smartscape:read;
ALLOW storage:buckets:read;        // necesario para 'fetch ..., bucket: {...}'
ALLOW storage:user.sessions:read;  // solo si consume RUM
ALLOW storage:user.events:read;

DENY storage:system:read;                  // audit log del tenant
DENY storage:application.snapshots:read;   // volcados de memoria
DENY storage:security.events:read;         // hallazgos de seguridad
DENY storage:user.replays:read;            // Session Replay — PII
```

### Preferencias del usuario

Que pueda cambiar tema e idioma sin tocar el entorno:

```
ALLOW settings:objects:write WHERE settings:scope startsWith 'user-'
      AND settings:schemaId IN ('builtin:user-settings','builtin:user-appfw-preferences');
DENY  settings:objects:write WHERE settings:scope not startsWith "user-";
```

**El DENY tiene que llevar la condición inversa.** Sin condición anula el ALLOW de arriba (T3).

### Lo que NO se puede

Sé explícito con el cliente sobre esto, y dejalo por escrito en el entregable:

| Comportamiento | Por qué no se puede |
|---|---|
| Escribir DQL ad-hoc en un tile | Los tiles corren con la sesión del usuario; no hay distinción entre DQL guardado y DQL tecleado |
| Descargar resultados o el tablero | Es el mismo `document:documents:read` que necesita para verlo |
| Ocultar los tableros predefinidos | `document:` no tiene atributos condicionales (T6) |
| Impedir crear tableros **clásicos** | En el módulo clásico no se separa consulta de creación. Si es requisito, quitar `dynatrace.classic.dashboards` del allow-list |

**Ninguno es exposición de información** siempre que el boundary esté verificado: el cliente solo
alcanza sus propios datos. Enmarcalo así.

**Si bloquear el DQL es requisito duro**, no hay solución por permisos — hay que cambiar el modelo de
entrega: reportes programados por workflow, o una app de AppEngine con el DQL en un *app function*
(server-side, no viaja al navegador). Ojo: el DQL en el código de UI de una app propia **sí** es
visible; solo el que está en el app function queda oculto.

### Página de inicio dedicada

Launchpad propio como aterrizaje del grupo. **Requiere `isPrivate: false` + environment-share** — un
direct-share al grupo no alcanza, la app Launcher no monta un documento privado como home de grupo y
cae al fallback sin dar error.

```bash
POST /platform/document/v1/documents        # -F type=launchpad
POST /platform/document/v1/environment-shares   { "documentId": "...", "access": "read" }
PATCH /platform/document/v1/documents/{id}?optimistic-locking-version={v}   # -F isPrivate=false
# + entrada en el schema app:dynatrace.launcher:home.launchpad
```

Costo asumido: al ser público, el nombre del launchpad se ve en "Browse all launchpads" de los demás
clientes. El contenido no les sirve, pero el nombre se expone.
