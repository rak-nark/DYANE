# Playbook — replicar el esquema en un cliente nuevo

Para dar de alta un cliente final dentro de un tenant compartido, con aislamiento de datos y su
propia vista. El orden no es negociable: cada paso depende del anterior.

Marcá cada paso al completarlo. Saltarse el paso 8 es la causa más común de que un aislamiento
"aplicado" no aislara nada.

---

## Paso 0 — Insumos previos

Sin esto no arranques:

| Insumo | Por qué |
|---|---|
| **Identificador discriminante** | Qué campo del dato crudo distingue a este cliente: `agencyId`, dominio en `url.path`, `k8s.namespace.name`, `service.name`. Debe estar presente en **todos** los flujos que el cliente vaya a ver |
| **Retención pactada** | Define el bucket. Cambiarla después obliga a re-enrutar |
| **Alcance de datos** | Qué tablas necesita: bizevents, spans, logs, RUM. No concedas lo que no use |
| **Nombre del contexto** | Slug estable, minúsculas, sin espacios. Se usa en ingesta y en IAM; cambiarlo después rompe ambos |
| **Cuenta de prueba** | Un usuario real en el grupo del cliente. **Sin esto no se puede cerrar** |

**Verificá primero que el identificador exista en el dato:**

```
fetch <tabla>, from: now()-30m
| filter <identificador> == "<valor>"
| summarize n = count(), by:{event.provider, event.type}
```

Si devuelve 0, el identificador es el equivocado o el dato no está llegando. Resolvelo antes de
seguir — todo lo demás se construye sobre este supuesto.

---

## Paso 1 — Bucket

Primero el bucket, porque un `bucketAssignment` a un bucket inexistente hace que el dato caiga al
default en silencio.

```bash
POST /platform/storage/management/v1/bucket-definitions
{ "bucketName": "spans_<cliente>",
  "table": "spans",
  "displayName": "Spans <Cliente>",
  "retentionDays": 90 }
```

**Decisión de diseño — bucket propio o compartido.** No es obvia:

| | Bucket propio por cliente | Bucket compartido + security context |
|---|---|---|
| Aislamiento | Físico, más fácil de explicar en auditoría | Lógico, igual de efectivo (verificado) |
| Retención distinta por cliente | Sí | No |
| Mantenimiento | Un bucket más por cliente, y hay que sumarlo a cada política que restrinja por bucket | Ninguno |
| Consultas del cliente | Debe saber el nombre del bucket | Transparente |

**Por defecto: bucket compartido por entorno + `dt.security_context`.** Bucket propio solo si la
retención pactada difiere o si el contrato exige separación física demostrable.

---

## Paso 2 — Security context

La regla que estampa el contexto. Si ya aplicaste M1 (lookup), esto es **una fila en el CSV** y
saltás al paso 3.

Si el tenant todavía usa la cadena de reglas, agregá el procesador en la etapa `securityContext`
de **cada pipeline** por el que pase el dato del cliente:

```json
{ "id": "processor_SC_<CLIENTE>",
  "type": "securityContext",
  "matcher": "agencyId == \"<identificador>\"",
  "description": "SC_<cliente>",
  "enabled": true,
  "securityContext": {
    "value": { "type": "multiValueConstant",
               "multiValueConstant": ["<cliente>"] } } }
```

`multiValueConstant` acepta varios contextos: útil para que el dato pertenezca al cliente y a una
agrupación (`["<cliente>", "<grupo-regional>"]`), o para separar líneas de negocio del mismo cliente
(`["<cliente>", "<cliente>.empresas"]`).

> **Enumerá los pipelines afectados antes de empezar.** En el caso de referencia son 6. Olvidar uno
> deja al cliente sin visibilidad en ese flujo, sin ningún error visible.

---

## Paso 3 — Routing

Insertá la entrada **antes del catch-all**. Es lo que más se equivoca: una entrada después de un
`matcher: true` es código muerto.

```json
{ "enabled": true,
  "pipelineType": "custom",
  "pipelineId": "<objectId del pipeline destino>",
  "matcher": "<identificador> == \"<valor>\"",
  "description": "Route <cliente>" }
```

Verificá la posición releyendo el array completo y confirmando que ninguna entrada anterior tenga un
matcher que también capture este tráfico.

---

## Paso 4 — Métricas

Si el cliente va a tener dashboards, extraé las métricas ahora. Es más barato que consultar crudo y
se define una sola vez.

Patrón mínimo por dominio: **total**, **errores**, **duración**.

