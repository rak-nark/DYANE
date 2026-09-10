# Research Brief: dynatrace-monaco

> Generado por `dtx skill draft` (determinista, 0 tokens IA).

| Campo | Valor |
|---|---|
| Capacidad solicitada | Dynatrace Configuration as Code via Monaco |
| Dominio | general |
| Consultas ejecutadas | 7 (multi-query) |
| Candidatos | 116 → 15 destilados |
| Fecha | 2026-09-09T23:22:29.030Z |

## 1. Classic environment v2 | Dynatrace Developer

- URL: <https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/>
- Dominio: general
- Score: 402

### Outline

- accessTokensActiveGateTokensClient​
- createToken​
- Parameters​
- Returns​
- Throws​
- getToken​
- Parameters​
- Returns​
- Throws​
- listTokens​
- Parameters​
- Returns​
- Throws​
- revokeToken​
- Parameters​
- Returns​
- Throws​
- accessTokensAgentTokensClient​
- getAgentConnectionToken​
- Returns​
- Throws​
- accessTokensApiTokensClient​
- createApiToken​
- Parameters​
- Returns​
- Throws​
- deleteApiToken​
- Parameters​
- Returns​
- Throws​

### Bloques de código

```
npm install @dynatrace-sdk/client-classic-environment-v2
```

```
import { accessTokensActiveGateTokensClient } from '@dynatrace-sdk/client-classic-environment-v2';
```

```
import { accessTokensActiveGateTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data =

  await accessTokensActiveGateTokensClient.createToken({

    body: {

      activeGateType: "ENVIRONMENT",

      name: "myToken",

    },

  });
```

```
import { accessTokensActiveGateTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data =

  await accessTokensActiveGateTokensClient.getToken({

    activeGateTokenIdentifier: "...",

  });
```

```
import { accessTokensActiveGateTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data =

  await accessTokensActiveGateTokensClient.listTokens();
```

```
import { accessTokensActiveGateTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data =

  await accessTokensActiveGateTokensClient.revokeToken({

    activeGateTokenIdentifier: "...",

  });
```

```
import { accessTokensAgentTokensClient } from '@dynatrace-sdk/client-classic-environment-v2';
```

```
import { accessTokensAgentTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data =

  await accessTokensAgentTokensClient.getAgentConnectionToken();
```

```
import { accessTokensApiTokensClient } from '@dynatrace-sdk/client-classic-environment-v2';
```

```
import { accessTokensApiTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data =

  await accessTokensApiTokensClient.createApiToken({

    body: { name: "tokenName", scopes: ["metrics.read"] },

  });
```

```
import { accessTokensApiTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data =

  await accessTokensApiTokensClient.deleteApiToken({

    id: "...",

  });
```

```
import { accessTokensApiTokensClient } from "@dynatrace-sdk/client-classic-environment-v2";



const data = await accessTokensApiTokensClient.getApiToken({

  id: "...",

});
```

### Snippet

> Classic environment v2 | Dynatrace Developer

## 2. Download and verify Dynatrace Monaco CLI — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation/download-monaco>
- Dominio: general
- Score: 218

### Outline

- Download and verify Dynatrace Monaco CLI
- How to download Monaco?
- 1. Download latest version of Dynatrace Monaco
- Linux
- macOS
- Windows
- What's next
- Related topics

### Bloques de código

```
curl -L https://github.com/Dynatrace/dynatrace-configuration-as-code/releases/latest/download/monaco-linux-amd64 -o monaco-linux-amd64
```

```
curl -L https://github.com/Dynatrace/dynatrace-configuration-as-code/releases/latest/download/monaco-linux-amd64.sha256 -o monaco.sha256
```

```
shasum -c monaco.sha256
```

```
monaco-linux-amd64: OK
```

```
mv monaco-linux-amd64 monaco
```

```
chmod +x monaco
```

```
sudo mv monaco /usr/local/bin/
```

```
curl -L https://github.com/Dynatrace/dynatrace-configuration-as-code/releases/latest/download/monaco-linux-arm64 -o monaco-linux-arm64
```

```
curl -L https://github.com/Dynatrace/dynatrace-configuration-as-code/releases/latest/download/monaco-linux-arm64.sha256 -o monaco.sha256
```

```
shasum -c monaco.sha256
```

```
monaco-linux-arm64: OK
```

