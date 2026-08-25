---
name: dynatrace-kubernetes
description: Observabilidad integral de Kubernetes y OpenShift en Dynatrace (clusters, nodos, namespaces, workloads, pods, servicios, eventos, métricas cAdvisor/Prometheus, Dynatrace Operator y optimización de recursos). Úsala cuando el usuario pida "monitorear kubernetes", "clusters k8s", "workloads o pods en dynatrace", "alertas kubernetes", "troubleshooting k8s", "cAdvisor o prometheus en k8s", "OOMKilled pods", "Dynatrace Operator", "configurar monitoreo de cluster", "analizar nodos k8s", o "utilización de recursos k8s".
---

# Observabilidad y Monitoreo de Kubernetes en Dynatrace

Guía técnica y operativa para la administración, diagnóstico, configuración y optimización de clusters, nodos, cargas de trabajo (workloads), pods y servicios en Kubernetes/OpenShift mediante Dynatrace (plataforma Grail, AppEngine y Dynatrace Operator).

---

## 1. Arquitectura y Experiencia de Kubernetes en Dynatrace

Dynatrace proporciona visibilidad unificada de plataformas de contenedores mediante la **New Kubernetes Experience** (respaldada por Grail y AppEngine) y el modelo semántico Smartscape ([Smartscape - Kubernetes](https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/k8s), [Kubernetes](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app)).

### Jerarquía de Objetos en Explorer
El módulo **Kubernetes** organiza los recursos en una jerarquía continua:
- **Clusters:** Visión global de capacidad, dimensionamiento, CPU/memoria asignables y estado de salud general.
- **Nodes:** Hosts físicos o instancias cloud que ejecutan los pods; análisis de carga, utilización de memoria/CPU y eventos a nivel nodo.
- **Namespaces:** Límites lógicos de aislamiento de recursos y agrupación de cargas de trabajo.
- **Workloads:** Deployments, DaemonSets, StatefulSets, CronJobs y Jobs gestionados.
- **Pods y Containers:** Unidades atómicas de ejecución, monitoreadas a nivel de proceso con OneAgent o a nivel de contenedor mediante cAdvisor.
- **Services:** Abstracción de red (`ClusterIP`, `NodePort`, `LoadBalancer`, `ExternalName`, `Headless`) con mapeo directo de endpoints y pods atendidos ([Monitor Kubernetes/OpenShift services](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-services-kubernetes)).

