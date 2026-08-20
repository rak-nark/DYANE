# Las trampas

Siete casos con evidencia de producción. Cada uno costó tiempo real de diagnóstico.

---

## T1 — Los dashboards Gen3 son documentos, no settings

**Síntoma.** Una política que deniega exhaustivamente escrituras de settings, storage, openpipeline,
automation y extensions — y aun así el cliente crea, edita, duplica y elimina tableros.

**Causa.** `Standard User` otorga sin condición:

```
ALLOW document:documents:read, document:documents:write, document:documents:delete, ...
```

Los **dashboards y notebooks Gen3 se almacenan como documentos**, no como objetos de settings.
`DENY settings:objects:write` no los toca.

**Por qué se escapa.** Es contraintuitivo. Uno espera que los tableros se gobiernen con permisos de
`settings`. Que sean documentos es un detalle de implementación que no está señalizado.

**Corrección.** Denegar los 9 permisos de escritura de `document:` — incluido `documents:admin`, que
puede saltarse el resto:

```
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

**Cómo detectarlo.** Buscá `document:documents:write` en el `statementQuery` de cada política atada
al grupo. Si aparece en un ALLOW y no hay DENY que lo contrarreste, el grupo puede crear tableros.

---

## T2 — `All Grail data read access` incluye el audit log

**Síntoma.** Ninguno visible. Ese es el problema.

**Causa.** La política global otorga las 14 lecturas de storage, entre ellas:

| Permiso | Qué expone |
|---|---|
| `storage:system:read` | `dt.system.events` = **audit log del tenant** |
| `storage:user.replays:read` | Session Replay = grabación de pantalla del usuario final |
| `storage:application.snapshots:read` | Volcados de memoria |
| `storage:security.events:read` | Hallazgos de seguridad |

El audit log trae `details.json_before` / `json_patch` / `json_after` de cada cambio de
configuración. **Ahí hay secretos en claro** — credenciales embebidas en cuerpos de monitores HTTP,
por ejemplo — y la configuración de los demás clientes del tenant. Retención ~372 días.

**Atenuante verificado.** Los registros de auditoría llevan `dt.security_context = "AUDIT_EVENT"`, y
el boundary es deny-by-default, así que un grupo con boundary **no los ve**. Comprobado con usuario
real: `0 records`.

**Por qué corregirlo igual.** Porque el aislamiento queda dependiendo de que el boundary esté bien
puesto en **cada** grupo. Un grupo nuevo sin boundary, o con el boundary mal escrito, expone el
tenant completo. Con el permiso ausente, da igual el boundary.

**Corrección.** Reemplazar la política global por una propia con solo las lecturas que el cliente
usa, más DENY explícitos de las cuatro peligrosas.

---

## T3 — Un DENY sin condición mata un ALLOW condicionado

**Síntoma.** El cliente no puede cambiar el tema a oscuro, ni el idioma, ni la zona horaria. La app
User Settings abre pero no persiste nada.

**Causa.** `Standard User` otorga condicionado:

```
ALLOW settings:objects:write WHERE settings:scope startsWith 'user-'
      AND settings:schemaId IN ('builtin:user-settings','builtin:user-appfw-preferences');