```
mv monaco-linux-arm64 monaco
```

### Snippet

> Download and verify Dynatrace Monaco CLI — Dynatrace Docs

## 3. Guides to using Dynatrace Configuration as Code via Monaco — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/guides>
- Dominio: general
- Score: 113

### Outline

- Guides to using Dynatrace Configuration as Code via Monaco
- Advanced use cases with Go templating
- Create an OAuth client for Dynatrace Monaco CLI
- Create a platform token for Dynatrace Monaco CLI
- Migrate deprecated configuration types
- Migrate your configuration from Monaco 1.x to 2.x
- Ensure order of configuration deployment
- Configure NAM via Settings 2.0 API

### Snippet

> Guides to using Dynatrace Configuration as Code via Monaco — Dynatrace Docs

## 4. Work with Dynatrace Monaco CLI commands for Latest Dynatrace — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/reference/commands-saas>
- Dominio: general
- Score: 97

### Outline

- Work with Dynatrace Monaco CLI commands for Latest Dynatrace
- Deploy
- Usage
- Arguments
- Options
- Additional configuration via environment variables
- Specify proxy server
- Download
- Usage
- Options
- Arguments to download via manifest
- Arguments to download via URL
- Options
- Additional configuration via environment variables
- Filtering of downloaded files
- Concurrent downloads
- Dependency resolution
- Delete
- Usage
- Arguments
- Generate
- Usage
- Arguments
- Options
- deletefile
- graph
- schema
- Account
- Usage
- Arguments

### Bloques de código

```
monaco deploy [ARGS] [OPTIONS]
```

```
# Linux or Mac OS
HTTPS_PROXY=localhost:5000
monaco deploy example.yaml


# Windows
$env:HTTPS_PROXY="localhost:5000"
monaco deploy example.yaml
```

```
monaco download [ARGS] [OPTIONS]
```

```
# Linux or macOS
MONACO_FEAT_DOWNLOAD_FILTER=false
# MONACO_FEAT_DOWNLOAD_FILTER_SETTINGS=false
# MONACO_FEAT_DOWNLOAD_FILTER_SETTINGS_UNMODIFIABLE=false
# MONACO_FEAT_DOWNLOAD_FILTER_CLASSIC_CONFIGS=false
monaco download


# Windows
$env:MONACO_FEAT_DOWNLOAD_FILTER="false"
# $env:MONACO_FEAT_DOWNLOAD_FILTER_SETTINGS="false"
# $env:MONACO_FEAT_DOWNLOAD_FILTER_SETTINGS_UNMODIFIABLE="false"
# $env:MONACO_FEAT_DOWNLOAD_FILTER_CLASSIC_CONFIGS="false"
monaco download
```

```
# Linux or Mac OS
MONACO_CONCURRENT_REQUESTS=15
monaco download


# Windows
$env:MONACO_CONCURRENT_REQUESTS="15"
monaco download
```

```
# Linux or Mac OS
MONACO_FEAT_FAST_DEPENDENCY_RESOLVER=true
monaco download


# Windows
$env:MONACO_FEAT_FAST_DEPENDENCY_RESOLVER="true"
monaco download
```

```
monaco delete [--manifest <file>] [--file <file>] [OPTIONS]
```

```
monaco generate [ARGS] [OPTIONS]
```

```
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

```
monaco account [ARGS] [OPTIONS]
```

```
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

### Snippet

> Work with Dynatrace Monaco CLI commands for Latest Dynatrace — Dynatrace Docs

## 5. Logging reference for Dynatrace Configuration as Code via Monaco — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/reference/logging>
- Dominio: general
- Score: 96

### Outline

- Logging reference for Dynatrace Configuration as Code via Monaco
- Debug logging
- Log timestamps
- Support archive for troubleshooting
- Structured JSON logging
- Basic log fields
- Metadata log fields
- Disable logging to files

### Bloques de código

```
MONACO_LOG_TIME=utc monaco deploy manifest.yaml
```

```
$env:MONACO_LOG_TIME=utc
monaco deploy manifest.yaml
```

```
monaco --support-archive <command>
```

```
MONACO_LOG_FORMAT=json monaco deploy manifest.yaml
```

```
$env:MONACO_LOG_FORMAT=json
monaco deploy manifest.yaml
```

```
{
  "reference": "[project]:[type]:[ID]",
  "project": "[project]",
  "type":"[type]",
  "configID":"[ID]"
}
```

