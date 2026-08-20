# API de IAM — endpoints, scopes y reversión

## Autenticación

IAM vive en **`https://api.dynatrace.com`**, no en el dominio del tenant. Cliente OAuth `dt0s02`,
token de 300 s.

```bash
dt_token() {
  curl -s -X POST "https://sso.dynatrace.com/sso/oauth2/token" \
    -d "grant_type=client_credentials" \
    -d "client_id=$DT_CID" -d "client_secret=$DT_CSEC" -d "scope=$1" \
  | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])"
}

iam() {  # $1=método $2=path, resto → curl
  local m="$1" p="$2"; shift 2
  curl -s -X "$m" "https://api.dynatrace.com${p}" \
    -H "Authorization: Bearer $(dt_token 'account-idm-read account-idm-write iam-policies-management')" \
    -H "Content-Type: application/json" -H "Accept: application/json" "$@"
}
```

**Scopes:** `account-idm-read`, `account-idm-write`, `iam-policies-management`.
El `resource` del token trae el account UUID: `urn:dtaccount:<uuid>`.

## Identidades y grupos

```bash
GET /iam/v1/accounts/{accountUuid}/groups
GET /iam/v1/accounts/{accountUuid}/users
GET /iam/v1/accounts/{accountUuid}/users/{email}     # ← por EMAIL, no por uid
```

El detalle de usuario devuelve `groups[]` con `groupName` y `uuid`. **Buscar por uid falla**:
`"Expected email to be email"`.

> **Revisá siempre los grupos por defecto.** Un usuario suele estar en `Default group with all
> users` además del suyo. Si ese grupo tuviera políticas atadas, se suman a las del cliente.
> Verificalo: debe devolver cero bindings.

## Políticas

```bash
# Listar por nivel
GET /iam/v1/repo/global/global/policies?page-size=500
GET /iam/v1/repo/account/{accountUuid}/policies?page-size=500
GET /iam/v1/repo/environment/{envId}/policies?page-size=500

# Leer una (trae statementQuery + statements parseados)
GET /iam/v1/repo/{level}/{id}/policies/{policyUuid}

# Crear
POST /iam/v1/repo/account/{accountUuid}/policies
     { "name": "...", "description": "...", "tags": [], "statementQuery": "ALLOW ...;" }

# Actualizar — REEMPLAZO COMPLETO
PUT  /iam/v1/repo/account/{accountUuid}/policies/{policyUuid}
     { "name": "...", "description": "...", "tags": [], "statementQuery": "..." }
```

- Las globales son **solo lectura**. Para modificar su comportamiento, copiá el `statementQuery`, creá
  una propia y **desatá la global** de ese grupo.
- El `PUT` devuelve **204 sin cuerpo**. Verificá con un `GET` posterior.
- La API parsea el `statementQuery` a `statements[]`. **Revisá ese parseo**: es donde ves si tu
  condición quedó como esperabas.

```bash
# Verificar el parseo
GET .../policies/{uuid} | python -c "
import sys,json; d=json.load(sys.stdin)
for s in d['statements']:
    c=''
    if s.get('conditions'):
        c=' WHERE '+' AND '.join(f\"{x['name']} {x['operator']} {x['values']}\" for x in s['conditions'])
    print(s['effect'], ','.join(s['permissions'])+c)"
```

## Boundaries — nivel CUENTA

```bash
GET  /iam/v1/repo/account/{accountUuid}/boundaries?page-size=100
POST /iam/v1/repo/account/{accountUuid}/boundaries
     { "name": "Customer Viewer <Cliente>",
       "boundaryQuery": "environment:management-zone IN (\"MZ-...\");\nstorage:dt.security_context IN (\"cliente\");" }
```

En `environment/{env}/boundaries` responde *"Cannot get requested resource"*. **Es normal: los
boundaries no existen a nivel entorno.**

## Bindings — la parte que importa

