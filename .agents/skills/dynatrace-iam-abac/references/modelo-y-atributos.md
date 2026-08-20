# Modelo, sintaxis y atributos condicionales

## Anatomía de un statement

```
ALLOW <servicio>:<recurso>:<acción> WHERE <servicio>:<atributo> <operador> <valor>;
DENY  <servicio>:<recurso>:<acción>;
```

- **servicio** — `storage`, `settings`, `app-engine`, `document`, `automation`, `environment`…
- **recurso** — `objects`, `apps`, `documents`, `logs`, `workflows`…
- **acción** — `read`, `write`, `delete`, `admin`, `run`, `execute`, `set`, `claim`, `restore`
- **condición** — opcional; varias se unen **solo con `AND`** (no existe `OR` entre condiciones)

Comentarios con `//`. Cada statement termina en `;`. Se pueden agrupar permisos:

```
ALLOW settings:objects:read, settings:schemas:read;
```

### Operadores

| Operador | Uso |
|---|---|
| `=` / `!=` | Igualdad exacta |
| `<` / `>` | Comparación (fechas, horas) |
| `IN` / `NOT IN` | Lista de valores |
| `startsWith` / `NOT startsWith` | Prefijo |
| `MATCH` | Coincidencia por patrón |

### Precedencia

1. Se unen **todos los ALLOW** de todas las políticas atadas al grupo.
2. Se restan **todos los DENY**. **`DENY` siempre gana.**
3. Los **boundaries** acotan los ALLOW. **No aplican a los DENY.**

## Niveles de política

| Nivel | Ruta | Contenido |
|---|---|---|
| `global` | `/iam/v1/repo/global/global/policies` | Provistas por Dynatrace, **solo lectura**. Categorías: `LEGACY`, `DATA_ACCESS`, `INTEGRATIONS`, `DYNATRACE_ACCESS` |
| `account` | `/iam/v1/repo/account/{accountUuid}/policies` | `CUSTOM`, reutilizables entre entornos de la cuenta |
| `environment` | `/iam/v1/repo/environment/{envId}/policies` | `CUSTOM`, locales a un entorno |

Los **bindings** se hacen a nivel `account` o `environment`, y pueden atar políticas de cualquier
nivel. Lo normal: política en `account`, binding en `environment`.

## Policy templating

Parametriza una política para no duplicarla. Los valores se fijan **al hacer el binding**, no al
crear la política:

```
ALLOW storage:buckets:read WHERE storage:bucket-name = "${bindParam:bucket-name-param}";
```

Al atar, se envían los valores del parámetro. Si falta alguno → `400` listando esperados contra
recibidos.

**Limitaciones que importan:**

- No se pueden **agregar parámetros nuevos** a una política ya atada.
- La documentación es explícita: el templating **solo gestiona permisos de acceso**; no restringe el
  comportamiento de las aplicaciones ni las acciones de la interfaz.

**Cuándo usarlo y cuándo no.** Para el caso multicliente, el **boundary por binding ya resuelve** la
parametrización sin templating: la misma política atada a N grupos con N boundaries. Reservá el
templating para cuando necesites variar algo que el boundary no cubre — típicamente nombres de bucket
o de esquema dentro del propio statement.

## Policy boundaries

```
environment:management-zone IN ("MZ-PROD-Cliente");
storage:dt.security_context IN ("cliente");
```

Reglas de sintaxis:

- **Una condición por línea. Sin operadores lógicos.**
- Viven a **nivel cuenta**: `/iam/v1/repo/account/{accountUuid}/boundaries`
- Se atan al **binding**, no a la política

Combinación:

- **Dentro de un boundary:** las condiciones se combinan implícitamente. Si se repite el mismo nombre
  de condición, cada statement se multiplica por esas condiciones.
- **Varios boundaries en un binding:** operan **independientes**. Cada uno genera statements
  separados, y **los permisos que ningún boundary cubra pueden quedar sin restricción**. Es la
  advertencia explícita de la documentación. **Usá siempre un solo boundary por binding.**

Un atributo que no aplica a un permiso deja ese permiso **sin acotar** por esa condición. Ej.:
`storage:dt.security_context` no aplica a `document:documents:read` — por eso el cliente puede leer
los dashboards que le comparten aunque el boundary hable de contexto de seguridad.

## Referencia de atributos condicionales

Por namespace. **Un namespace ausente de esta lista no tiene atributos**, y por tanto sus permisos
son todo-o-nada.

### shared

`shared:app-id` — **el único** del namespace. Identifica la app de AppEngine.