```
{
  "type":"[type]"
}
```

```
{
  "group": "[group]",
  "name": "[name]"
}
```

```
{
  "type": "[type of error]",
  "details": "[content of the error]"
}
```

### Snippet

> Logging reference for Dynatrace Configuration as Code via Monaco — Dynatrace Docs

## 6. Hybrid & Multicloud — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/azure/hybrid>
- Dominio: general
- Score: 96

### Outline

- Hybrid & Multicloud
- Query
- Permission fields
- API gateway REST APIS
- Query
- ID input
- Base entity fields
- Azure resource fields
- Azure entity fields
- Cloud entity fields
- API gateway stages
- Query
- ID input
- Base entity fields
- Azure resource fields
- Azure entity fields
- Cloud entity fields
- Access analyzer analyzers
- Query
- ID input
- Base entity fields
- Azure resource fields
- Azure entity fields
- Cloud entity fields
- Acm certificate summaries
- Query
- ID input
- Base entity fields
- Azure resource fields
- Azure entity fields

### Bloques de código

```
smartscapeNodes "AZURE_MICROSOFT_AWSCONNECTOR*"
| append [ smartscapeNodes "AZURE_MICROSOFT_AZUREARCDATA*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_AZURESTACK*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_AZURESTACKHCI*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_CONNECTEDVMWAREVSPHERE*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_EDGE_*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_EXTENDEDLOCATION*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_HYBRIDCLOUD*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_HYBRIDCOMPUTE*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_HYBRIDCONNECTIVITY*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_HYBRIDCONTAINERSERVICE*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_KUBERNETES_*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_KUBERNETESCONFIGURATION*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_RESOURCECONNECTOR*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_SCVMM*" ]
```

```
smartscapeNodes "AZURE_MICROSOFT_AWSCONNECTOR_APIGATEWAYRESTAPIS"
```

```
smartscapeNodes "AZURE_MICROSOFT_AWSCONNECTOR_APIGATEWAYSTAGES"
```

```
smartscapeNodes "AZURE_MICROSOFT_AWSCONNECTOR_ACCESSANALYZERANALYZERS"
```

```
smartscapeNodes "AZURE_MICROSOFT_AWSCONNECTOR_ACMCERTIFICATESUMMARIES"
```

```
smartscapeNodes "AZURE_MICROSOFT_AWSCONNECTOR_APPSYNCGRAPHQLAPIS"
```

```
smartscapeNodes "AZURE_MICROSOFT_RESOURCECONNECTOR_APPLIANCES"
```

```
smartscapeNodes "AZURE_MICROSOFT_KUBERNETES_CONNECTEDCLUSTERS"
```

```
smartscapeNodes "AZURE_MICROSOFT_AWSCONNECTOR_AUTOSCALINGAUTOSCALINGGROUPS"
```

```
smartscapeNodes "AZURE_MICROSOFT_SCVMM_AVAILABILITYSETS"
```

```
smartscapeNodes "AZURE_MICROSOFT_HYBRIDCLOUD_CLOUDCONNECTIONS"
```

```
smartscapeNodes "AZURE_MICROSOFT_HYBRIDCLOUD_CLOUDCONNECTORS"
```

### Snippet

> Hybrid & Multicloud — Dynatrace Docs

## 7. Migrate configuration from Monaco 1.x to 2.x — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/guides/migrating-to-v2>
- Dominio: general
- Score: 95

### Outline

- Migrate configuration from Monaco 1.x to 2.x
- Prerequisites
- Sample project
- Convert your project
- Differences between 1.x and 2.x
- Project folder
- From environments.yaml to manifest.yaml
- Configuration
- Environment overrides
- Deploy your converted project
- Related topics

### Bloques de código

```
existing_v1_config/
├── project/
    ├── application-web/
    ├── auto-tag/
    ├── slo/
    └── synthetic-monitor/
└── environments.yaml
```

```
monaco convert existing_v1_config/environments.yaml existing_v1_config -o converted_config
```

```
ls existing_v1_config-v2
```

```
converted_config/
├── project/
    ├── application-web/
    ├── auto-tag/
    ├── slo/
    └── synthetic-monitor/
└── manifest.yaml
```

```
monaco convert existing_v1_config/environments.yaml existing_v1_config -o converted_config
```

```
dir existing_v1_config-v2
```