```bash
# Todos los bindings del entorno
GET /iam/v1/repo/environment/{envId}/bindings
# → { "policyBindings": [ { "policyUuid", "groups": [...], "boundaries": [...] } ] }

# Políticas atadas a un grupo
GET /iam/v1/repo/environment/{envId}/bindings/groups/{groupUuid}
# → { "policyUuids": [...] }     ← ojo: NO trae los boundaries

# Bindings de una política
GET /iam/v1/repo/environment/{envId}/bindings/{policyUuid}

# ATAR (política, grupo) con boundary
POST   /iam/v1/repo/environment/{envId}/bindings/{policyUuid}/{groupUuid}
       { "boundaries": ["<boundaryUuid>"] }
# → 200, cuerpo vacío

# DESATAR
DELETE /iam/v1/repo/environment/{envId}/bindings/{policyUuid}/{groupUuid}
# → 204
```

**`PUT /bindings/{policyUuid}` no existe** (405). Operar por par *(política, grupo)* es lo correcto:
evita reescribir la lista completa de bindings del entorno y no puede dañar a otros grupos.

Los endpoints `/iam/v2/...` **no existen** en esta API.

Para ver los boundaries de un grupo hay que ir por la lista completa y filtrar:

```bash
GET /iam/v1/repo/environment/{envId}/bindings | python -c "
import sys,json; G='<groupUuid>'
for pb in json.load(sys.stdin)['policyBindings']:
    if G in pb.get('groups',[]):
        print(pb['policyUuid'], pb.get('boundaries'))"
```

## Registry de aplicaciones

Para armar el allow-list de `shared:app-id` (dominio del **tenant**, no `api.dynatrace.com`):

```bash
GET https://{tenant}.apps.dynatrace.com/platform/app-engine/registry/v1/apps
    ?include-deactivated=false&include-non-runnable=false&include-all-app-versions=false
```

## Procedimiento de cambio seguro

Cinco pasos. Ninguno es opcional cuando el grupo es de un cliente externo.

**1. Respaldar.**

```bash
iam GET "/iam/v1/repo/environment/{env}/bindings" > BACKUP-bindings.json
iam GET "/iam/v1/repo/account/{acct}/policies/{uuid}" > BACKUP-policy.json
```

**2. Aplicar lo aditivo primero.** Atar la política nueva antes de desatar la vieja. Si la nueva es
un **subconjunto estricto** de la que reemplaza, atarla no otorga nada nuevo ni rompe nada — se puede
hacer en cualquier momento.

**3. Aplicar lo restrictivo después**, con la reversión escrita de antemano.

**4. Verificar el parseo** con el `GET` de la política.

**5. Verificar con usuario real.** Ver el bloque de verificación en el `SKILL.md`.

### Reversión

Dos llamadas. Tenelas escritas **antes** de aplicar:

```bash
# volver a atar la política original
iam POST "/iam/v1/repo/environment/{env}/bindings/{policyOriginal}/{grupo}" \
    -d '{"boundaries":["<boundaryUuid>"]}'
# desatar la nueva
iam DELETE "/iam/v1/repo/environment/{env}/bindings/{policyNueva}/{grupo}"
```

## Auditar quién cambió qué

Las políticas IAM **no tienen `modificationInfo`** (T7). El audit log del entorno registra los
cambios de **settings**; es gratis y retiene ~372 días:

```
fetch dt.system.events, from: now()-30d
| filter event.kind == "AUDIT_EVENT" and event.type != "GET"
| fields timestamp, event.type, event.provider, user.id, resource,
         details.dt.settings.schema_id, details.json_patch
| sort timestamp desc
```

Requiere `storage:system:read` — **que es justo el permiso que no se le da a un cliente externo**.

## Exportar para versionar

```bash
for U in $(iam GET "/iam/v1/repo/account/$ACCT/policies?page-size=500" \
           | python -c "import sys,json;[print(p['uuid']) for p in json.load(sys.stdin)['policies']]"); do
  iam GET "/iam/v1/repo/account/$ACCT/policies/$U" > "policies/$U.json"
done
iam GET "/iam/v1/repo/account/$ACCT/boundaries?page-size=100" > boundaries.json
iam GET "/iam/v1/repo/environment/$ENV/bindings"              > bindings.json
```

A git. Es el único historial confiable y hace revisables los cambios antes de aplicarlos.
