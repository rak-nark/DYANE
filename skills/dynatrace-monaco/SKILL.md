---
name: dynatrace-monaco
description: Procedimientos operativos para Dynatrace Configuration as Code via Monaco (CLI oficial) — descarga y verificación del binario, instalación, estructura de proyectos (manifest.yaml + configs + templates con Go templating), comandos deploy/download/delete/generate/account/convert, migración de proyectos Monaco 1.x a 2.x, logging (JSON, support archive, timestamps UTC), despliegue con imagen contenedor y buenas prácticas de orden de despliegue y tokens. Basada en documentación oficial de Dynatrace Docs. Úsala cuando pidan "configuration as code", "monaco cli", "monaco deploy", "monaco download", "monaco delete", "manifest.yaml", "convertir proyecto monaco a v2", "migrate monaco 1x a 2x", "desplegar configuración por código", "imagen docker de monaco", "monaco container image", "settings 2.0 con monaco", "orden de despliegue de configuraciones" o "crear oauth client / platform token para monaco".
---

# DYNATRACE MONACO (CONFIGURATION AS CODE)

Monaco es el CLI oficial de Dynatrace para gestionar la configuración de entornos como código
(Configuration as Code). Gestiona tanto la **Environment API (configuración clásica y Settings 2.0)**
como los **recursos de cuenta** (IAM: users, groups, policies y boundaries). Todo el ciclo se
conduce desde un proyecto local versionable y un manifiesto que enlaza proyectos con entornos.

## 1. Instalación y verificación del binario

### Descarga (Linux / macOS / Windows)

El binario y su checksum se descargan del release oficial de GitHub. Descarga ambos y verifica la
integridad antes de usar:

```bash
# Linux (amd64)
curl -L https://github.com/Dynatrace/dynatrace-configuration-as-code/releases/latest/download/monaco-linux-amd64 -o monaco-linux-amd64
curl -L https://github.com/Dynatrace/dynatrace-configuration-as-code/releases/latest/download/monaco-linux-amd64.sha256 -o monaco.sha256
shasum -c monaco.sha256          # → monaco-linux-amd64: OK
mv monaco-linux-amd64 monaco
chmod +x monaco
sudo mv monaco /usr/local/bin/
```

Para **arm64** se usa el sufijo `monaco-linux-arm64` con el mismo flujo de verificación,
renombrado a `monaco`. En Windows/macOS el patrón es análogo con los binarios `monaco-windows-*.exe`
o `monaco-darwin-*`. **Verifica siempre el checksum SHA-256 con `shasum -c` antes del primer uso.**

### Imagen contenedor (opcional)

Monaco se distribuye también como imagen OCI para usar sin instalar nada:

```bash
docker pull dynatrace/dynatrace-configuration-as-code:latest
```

Para **verificar la firma** de la imagen con cosign:

```bash
cosign verify --key cosign.pub dynatrace/dynatrace-configuration-as-code:[VERSION]
# ej:
cosign verify --key cosign.pub dynatrace/dynatrace-configuration-as-code:2.2.0
```

Ejecutar un deploy desde la imagen montando el proyecto dentro del contenedor:

```bash
docker run \
  --env PLATFORM_TOKEN="tu platform-token" \
  --mount type=bind,src="/tu/ruta/al/proyecto",target=/monaco \
  dynatrace/dynatrace-configuration-as-code:latest deploy -d manifest.yaml
```

Fuentes oficiales:
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation/download-monaco>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation/download-container-image>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation>

## 2. Estructura de un proyecto Monaco (manifest.yaml + configs)

Un proyecto v2 está compuesto por:

1. **`manifest.yaml`** — define los proyectos, grupos de entornos, entornos y autenticación.
2. **`configs/`** por tipo de configuración — cada carpeta contiene `*.json` (template con Go
   templating) y un `*.yaml` que declara la coordenada (`id`, `type`, `config`).
3. **Artefactos por proyecto** — los proyectos apuntan desde el manifest con `path`.

### Manifest (2.x)

```yaml
manifestVersion: 1.0
projects:
- name: my-slo-project
  path: project-example
environmentGroups:
- name: development
  environments:
  - name: development-environment
    url:
      type: environment
      value: DT_ENV_URL
    auth:
      platformToken:
        type: environment
        name: PLATFORM_TOKEN
```

La autenticación se referencia **por nombre de variable de entorno** y se inyecta en tiempo de
ejecución (nunca se comitean secretos):