```
converted_config/
├── project/
    ├── application-web/
    ├── auto-tag/
    ├── slo/
    └── synthetic-monitor/
└── manifest.yaml
```

```
existing_v1_config/
├── project/
    ├── application-web/
    ├── auto-tag/
    ├── slo/
    └── synthetic-monitor/
└── environments.yaml
```

```
converted_config/
├── project/
    ├── application-web/
    ├── auto-tag/
    ├── slo/
    └── synthetic-monitor/
└── manifest.yaml
```

```
environment1:
- name: "Sample Environment"
- env-url: {{ .Env.DEMO_ENV_URL }}
- env-token-name: "DEMO_ENV_ACCESS_TOKEN"
```

```
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

```
config:
- slo: "slo.json"


slo:
- name: "My App's Availability SLO"
- metricName: "my_app_synthetic_availability"
- syntheticId: "/project/synthetic-monitor/AppAvailabilityMonitor.id"
- thresholdTarget: "99.98"
- thresholdWarning: "99.99"
```

### Snippet

> Migrate configuration from Monaco 1.x to 2.x — Dynatrace Docs

## 8. Dynatrace Configuration as Code via Monaco — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/reference>
- Dominio: general
- Score: 89

### Outline

- Dynatrace Configuration as Code via Monaco
- Commands
- Deploy command
- Download command
- Delete command
- Generate command
- Global command flags
- Download account management resources
- Deploy account management resource
- Delete account management resources
- Hardware requirements
- Required memory
- CPU impact on deployment times
- Logging
- Verbose debug logging
- UTC timestamps
- Support archive
- Structured JSON logging
- Configuration types and access token permissions
- Configuration API types
- Settings 2.0

### Snippet

> Dynatrace Configuration as Code via Monaco — Dynatrace Docs

## 9. Networking — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/azure/networking>
- Dominio: general
- Score: 88

### Outline

- Networking
- Query
- Permission fields
- AAAA
- Query
- ID input
- Base entity fields
- Azure resource fields
- Azure entity fields
- Cloud entity fields
- Access control lists
- Query
- ID input
- Base entity fields
- Azure resource fields
- Azure entity fields
- Cloud entity fields
- Access rules
- Query
- ID input
- Base entity fields
- Azure resource fields
- Azure entity fields
- Cloud entity fields
- Afd custom domains
- Query
- ID input
- Base entity fields
- Azure resource fields
- Azure entity fields

### Bloques de código

```
smartscapeNodes "AZURE_MICROSOFT_CDN*"
| append [ smartscapeNodes "AZURE_MICROSOFT_DELEGATEDNETWORK*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_MANAGEDNETWORK*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_MANAGEDNETWORKFABRIC*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_NETWORK_*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_NETWORKFUNCTION*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_PEERING*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_PROGRAMMABLECONNECTIVITY*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_SERVICENETWORKING*" ]
| append [ smartscapeNodes "AZURE_MICROSOFT_VOICESERVICES*" ]
```

```
smartscapeNodes "AZURE_MICROSOFT_NETWORK_DNSZONES_AAAA"
```

```
smartscapeNodes "AZURE_MICROSOFT_MANAGEDNETWORKFABRIC_ACCESSCONTROLLISTS"
```

```
smartscapeNodes "AZURE_MICROSOFT_NETWORK_NETWORKSECURITYPERIMETERS_PROFILES_ACCESSRULES"
```

```
smartscapeNodes "AZURE_MICROSOFT_CDN_PROFILES_AFDCUSTOMDOMAINS"
```

```
smartscapeNodes "AZURE_MICROSOFT_NETWORK_APPLICATIONGATEWAYS"
```

```
smartscapeNodes "AZURE_MICROSOFT_NETWORK_APPLICATIONGATEWAYAVAILABLESSLOPTIONS"
```

```
smartscapeNodes "AZURE_MICROSOFT_NETWORK_APPLICATIONGATEWAYWEBAPPLICATIONFIREWALLPOLICIES"
```

```
smartscapeNodes "AZURE_MICROSOFT_NETWORK_APPLICATIONSECURITYGROUPS"
```

```
smartscapeNodes "AZURE_MICROSOFT_NETWORK_APPLICATIONGATEWAYS_AUTHENTICATIONCERTIFICATES"
```

```
smartscapeNodes "AZURE_MICROSOFT_NETWORK_BASTIONHOSTS"
```

```
smartscapeNodes "AZURE_MICROSOFT_CDN_PROFILES"
```

### Snippet

> Networking — Dynatrace Docs

## 10. Configuration as Code via Monaco overview — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco>
- Dominio: general
- Score: 81

### Outline

- Configuration as Code via Monaco overview
- Learn more

### Snippet

> Configuration as Code via Monaco overview — Dynatrace Docs

## 11. Install Dynatrace Configuration as Code via Monaco — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation>
- Dominio: general
- Score: 81

### Outline

- Install Dynatrace Configuration as Code via Monaco
- What's next
- Related topics

### Snippet

> Install Dynatrace Configuration as Code via Monaco — Dynatrace Docs

## 12. Get started with Dynatrace configuration for Monaco — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/get-started/get-started-with-dynatrace-configuration-for-monaco>
- Dominio: general
- Score: 70

### Outline

- Get started with Dynatrace configuration for Monaco
- What will you learn?
- Before you begin
- Prerequisites
- Get started with creating Dynatrace configuration for Monaco
- Expected result
- Congratulations!
- Next step
- Related topics

### Bloques de código

```
mkdir -p monaco-getting-started/project-example/slo
cd monaco-getting-started/project-example/slo
```

```
# Linux
touch slo.json slo.yaml