```

Y una política propia denegaba sin condición:

```
DENY settings:objects:write;
```

Como `DENY` gana siempre y este no tiene condición, **anula también el caso permitido**.

**Corrección.** Condicionar el DENY para excluir el ámbito legítimo:

```
DENY settings:objects:write WHERE settings:scope not startsWith "user-";
```

**Regla general.** Antes de escribir un `DENY` sin condición, buscá si algún ALLOW condicionado de
otra política cubre un caso que sí querés permitir. Si existe, tu DENY tiene que llevar la condición
inversa.

---

## T4 — DENY condicional sobre Grail se ejecuta incondicionalmente

**Síntoma.** Se escribe `DENY storage:logs:read WHERE <algo>` esperando denegar parcialmente, y el
usuario pierde el acceso a logs **por completo**.

**Causa.** Documentado por Dynatrace: *"Conditional DENY with Grail tables executes
unconditionally."* La condición se ignora.

**Corrección.** Nunca uses `DENY` condicional sobre `storage:*`. Para limitar parcialmente el acceso
a datos, **no deniegues: otorgá solo lo que corresponde** (allow-list) y usá el **boundary** para el
alcance.

No aplica a `settings:*` (no es tabla Grail), que sí honra la condición — verificado en producción
con el caso de T3.

---

## T5 — Dos boundaries en un binding pueden abrir acceso

**Síntoma.** Se agregan boundaries pensando en restringir más, y algunos permisos quedan **sin
restricción alguna**.

**Causa.** Varios boundaries sobre un mismo binding operan **independientes**. Cada uno genera sus
propios statements. Si el boundary A restringe por hostname y el B por contexto de seguridad, y
ninguno aplica a un permiso dado, **ese permiso queda sin acotar**.

**Corrección.** **Un solo boundary por binding.** Varias condiciones van como líneas dentro del mismo
boundary:

```
environment:management-zone IN ("MZ-PROD-Cliente");
storage:dt.security_context IN ("cliente");
```

---

## T6 — `document:` no tiene atributos condicionales

**Síntoma.** Se quiere ocultar los dashboards predefinidos de Dynatrace, o permitir leer unos
documentos sí y otros no. No hay forma.

**Causa.** El namespace `document:` figura en la referencia con **cero atributos condicionales**. Sus
14 permisos son todo-o-nada.

**Qué sí se puede.** Controlar el acceso **por documento**, compartiéndolo (o no) con el grupo. El
control es de compartición, no de política.

**Qué no se puede.** Ocultar los tableros de plantilla del catálogo. Se ven, y salen vacíos porque el
cliente no tiene acceso a los datos que los alimentan. No hay palanca.

**Relacionado.** Tampoco existe permiso que separe *ver* un tablero de *editar un tile* dentro de él.
Editar un tile en memoria no consume permiso — pasa en el navegador. Lo único que consume permiso es
guardar. Por eso el botón sigue apareciendo aunque la acción falle.

---

## T7 — Las políticas IAM no tienen historial

**Síntoma.** "¿Quién cambió esto y cuándo?" — no hay respuesta por API.

**Causa.** El objeto de política devuelve `{uuid, name, description, tags, statementQuery,
statements, category}`. **Sin `modificationInfo`.** Ni autor ni fecha. Los endpoints de audit log a
nivel cuenta no existen, y el scope `auditLogs.read` se le deniega a los clientes OAuth `dt0s02`.

**Mitigación 1 — el audit log del entorno.** Gratis y con ~372 días de retención:

```
fetch dt.system.events, from: now()-30d
| filter event.kind == "AUDIT_EVENT" and event.type != "GET"
| fields timestamp, event.type, user.id, resource,
         details.dt.settings.schema_id, details.json_patch
| sort timestamp desc
```

Registra cambios de **settings**. Los cambios de IAM a nivel cuenta pueden no aparecer.

**Mitigación 2 — políticas como código.** Exportá el `statementQuery` a archivos versionados en git.
Es el único historial confiable, y además hace revisables los cambios antes de aplicarlos.

---

## Checklist de auditoría

Con estas siete preguntas se detecta la mayoría de los problemas:

- [ ] ¿Alguna política atada otorga `document:documents:write` o `:admin`? → T1
- [ ] ¿Alguna otorga `storage:system:read`, `user.replays:read`, `application.snapshots:read` o `security.events:read`? → T2
- [ ] ¿Hay algún `DENY` sin condición que colisione con un ALLOW condicionado? → T3
- [ ] ¿Hay algún `DENY` condicional sobre `storage:*`? → T4
- [ ] ¿Algún binding tiene más de un boundary? → T5
- [ ] ¿Se está intentando resolver con IAM algo que es de compartición de documentos? → T6
- [ ] ¿Está el `statementQuery` versionado fuera de Dynatrace? → T7