Usado por `app-engine:apps:run`, `settings:objects:*`, `app-settings:objects:*`, `state:*`.

### storage

El namespace más rico, y el que gobierna el acceso a datos:

| Atributo | Uso típico |
|---|---|
| `storage:dt.security_context` | **Aislamiento multicliente** |
| `storage:bucket-name` | Restringir a buckets concretos |
| `storage:table-name` | Restringir tablas de Grail |
| `storage:query-consumption` | **Techo de escaneo por consulta** — control de costo |
| `storage:event.kind` / `event.type` / `event.provider` | Filtrar eventos |
| `storage:k8s.namespace.name` / `k8s.cluster.name` | Alcance por Kubernetes |
| `storage:host.name` / `dt.host_group.id` | Alcance por host |
| `storage:gcp.project.id` / `aws.account.id` / `azure.subscription` / `azure.resource.group` | Alcance por nube |
| `storage:frontend.name` | RUM |
| `storage:metric.key` | Métricas concretas |
| `storage:entity.type` | Tipo de entidad |
| `storage:log.source` | Origen de logs |
| `storage:fieldset-name` | Fieldsets |
| `storage:file-path` | Lookup tables (`startsWith "/lookups/"`) |

> **Nunca uses `DENY` condicional sobre `storage:*`.** La documentación advierte que un DENY
> condicional sobre tablas de Grail **se ejecuta incondicionalmente**.

### settings

`settings:schemaId`, `settings:schemaGroup`, `settings:scope`, `settings:entity.hostGroup`,
`settings:dt.security_context`, `environment:management-zone`, `shared:app-id`

Patrón útil — dejar que el usuario guarde solo sus preferencias:

```
ALLOW settings:objects:write WHERE settings:scope startsWith 'user-'
      AND settings:schemaId IN ('builtin:user-settings','builtin:user-appfw-preferences');
```

### environment

`environment:management-zone` — el puente al alcance clásico. Aplica a `environment:roles:*`.

### Otros namespaces con atributos

| Namespace | Atributos |
|---|---|
| `app-settings` | `settings:schemaId`, `shared:app-id` |
| `automation` | `automation:workflow-type` |
| `extensions` | `extension-name`, `host`, `host-group`, `ag-group`, `management-zone` |
| `openpipeline` | `event-type`, `event-provider` |
| `synthetic` | `synthetic:dt.security_context` |
| `state` | `shared:app-id` |
| `dev-obs` | `k8s.namespace.name`, `k8s.cluster.name`, `host.name`, `host.group`, `dt.entity.process_group`, `dt.process_group.detected_name` |
| `iam` | `service-user-email`, `service-user-owner`, `policyUuid`, `levelType`, `boundGroup`, `iam-param:entity-type`, `iam-param:entity-id` |

### Namespaces SIN atributos condicionales

**`document`** y **`unified-analysis`** son los que más se necesitan y no los tienen.

Consecuencia directa: los 14 permisos de `document:` son todo-o-nada. **No se puede** hacer que un
usuario lea unos documentos sí y otros no mediante política — eso se resuelve compartiendo el
documento, no con IAM. Tampoco se pueden ocultar los dashboards predefinidos de Dynatrace.

### Condiciones globales

Aplicables a **cualquier** statement:

| Atributo | Uso |
|---|---|
| `global:environmentId` | Multi-entorno |
| `global:userId` | Usuario concreto |
| `global:usernameDomain` | Por dominio de correo |
| `global:userGroup` | Grupos del solicitante |
| `global:date` / `date-time` / `time-of-day` / `week-day` | **Acceso por ventana temporal** |

Las temporales son la palanca menos usada y muy útil: acceso de proveedor limitado a horario
laboral, o política que expira sola.

## Los 14 permisos de `document:`

Referencia completa, porque es donde viven dashboards y notebooks:

| Permiso | Otorga |
|---|---|
| `document:documents:read` | Leer documentos |
| `document:documents:write` | **Crear y actualizar** |
| `document:documents:delete` | Eliminar |
| `document:documents:admin` | **Admin — puede saltarse las restricciones anteriores** |
| `document:environment-shares:read` / `:write` / `:claim` / `:delete` | Compartidos a nivel entorno |
| `document:direct-shares:read` / `:write` / `:delete` | Compartidos directos |
| `document:trash.documents:read` / `:delete` / `:restore` | Papelera |

Para un cliente de solo consulta: dejar los 5 de lectura (`documents:read`,
`environment-shares:read`, `environment-shares:claim`, `direct-shares:read`, `trash.documents:read`)
y **denegar explícitamente los otros 9**, incluido `documents:admin`.