# Windows
New-Item slo.json
New-Item slo.yaml
```

```
{
  "name": "{{ .name }}",
  "description": "Measures the proportion of successful service requests over time.",
  "tags": {{ .tags }},
  "criteria": [
    {
      "target": 95,
      "timeframeFrom": "now-7d",
      "timeframeTo": "now"
    }
  ],
  "customSli": {
    "filterSegments": [],
    "indicator": "timeseries { total=sum(dt.service.request.count) ,failures=sum(dt.service.request.failure_count) }\n  , by: { dt.entity.service }\n  | fieldsAdd sli=(((total[]-failures[])/total[])*(100))\n | fieldsRemove total, failures"
  }
}
```

```
configs:
- id: my-sample-slo
  config:
    name: mySampleSLO
    parameters:
      tags:
        type: list
        values: ["service:myService",
          "dt.owner:myTeam"]
    template: slo.json
    skip: false
  type: slo-v2
```

```
# Linux
cd ../..
touch manifest.yaml


# Windows
cd ../..
New-Item manifest.yaml
```

```
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

```
# Linux
export DT_ENV_URL="https://<your-dynatrace-environment>.apps.dynatrace.com"
export PLATFORM_TOKEN="YourPlatformTokenValue"


# Windows
$env:DT_ENV_URL="https://<your-dynatrace-environment>.apps.dynatrace.com"
$env:PLATFORM_TOKEN="YourTokenValue"
```

```
monaco deploy --dry-run manifest.yaml
```

```
time=2025-09-01T09:06:23.506+02:00 level=INFO msg="Monaco version 2.24.0"
time=2025-09-01T09:06:23.507+02:00 level=INFO msg="Loading manifest \"{your full path to the file}\manifest.yaml\". Restrictions: groups=[], environments=[]" manifestPath="{your full path to the file}\manifest.yaml"
time=2025-09-01T09:06:23.535+02:00 level=INFO msg="Projects to be deployed (1):"
time=2025-09-01T09:06:23.536+02:00 level=INFO msg="  - my-slo-project"
time=2025-09-01T09:06:23.536+02:00 level=INFO msg="Environments to deploy to (1):"
time=2025-09-01T09:06:23.537+02:00 level=INFO msg="  - development-environment"
time=2025-09-01T09:06:23.537+02:00 level=INFO msg="Deploying configurations to environment \"development-environment\"..." environment.name=default environment.group=group
time=2025-09-01T09:06:23.556+02:00 level=INFO msg="Deploying config" deploymentStatus=deploying environment.name=development-environment environment.group=group coordinate.reference=my-slo-project:slo-v2:my-sample-slo coordinate.project=my-slo-project coordinate.type=slo-v2 coordinate.configId=my-sample-slo gid=0
time=2025-09-01T09:06:23.557+02:00 level=INFO msg="Deployment successful" deploymentStatus=deployed environment.name=development-environment environment.group=group coordinate.reference=my-slo-project:slo-v2:my-sample-slo coordinate.project=my-slo-project coordinate.type=slo-v2 coordinate.configId=my-sample-slo gid=0
time=2025-09-01T09:06:23.557+02:00 level=INFO msg="Deployment successful for environment 
... [truncado por dtx skill draft]
```