```bash
# Linux
export DT_ENV_URL="https://<tu-tenant>.apps.dynatrace.com"
export PLATFORM_TOKEN="TuPlatformToken"

# Windows
$env:DT_ENV_URL="https://<tu-tenant>.apps.dynatrace.com"
$env:PLATFORM_TOKEN="TuPlatformToken"
```

### Coordenada de configuración (configs/<tipo>/xxx.yaml)

```yaml
configs:
- id: my-sample-slo
  config:
    name: mySampleSLO
    parameters:
      tags:
        type: list
        values: ["service:myService", "dt.owner:myTeam"]
    template: slo.json
    skip: false
  type: slo-v2
```

### Template con Go templating (slo.json)

```json
{
  "name": "{{ .name }}",
  "description": "Measures the proportion of successful service requests over time.",
  "tags": {{ .tags }},
  "criteria": [
    { "target": 95, "timeframeFrom": "now-7d", "timeframeTo": "now" }
  ],
  "customSli": {
    "filterSegments": [],
    "indicator": "timeseries { total=sum(dt.service.request.count), failures=sum(dt.service.request.failure_count) }, by: { dt.entity.service } | fieldsAdd sli=(((total[]-failures[])/total[])*(100)) | fieldsRemove total, failures"
  }
}
```

Los `{{ .param }}` se rellenan desde el bloque `parameters:` del YAML de la coordenada.

Fuentes oficiales:
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/get-started/get-started-with-dynatrace-configuration-for-monaco>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/get-started/get-started-with-configuration-deployment-for-monaco>

## 3. Comandos del CLI

### Deploy

```bash
monaco deploy [ARGS] [OPTIONS]
monaco deploy manifest.yaml                # despliega el proyecto completo
monaco deploy --dry-run manifest.yaml      # simula sin aplicar cambios
```

Sintaxis del log de un deploy exitoso:

```
time=... level=INFO msg="Deploying config" deploymentStatus=deploying ... coordinate.reference=my-slo-project:slo-v2:my-sample-slo
time=... level=INFO msg="Deployment successful" deploymentStatus=deployed ...
```

`--dry-run` valida manifest, autenticación y estructura **sin tocar el tenant**; es el gate de
seguridad recomendado antes de cualquier deploy real.

### Download

```bash
monaco download [ARGS] [OPTIONS]
```

Descarga la configuración existente del tenant hacia un proyecto local (deploy inverso). Filtros
por feature flags: `MONACO_FEAT_DOWNLOAD_FILTER` (y variantes `_SETTINGS`,
`_SETTINGS_UNMODIFIABLE`, `_CLASSIC_CONFIGS`) desactivan el filtrado de descarga. Número de
descargas concurrentes con `MONACO_CONCURRENT_REQUESTS` (ej. `15`). Dependencias entre
configuraciones con `MONACO_FEAT_FAST_DEPENDENCY_RESOLVER=true`.

### Delete

```bash
monaco delete [--manifest <file>] [--file <file>] [OPTIONS]
```

Elimina configuraciones declaradas en un manifest o archivo de borrado dedicado, por ejemplo
recursos IAM declarativos:

```yaml
delete:
- type: user
  email: the.user@dynatrace.com
- type: serviceUser
  name: Monaco service user
- type: group
  name: My Group
- type: policy
  name: My Policy
  level:
    type: account
- type: boundary
  name: My Boundary
```

### Generate

```bash
monaco generate [ARGS] [OPTIONS]
```

Genera artefactos a partir del proyecto: subcomandos `deletefile`, `graph` y `schema` (subcomando
que emite el esquema/gráfico de dependencias de las configuraciones).

### Account (recursos IAM de cuenta)

```bash
monaco account [ARGS] [OPTIONS]
```

Gestiona recursos de cuenta: `download`, `deploy` y `delete` para users, service users, groups,
policies y policy boundaries. Contrapartida de Settings/API a nivel de cuenta (no de tenant).

### Proxy

Monaco respeta variables de proxy estándar:

```bash
# Linux/macOS
HTTPS_PROXY=localhost:5000 monaco deploy example.yaml
# Windows
$env:HTTPS_PROXY="localhost:5000"
monaco deploy example.yaml
```

Fuente oficial: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/reference/commands-saas>

## 4. Migración de Monaco 1.x a 2.x

Los proyectos **1.x** usaban `environments.yaml` + carpetas por tipo; los **2.x** usan
`manifest.yaml` + grupos de entornos.

### Convertir un proyecto existente

```bash
monaco convert existing_v1_config/environments.yaml existing_v1_config -o converted_config
```

Estructura resultante:

```
existing_v1_config/            →    converted_config/
├── project/                        ├── project/
│   ├── application-web/            │   ├── application-web/
│   ├── auto-tag/                   │   ├── auto-tag/
│   ├── slo/                        │   ├── slo/
│   └── synthetic-monitor/          │   └── synthetic-monitor/
└── environments.yaml               └── manifest.yaml
```

### Diferencias clave 1.x vs 2.x

| Aspecto | 1.x | 2.x |
|---|---|---|
| Manifiesto | `environments.yaml` | `manifest.yaml` (con `manifestVersion`, `environmentGroups`) |
| Entornos | lista plana con `env-url` / `env-token-name` | grupos con `url.type: environment` + `auth.platformToken.name` |
| Variables | `${var}` estilo plantilla simple | Go templating `{{ .var }}` y `.Env.*` en manifest |
| Folders | por tipo de config directo | `projects[].path` + `configs/<tipo>` |

Ejemplo de mapeo `environments.yaml` → `manifest.yaml`:

```yaml
# 1.x
environment1:
- name: "Sample Environment"
- env-url: {{ .Env.DEMO_ENV_URL }}
- env-token-name: "DEMO_ENV_ACCESS_TOKEN"
```

```yaml
# 2.x
manifestVersion: "1.0"
projects:
- name: project
environmentGroups:
- name: default
  environments:
  - name: environment1
    url:
      type: environment
      value: DEMO_ENV_URL
    auth:
      token:
        name: DEMO_ENV_ACCESS_TOKEN
```

Fuente oficial: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/guides/migrating-to-v2>

## 5. Logging y troubleshooting

### Formatos y timestamps

- **Timestamps UTC:** `MONACO_LOG_TIME=utc monaco deploy manifest.yaml` (Windows:
  `$env:MONACO_LOG_TIME="utc"`).
- **Log estructurado JSON:** `MONACO_LOG_FORMAT=json monaco deploy manifest.yaml`.
- Campos base del JSON: `reference: "[project]:[type]:[ID]"`, `project`, `type`, `configID`,
  más campos de metadata por mensaje (`group`, `name`) y de error (`type`, `details`).

### Debug y soporte

- **Debug logging:** variable de logging verboso para consultas profundas.
- **Support archive:** `monaco --support-archive <command>` genera el paquete de diagnóstico
  oficial para reportar casos a Dynatrace Support.
- **Desactivar log a archivo:** flag de configuración para correr solo a consola.

Fuente oficial: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/reference/logging>

## 6. Go templating avanzado, orden de despliegue y recursos de cuenta

### Referencias entre configuraciones dentro del template

Se pueden componer `name` a partir de otra coordenada del mismo proyecto:

```yaml
configs:
- id: appRule
  config:
    name:
      configId: application
      configType: application-web
      property: name
      type: reference
    template: rule.json
    skip: false
  type:
    api: app-detection-rule
```

### Orden de despliegue

Guías oficiales que cubren patrones transversales al usarlo en producción:
- **Avanzado con Go templating** — lógica condicional/iteración en templates.
- **Orden de despliegue (ensure order)** — control de secuencia entre configuraciones dependientes.
- **Configurar NAM via Settings 2.0 API** — nuevo modelo de alertas por API de settings.
- **Migrar tipos de configuración deprecados** y **crear OAuth client / platform token** para el CLI.

Conseguir la token correcta es requisito previo: el CLI necesita `PLATFORM_TOKEN` (o client
credentials OAuth) según el tipo de recurso que se despliegue (Environment API vs recursos de
cuenta/IAM).

Fuente oficial: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/guides>

## 7. Requerimientos de hardware y capacidades

- **Memoria:** el binario requiere un mínimo de RAM notable durante `deploy`/`download`
  (verificar contra la documentación de referencia según el tamaño del proyecto).
- **CPU:** los tiempos de despliegue escalan con el número de configuraciones; usar
  `MONACO_CONCURRENT_REQUESTS` para paralelizar.
- **Tipos soportados:** Configuration API types + Settings 2.0 + recursos de cuenta
  (usuarios, grupos, políticas, boundaries).

## 8. Trazabilidad documental

Evidencia generada por `dtx skill draft` (11 fuentes oficiales verificadas contra la KB local):

- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation/download-monaco>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation/download-container-image>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/guides>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/reference/commands-saas>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/reference/logging>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/reference>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/guides/migrating-to-v2>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/get-started/get-started-with-dynatrace-configuration-for-monaco>
- <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/get-started/get-started-with-configuration-deployment-for-monaco>

El detalle completo de fuentes, scores y snippets está en `references/evidence.json`.