```
counterMetric        <dominio>.requests.total     (denominador)
counterMetric        <dominio>.requests.errors    (numerador)
valueMetric          <dominio>.requests.duration
```

En spans usá `samplingAwareCounterMetric` / `samplingAwareValueMetric`.

---

## Paso 5 — Verificar la ingesta

**Antes de tocar IAM.** Los cambios no son retroactivos: esperá una ventana de datos.

```
fetch <tabla>, from: now()-30m
| filter dt.security_context == "<cliente>"
| summarize n = count()
```

Debe devolver > 0. Si devuelve 0: el matcher no coincide, el pipeline no se está alcanzando (revisá
el orden del routing), o todavía no entró dato desde el cambio.

Y confirmá que no rompiste nada:

```
fetch <tabla>, from: now()-30m | summarize n = count(), by:{dt.security_context} | sort n desc
```

Los demás contextos deben mantener sus volúmenes.

---

## Paso 6 — Boundary IAM

Los boundaries viven a **nivel cuenta**, no entorno.

```bash
POST https://api.dynatrace.com/iam/v1/repo/account/{accountUuid}/boundaries
{ "name": "Customer Viewer <Cliente>",
  "boundaryQuery": "environment:management-zone IN (\"MZ-PROD-Customer-<Cliente>\");\nstorage:dt.security_context IN (\"<cliente>\");" }
```

**Una condición por línea, sin operadores lógicos.** Varias condiciones van dentro del **mismo**
boundary — nunca como dos boundaries separados.

> Dos boundaries en un mismo binding operan de forma independiente y los permisos que ninguno cubra
> **pueden quedar sin restricción**. Es la advertencia explícita de la documentación.

---

## Paso 7 — Grupo y políticas

```bash
# Asociar política + boundary al grupo (una llamada por política)
POST /iam/v1/repo/environment/{env}/bindings/{policyUuid}/{groupUuid}
     { "boundaries": ["<boundaryUuid>"] }

# Quitar una política del grupo
DELETE /iam/v1/repo/environment/{env}/bindings/{policyUuid}/{groupUuid}
```

`PUT /bindings/{policyUuid}` **no existe** (405). Se opera por par (política, grupo), lo cual evita
reescribir la lista completa de bindings del entorno.

**Concedé solo las lecturas de Grail que el cliente use.** Nunca:

| Permiso | Por qué no |
|---|---|
| `storage:system:read` | Es el audit log del tenant, con secretos en claro y configuración de otros clientes |
| `storage:user.replays:read` | Session Replay — grabación de pantalla del usuario final |
| `storage:application.snapshots:read` | Volcados de memoria |
| `storage:security.events:read` | Hallazgos de seguridad del tenant |

---

## Paso 8 — Verificación con usuario real

**No opcional. No se sustituye por inspección de configuración.**

Iniciá sesión con la cuenta del cliente y ejecutá:

```
# 1. No debe ver el audit log — resultado esperado: 0 records
fetch dt.system.events, from: now()-2h | filter event.kind == "AUDIT_EVENT" | limit 10

# 2. Solo su propio contexto — no debe aparecer `null` ni otro cliente
fetch <tabla>, from: now()-30m | summarize count(), by:{dt.security_context}

# 3. Sus datos existen
fetch <tabla>, from: now()-30m | filter dt.security_context == "<cliente>" | summarize count()
```

| Resultado | Significa |
|---|---|
| (1) devuelve filas | **Fuga crítica.** Parar. El boundary no está aplicado |
| (2) muestra `null` u otro contexto | **Fuga crítica.** Parar |
| (2) muestra solo el suyo | Aislamiento correcto |
| (3) devuelve 0 | El cliente entra y no ve nada — revisar pasos 2–5 |

Un `0 records` en (1) **no es error de permisos**: el permiso está concedido y el boundary filtró.
Esa es la señal correcta.

---

## Checklist de cierre

- [ ] Identificador verificado en el dato antes de configurar
- [ ] Bucket creado con la retención pactada
- [ ] Security context en **todos** los pipelines del flujo del cliente
- [ ] Routing insertado **antes** del catch-all
- [ ] Métricas extraídas
- [ ] Ingesta verificada por DQL (paso 5)
- [ ] Boundary a nivel cuenta, condiciones en **un solo** boundary
- [ ] Políticas asociadas, sin `storage:system:read` ni Session Replay
- [ ] **Verificado con usuario real** (paso 8)
- [ ] Configuración exportada y versionada (M8)
- [ ] Runbook de reversión escrito, con los UUID