### Snippet

> Get started with Dynatrace configuration for Monaco — Dynatrace Docs

## 13. Get started with configuration deployment for Monaco — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/get-started/get-started-with-configuration-deployment-for-monaco>
- Dominio: general
- Score: 69

### Outline

- Get started with configuration deployment for Monaco
- What will you learn?
- Before you begin
- Prerequisites
- Get started with deploying a Dynatrace configuration
- Deploy a new configuration with Monaco
- Expected result
- Congratulations!
- Next steps
- Related topics

### Bloques de código

```
monaco deploy manifest.yaml
```

```
time=2025-09-01T09:08:23.506+02:00 level=INFO msg="Monaco version 2.24.0"
time=2025-09-01T09:08:23.507+02:00 level=INFO msg="Loading manifest \"{your full path to the file}\manifest.yaml\". Restrictions: groups=[], environments=[]" manifestPath="{your full path to the file}\manifest.yaml"
time=2025-09-01T09:08:23.535+02:00 level=INFO msg="Projects to be deployed (1):"
time=2025-09-01T09:08:23.536+02:00 level=INFO msg="  - my-slo-project"
time=2025-09-01T09:08:23.536+02:00 level=INFO msg="Environments to deploy to (1):"
time=2025-09-01T09:08:23.537+02:00 level=INFO msg="  - development-environment"
time=2025-09-01T09:08:23.537+02:00 level=INFO msg="Deploying configurations to environment \"development-environment\"..." environment.name=default environment.group=group
time=2025-09-01T09:08:23.556+02:00 level=INFO msg="Deploying config" deploymentStatus=deploying environment.name=development-environment environment.group=group coordinate.reference=my-slo-project:slo-v2:my-sample-slo coordinate.project=my-slo-project coordinate.type=slo-v2 coordinate.configId=my-sample-slo gid=0
time=2025-09-01T09:08:23.557+02:00 level=INFO msg="Deployment successful" deploymentStatus=deployed environment.name=development-environment environment.group=group coordinate.reference=my-slo-project:slo:my-sample-slo coordinate.project=my-slo-project coordinate.type=slo-v2 coordinate.configId=my-sample-slo gid=0
time=2025-09-01T09:08:23.557+02:00 level=INFO msg="Deployment successful for environment 'de
... [truncado por dtx skill draft]
```

### Snippet

> Get started with configuration deployment for Monaco — Dynatrace Docs

## 14. Download Monaco container image — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/monaco/installation/download-container-image>
- Dominio: general
- Score: 68

### Outline

- Download Monaco container image
- How to download the Monaco container image
- Download Monaco container image
- Verify container image signature
- What's next
- Related topics

### Bloques de código

```
docker pull dynatrace/dynatrace-configuration-as-code:latest
```

```
docker run \
--env PLATFORM_TOKEN=”your Dynatrace platform-token” \
--mount type=bind,src="/your/path/to/project",target=/monaco \
dynatrace/dynatrace-configuration-as-code:latest deploy -d manifest.yaml
```

```
cosign verify --key cosign.pub dynatrace/dynatrace-configuration-as-code:[VERSION]
```

```
cosign verify --key cosign.pub dynatrace/dynatrace-configuration-as-code:2.2.0
```

### Snippet

> Download Monaco container image — Dynatrace Docs

## 15. Configure automated notifications using Terraform and Configuration as Code — Dynatrace Docs

- URL: <https://docs.dynatrace.com/docs/deliver/configuration-as-code/terraform/tutorials/terraform-tutorial-set-up-automated-notification>
- Dominio: general
- Score: 68

### Outline

- Configure automated notifications using Terraform and Configuration as Code
- Prerequisites
- What will you learn
- Steps
- Build Terraform configuration
- Modify Terraform configuration
- Delete your configuration

### Bloques de código