### Requisitos y Activación
1. **Entorno:** Dynatrace SaaS potenciado por Grail y AppEngine con licencia DPS (**Kubernetes Platform Monitoring** en Rate Card) ([Kubernetes Platform Monitoring](https://docs.dynatrace.com/docs/license/capabilities/container-monitoring/kubernetes-platform-monitoring)).
2. **ActiveGate:** Versión 1.327+ para *Kubernetes Enhanced Object Visibility* (versiones anteriores operan en modo compatibilidad clásica) ([Kubernetes](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app)).
3. **Habilitación Global o por Cluster:**
   - Global: Navegar a **Settings** > **Collect and capture** > **Cloud and virtualization** > **Kubernetes app** > Activar **New Kubernetes experience** ([Enable Kubernetes experience for existing clusters](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/enable-k8s-experience/existing-clusters)).
   - Específica: En la app **Kubernetes**, seleccionar **Activation pending** y hacer clic en **Activate** para los clusters seleccionados.

---

## 2. Diagnóstico y Troubleshooting de Cargas de Trabajo (Workloads) y Nodos

Dynatrace Intelligence evalúa automáticamente el estado de salud de los recursos (código de colores verde/amarillo/rojo) basándose en alertas y umbrales de rendimiento ([Troubleshoot common health problems of Kubernetes workloads](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/troubleshoot-health-problems), [Assess and troubleshoot cluster health](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/cluster-health)).

### Flujo de Diagnóstico de Workloads Afectados
1. **Identificación:** En la app **Kubernetes**, hacer clic en el contador rojo de la tarjeta de Workloads para filtrar cargas de trabajo con problemas activos.
2. **Modo Problema:** Al ingresar al detalle del workload (ej. `prom-problem-sim`), seleccionar la alerta activa (como **CPU usage close to limits** o **Memory saturation**).
3. **Correlación de Recursos y Utilización:**
   - La pestaña **Utilization** superpone automáticamente la ventana temporal del problema sobre las curvas de CPU/Memoria frente a `requests` y `limits`.
   - Identificar CPU Throttling o consumo próximo al 100% del límite asignado.
4. **Análisis de Eventos y OOMKilled:**
   - En la pestaña **Events**, revisar la secuencia temporal de eventos del contenedor.
   - Patrón crítico recurrente: Entrada `OOMKilled` seguida inmediatamente de `Created` y `Started`. Esto confirma que el proceso excedió el límite de memoria del contenedor y el kernel/`kubelet` lo terminó forzosamente ([Troubleshoot common health problems](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/troubleshoot-health-problems)).

### Flujo de Diagnóstico de Salud en Nodos
1. **Detección de Nodos no Saludables:** Filtrar en el estado de salud de **Nodes** los elementos en estado degradado.
2. **Presión de Memoria y BackOff:** Si el uso de memoria del nodo supera la capacidad solicitable, Kubernetes puede iniciar la expulsión (eviction) de pods o entrar en estado de advertencia `BackOff` ([Assess and troubleshoot cluster health](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/cluster-health)).
3. **Inspección de Causas Raíz:** Explorar la pestaña de eventos del nodo para asociar los eventos `BackOff` y `OOMKill` con los deployments específicos que están desbalanceando el cluster.

---

## 3. Monitoreo de Métricas, Eventos, cAdvisor y Prometheus

Dynatrace captura métricas de infraestructura profunda tanto con OneAgent en modo Full-Stack como sin agente directo mediante la API de Kubernetes y ActiveGate ([Monitor Kubernetes/OpenShift metrics](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-metrics-kubernetes), [Monitor Prometheus metrics](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-prometheus-metrics)).

### Métricas de cAdvisor y Agregación de Workloads
- **Métricas de Recursos de Workload y Nodo:** Agregan el consumo de CPU, memory throttling y uso de memoria de todos los contenedores cAdvisor a nivel de workload y nodo sin requerir OneAgent en cada nodo ([Monitor Kubernetes/OpenShift metrics](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-metrics-kubernetes)).
- **Requisitos:** Nodos POSIX (cAdvisor no disponible en Windows). ActiveGate 1.263+ para métricas de workload y 1.271+ para métricas de nodo.
- **Configuración:** En la configuración del cluster (**Monitoring settings**), activar **Monitor workload and node resource metrics**.

### Ingesta de Métricas de Prometheus
Dynatrace scrapea y mapea automáticamente métricas expuestas en formato Prometheus/OpenMetrics ([Monitor Prometheus metrics](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-prometheus-metrics)):
- **Tipos de métrica soportados:**
  - `Counter`: Mapeado a métricas monotónicas incrementales.
  - `Gauge`: Mapeado a valores instantáneos.
  - `Histogram` y `Summary`: Captura de percentiles y distribuciones.
- Anotaciones estándar en Pods/Services para autodiscovery:
  - `prometheus.io/scrape: "true"`
  - `prometheus.io/port: "<puerto>"`
  - `prometheus.io/path: "<ruta_metricas>"`

### Captura y Filtrado de Eventos Kubernetes
- Monitoreo continuo de eventos del cluster (Warning, Normal, FailedScheduling, BackOff, Unhealthy, Evicted) ([Monitor Kubernetes/OpenShift events](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-events-kubernetes)).
- Generación de eventos inferidos por Dynatrace para enriquecer el análisis de causa raíz de Davis.

---

## 4. Detección de Anomalías, Alertas y Automatización con Settings API

Las alertas out-of-the-box (OOTB) y personalizadas se estructuran en tres niveles jerárquicos: **Environment**, **Cluster** y **Namespace** ([Alert on common Kubernetes misconfigurations](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/alert-use-case), [Global default monitoring settings](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/default-monitoring-settings)).

### Jerarquía de Configuración
1. **Environment level (Defaults):** Aplica a todos los clusters conectados (`scope = "environment"`).
2. **Cluster level:** Sobrescribe configuraciones específicas para clusters particulares (ej. producción vs no-producción).
3. **Namespace level:** Permite aislar umbrales de saturación y criticidad para namespaces clave.

### Esquemas de Settings API
Para automatización con Configuration as Code (GitOps) y pipelines:

| Schema ID | Descripción | Scope |
|---|---|---|
| `builtin:anomaly-detection.kubernetes.workload` | Detección de anomalías en workloads (restart counts, memory limits, CPU saturation) | `environment`, `cluster`, `namespace` |
| `app:dynatrace.kubernetes.connector:connection` | Conexión del conector de Kubernetes para EdgeConnect y workflows | `environment` |

*Ejemplo de consulta a la API de Schemas ([Settings API - Kubernetes Connector](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/app-dynatrace-kubernetes-connector-connection)):*
```http
GET /api/v2/settings/schemas/builtin:anomaly-detection.kubernetes.workload
GET /api/v2/settings/schemas/app:dynatrace.kubernetes.connector:connection
```
Requiere token con scope `settings.read` o `settings.write`.

### Operaciones Predictivas y Workflows
- **Predicción de saturación y autoescalado:** Detección predictiva de tendencias de consumo (ej. saturación de disco o colas de mensajes) ([Predictive Kubernetes operations](https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/predictive-operations), [Predict and autoscale Kubernetes workloads](https://docs.dynatrace.com/docs/deliver/self-service-kubernetes-use-case)).
- **Workflows automatizados:** Integración de alertas de umbral (ej. utilización de disco > 60%) con acciones de remediación automática vía Dynatrace Workflows y Kubernetes Connector.

---

## 5. Etiquetas, Anotaciones, Ownership y Gobernanza DPS

### Uso de Labels y Annotations para Detección y Ownership
Dynatrace extrae automáticamente metadatos de los manifiestos de Kubernetes para enriquecer el análisis ([Organize Kubernetes/OpenShift deployments by tags](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/leverage-tags-defined-in-kubernetes-deployments)):
- **Propiedades automáticas detectadas:** Base pod name, Container name, Full pod name, Namespace.
- **Asignación de Ownership:** Se recomienda definir ownership mediante annotations o labels en el Deployment (ej. `owner: "team-core"` o `git.repository: "https://..."`), permitiendo vincular incidentes directamente al equipo responsable.
- **Requisitos de permisos:** El ServiceAccount del pod/namespace debe tener rol `view` para permitir que el módulo OneAgent consulte los metadatos de la API de Kubernetes.

### Segmentación de Datos y Management Zones
- Crear reglas de Management Zones basadas en `Kubernetes service`, `Kubernetes namespace` o `Kubernetes cluster name` ([Monitor Kubernetes/OpenShift services](https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-services-kubernetes)).
- Segmentación de clusters en entornos compartidos para restringir visibilidad por tenant ([Segment data by Kubernetes clusters](https://docs.dynatrace.com/docs/manage/segments/use-cases/segments-use-cases-kubernetes-clusters)).

### Control de Consumo de Licencia DPS
- La capacidad **Kubernetes Platform Monitoring** factura por **pod-hour** consumido ([Understand and manage Kubernetes Platform Monitoring consumption](https://docs.dynatrace.com/docs/license/capabilities/container-monitoring/kubernetes-platform-monitoring)).
- Estrategias de optimización: Descartar monitoreo de namespaces transitorios o de pruebas irrelevantes mediante reglas de exclusión en los monitoring settings del cluster.

---

## 6. Consultas DQL de Referencia para Kubernetes en Grail

### Detección de Pods con Reinicios Frecuentes y Eventos Críticos
```dql
fetch events
| filter event.kind == "KUBERNETES" or event.type == "KUBERNETES"
| filter event.name in ["OOMKilled", "BackOff", "FailedScheduling", "Unhealthy"]
| summarize count() by: {k8s.cluster.name, k8s.namespace.name, k8s.workload.name, event.name}
| sort count desc
```

### Análisis de Utilización de Recursos por Workload
```dql
fetch dt.entity.kubernetes_cluster
| fields id, entity.name
```

---

## 7. Procedimiento Operativo con CLI `dtx`

```powershell
# 1. Comprobar estado y entidades de Kubernetes
.\dtx.cmd entities --type KUBERNETES_CLUSTER
.\dtx.cmd entities --type KUBERNETES_WORKLOAD

# 2. Consultar problemas abiertos en clusters k8s
.\dtx.cmd problems --status OPEN

# 3. Validar métricas de Kubernetes disponibles en el tenant
.\dtx.cmd metrics --filter "builtin:kubernetes"

# 4. Validar integridad y trazabilidad de la skill
.\dtx.cmd skill validate dynatrace-kubernetes
```