```
locals {
event_name = "Authentication Service: High Response Time"
}


resource "dynatrace_davis_anomaly_detectors" "Authentication_Service_High_Response_Time" {
enabled     = true
source      = "Anomaly Detection"
title       = "Authentication Service: High Response Time"
description = "Raises an event if my service response time performance decreases"
analyzer {
   name = "dt.statistics.ui.anomaly_detection.StaticThresholdAnomalyDetectionAnalyzer"
   input {
      analyzer_input_field {
      key   = "query"
      value =<<-EOT
         timeseries avg(dt.service.request.response_time), by:{dt.entity.service}
         | fieldsAdd name=entityName(dt.entity.service)
         | filter in(name, "AuthenticationService")
      EOT
      }
      analyzer_input_field {
      key   = "threshold"
      value = "3000000"
      }
      analyzer_input_field {
      key   = "alertCondition"
      value = "ABOVE"
      }
      analyzer_input_field {
      key   = "alertOnMissingData"
      value = "false"
      }
      analyzer_input_field {
      key   = "violatingSamples"
      value = "3"
      }
      analyzer_input_field {
      key   = "slidingWindow"
      value = "30"
      }
      analyzer_input_field {
      key   = "dealertingSamples"
      value = "15"
      }
   }
}
event_template {
   properties {
      property {
      key   = "dt.source_entity"
      value = "{dims:dt.entity.service}"
      }
      property {
      key   = "event.type"
      value = "PERFORMANCE_EVENT"
    
... [truncado por dtx skill draft]
```

```
Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
+ create


Terraform will perform the following actions:


# dynatrace_automation_workflow.Authentication_Service_Email_Notification will be created
+ resource "dynatrace_automation_workflow" "Authentication_Service_Email_Notification" {
      + id      = (known after apply)
      + private = false
      + title   = "Authentication Service: Email Notification"
      + type    = "SIMPLE"


      + tasks {
         + task {
            + action      = "dynatrace.email:send-email"
            + active      = true
            + description = "Send email"
            + input       = jsonencode(
                  {
                     + bcc            = []
                     + cc             = [
                        + "otherteam@mycompany.com",
                        ]
                     + content        = <<-EOT
                           {{event()["event.description"]}}
                           An alert has been raised, impacting the service:


                           Details:
                           Status:             {{event()["event.status"]}}
                           Id:                 {{event()["event.id"]}}
                           Time:               {{event()["timestamp"]}}
                           Category:           {{event()["event.category"]}}
                           Impacted service:   {{event()["dt.ent
... [truncado por dtx skill draft]
```

```
dynatrace_automation_workflow.Authentication_Service_Email_Notification: Creating...


dynatrace_davis_anomaly_detectors.Authentication_Service_High_Response_Time: Creating...


dynatrace_davis_anomaly_detectors.Authentication_Service_High_Response_Time: Creation complete after 2s [id=************]


dynatrace_automation_workflow.Authentication_Service_Email_Notification: Creation complete after 5s [id=************]


Apply complete! Resources: 2 added, 0 changed, 0 destroyed.
```

```
dynatrace_automation_workflow.Authentication_Service_Email_Notification: Refreshing state... [id=************]


dynatrace_davis_anomaly_detectors.Authentication_Service_High_Response_Time: Refreshing state... [id=************]


No changes. Your infrastructure matches the configuration.


Terraform has compared your real infrastructure against your configuration and found no differences, so no changes are needed.
```

```
dynatrace_automation_workflow.Authentication_Service_Email_Notification: Modifying... [id=************]
dynatrace_automation_workflow.Authentication_Service_Email_Notification: Modifications complete after 3s [id=************]
Apply complete! Resources: 0 added, 1 changed, 0 destroyed.
```

```
dynatrace_automation_workflow.Authentication_Service_Email_Notification: Refreshing state... [id=************]


dynatrace_davis_anomaly_detectors.Authentication_Service_High_Response_Time: Refreshing state... [id=************]


No changes. Your infrastructure matches the configuration.


Terraform has compared your real infrastructure against your configuration and found no differences, so no changes are needed.
```

```
dynatrace_davis_anomaly_detectors.Authentication_Service_High_Response_Time: Destroying... [id= ************]


dynatrace_automation_workflow.Authentication_Service_Email_Notification: Destroying... [id= ************]


dynatrace_davis_anomaly_detectors.Authentication_Service_High_Response_Time: Destruction complete after 0s


dynatrace_automation_workflow.Authentication_Service_Email_Notification: Destruction complete after 1s


Destroy complete! Resources: 2 destroyed.
```

### Snippet

> Configure automated notifications using Terraform and Configuration as Code — Dynatrace Docs
