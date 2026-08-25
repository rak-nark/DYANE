# Research Brief: Observabilidad y monitoreo de Kubernetes, Dynatrace Operator, clusters, nodos, workloads, pods, eventos y DQL en Grail

> Generado deterministamente por `dtx skill draft`. Material de trabajo para la síntesis de la skill.
> La IA debe construir el SKILL.md final SOLO a partir de este brief (principio documentation-first).

- **Dominio:** kubernetes
- **Consultas ejecutadas:** 12
- **Documentos analizados:** 24
- **Generado:** 2026-08-24T18:56:00.440Z

## Mapa de fuentes (ranking por relevancia)

| # | Score | Título | Código | URL |
|---|-------|--------|--------|-----|
| 1 | 586 | Smartscape - Kubernetes — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/k8s |
| 2 | 79 | Predict and autoscale Kubernetes workloads — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/deliver/self-service-kubernetes-use-case |
| 3 | 101 | Alert on common Kubernetes/OpenShift issues — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/alert-on-kubernetes-issues |
| 4 | 53 | Monitor Prometheus metrics — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-prometheus-metrics |
| 5 | 81 | Optimize workload resource usage with Kubernetes app and Notebooks — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/resource-optimization |
| 6 | 90 | Getting started with Kubernetes experience — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/enable-k8s-experience |
| 7 | 105 | Monitor Kubernetes/OpenShift workloads — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-workloads-kubernetes |
| 8 | 42 | Kubernetes Engine — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/gcp/container |
| 9 | 87 | Segment data by Kubernetes clusters — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/manage/segments/use-cases/segments-use-cases-kubernetes-clusters |
| 10 | 86 | Settings API - Kubernetes workload anomaly detection schema table — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/builtin-anomaly-detection-kubernetes-workload |
| 11 | 67 | Understand and manage Kubernetes Platform Monitoring consumption (DPS) — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/license/capabilities/container-monitoring/kubernetes-platform-monitoring |
| 12 | 59 | Monitor Kubernetes/OpenShift events — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-events-kubernetes |
| 13 | 80 | Troubleshoot common health problems of Kubernetes workloads — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/troubleshoot-health-problems |
| 14 | 55 | Predictive Kubernetes operations — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/predictive-operations |
| 15 | 49 | Global default monitoring settings for Kubernetes/OpenShift — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/default-monitoring-settings |
| 16 | 83 | Enable Kubernetes experience for existing clusters — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/enable-k8s-experience/existing-clusters |
| 17 | 68 | Kubernetes — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app |
| 18 | 59 | Organize Kubernetes/OpenShift deployments by tags — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/leverage-tags-defined-in-kubernetes-deployments |
| 19 | 58 | Monitor Kubernetes/OpenShift services — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-services-kubernetes |
| 20 | 49 | Alert on common Kubernetes misconfigurations and detect anomalies with Kubernetes metrics — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/alert-use-case |
| 21 | 44 | Monitor Kubernetes/OpenShift metrics — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-metrics-kubernetes |
| 22 | 45 | Assess and troubleshoot cluster health — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/cluster-health |
| 23 | 54 | Monitor Kubernetes/OpenShift cluster utilization — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-cluster-utilization-kubernetes |
| 24 | 41 | Settings API - Kubernetes Connector schema table — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/app-dynatrace-kubernetes-connector-connection |


## [13] Troubleshoot common health problems of Kubernetes workloads — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/troubleshoot-health-problems
- **Score:** 80 · **Código:** 0 bloques

### Estructura del documento
  - Scenario
  - Prerequisites
  - Identify and troubleshoot health issues
    - 1 . Identify problematic workloads
    - 2 . Analyze workload problems
    - 3 . Resolve workload problems
    - 4 . Investigate infrequent workload problems
  - Related topics

### Contexto por sección
- **Scenario:** - Error or warning indicators appear for clusters and workloads in the Kubernetes app. - The Dynatrace Intelligence health status displays yellow or red for certain workloads, nodes, or clusters.
- **Prerequisites:** - Access to a Kubernetes cluster. - New Kubernetes experience configured .
- **Identify and troubleshoot health issues:** The following steps will guide you through the phases of identifying problematic workloads on your clusters and the process of remediation.
- **1 . Identify problematic workloads:** Select the red number within the workload tile to apply a filter displaying all currently unhealthy workloads across your monitored clusters.
- **1 . Identify problematic workloads:** Among the listed workloads, you can see that the `prom-problem-sim` workload is displaying signs of trouble.
- **2 . Analyze workload problems:** We've identified an important workload displaying problems that are causing it to be unhealthy. To understand the underlying issues better, we'll take a closer look at this workload.
- **2 . Analyze workload problems:** On the workload page, review the **Problems** indicators displayed at the top (for example, **CPU usage close to limits**).
- **2 . Analyze workload problems:** Select **CPU usage close to limits** to enter problem mode. Dynatrace opens a dedicated problem view where you can: - See the exact problem statement and duration. - Understand why the workload is affected (for example, CPU limits exceeded or throttling detected). - Correlate resource usage (for example, CPU and memory) with the problem.
- **2 . Analyze workload problems:** While in problem mode, go to **Utilization**. Dynatrace automatically highlights the affected resource (for example, CPU) and overlays the problem on the corresponding chart. This helps you see how resource usage relates to the active problem.
- **2 . Analyze workload problems:** The **Events** tab presents a graph displaying the number of recent events by type, alongside a table detailing these events.
- **2 . Analyze workload problems:** Below the chart, the event list provides detailed platform messages such as `OOMKilled`, followed by the `Created` and `Started` container events. This sequence indicates that the container exceeded its memory limit and was terminated by Kubernetes.
- **3 . Resolve workload problems:** The event timeline shows repeated grouped events that represent container restarts. In the event list, `OOMKilled` entries are followed by the `Created` and `Started` events for the `prometheus-problem-simulator` container. This sequence indicates that the container exceeded its memory limit, was terminated by `kubelet`, and then automatically recreated by Kubernetes.
- **3 . Resolve workload problems:** Use this information to understand how the workload behaves over time and identify recurring container lifecycle events that contribute to the problem.
- **4 . Investigate infrequent workload problems:** Most problems can be found and investigated by following the steps outlined above. However, some issues might be more complex because they don't happen regularly or occur far apart. Dynatrace helps in overcoming these challenges by highlighting key metrics and providing insightful highlights in **Kubernetes**.
- **4 . Investigate infrequent workload problems:** A common and potentially troublesome issue involves containers being OOM killed. Dynatrace can help you detect such incidents. Within the workload list's health perspective, there's a specific column displaying OOM kill events for each workload.

## [14] Predictive Kubernetes operations — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/predictive-operations
- **Score:** 55 · **Código:** 0 bloques

### Estructura del documento
  - Target audience
  - Scenario
  - Prerequisites
    - Permissions
    - Knowledge
  - Steps
    - 1 . Set up continuous monitoring
    - 2 . Set up configuration file retrieval through ownership
    - 3 . Set up a workflow
  - Conclusion
  - Related topics

### Contexto por sección
- **Target audience:** This use case is intended for system administrators, DevOps engineers, and site reliability engineers (SREs) who manage Kubernetes-based services and infrastructure.
- **Target audience:** You should have a basic understanding of Kubernetes environments, including concepts like nodes, pods, and disk utilization.
- **Target audience:** Familiarity with Dynatrace, particularly its AI capabilities like Dynatrace Intelligence for predictive analytics and automated workflows, is beneficial but not mandatory. The content is also relevant for teams looking to automate and improve their Kubernetes infrastructure management, ensuring optimal performance and resource utilization without the need for deep technical expertise in Dynatrace.
- **Target audience:** This guide aims to provide practical steps for those responsible for maintaining the stability and efficiency of Kubernetes services, especially in scenarios of dynamic resource requirements.
- **Scenario:** In a large-scale Kubernetes environment, an operations team is responsible for managing multiple nodes and critical services that require constant and efficient disk space management. They face a challenge: ensuring optimal disk utilization for each service without manual intervention. The team needs a scalable solution that can proactively manage disk space to prevent service disruptions and data loss, especially du
- **Scenario:** The current process of manually monitoring and resizing disks is time-consuming and prone to errors, leading to either over-provisioning (wasting resources) or under-provisioning (risking service disruption). The team seeks an automated approach to dynamically adjust disk space based on real-time usage and projected needs.
- **Scenario:** By implementing the automated disk resizing feature in Dynatrace, the team aims to: - Automatically detect and address disk space shortages within the Kubernetes environment. - Use predictive analytics to calculate required disk space adjustments in real time. - Ensure consistent application of configuration changes across all Kubernetes clusters. - Reduce manual monitoring and intervention, thus saving time and reso
- **Scenario:** This scenario illustrates a common challenge in managing Kubernetes-based services at scale and how Dynatrace automation capabilities can provide an efficient solution. The goal is to maintain uninterrupted service and optimal performance through intelligent, automated disk management.
- **Scenario:** This particular case is an example on how to make sure that on a sudden spike in traffic, an immediate need for extra disk space for Kafka is allocated to accommodate the increased message queue.
- **Prerequisites:** Make sure all of these are true before you start.
- **Permissions:** - You have access to a Dynatrace environment with the necessary permissions for configuration and monitoring. - You have access to Kubernetes Configurations and you're able to retrieve and modify Kubernetes service configurations for disk size adjustments.
- **Knowledge:** - You have basic knowledge of Kubernetes architecture, including nodes, pods, and services. - You have experience with Kubernetes Disk Management: Understanding of disk utilization in Kubernetes and the challenges associated with managing disk space in dynamic environments. - You know how to set up automated workflows in Dynatrace for responding to disk space alerts. See Workflows - You know how to set up monitoring 
- **Steps:** To keep the internal systems up and running, create an automated workflow for Kubernetes (K8s) disk management. This process is tailored to ensure critical internal services maintain optimal performance, even when unexpected disk utilization spikes occur. By leveraging continuous monitoring and automated remediation steps, downtime is minimized and maintains the consistency of the operations.
- **1 . Set up continuous monitoring:** Set up Dynatrace on Kubernetes to continuously monitor all services within the Kubernetes infrastructure. When your monitoring is providing you with data, set up an alert for disk utilization exceeding a 60% threshold to ensure optimal performance without resource wastage. With this alert, you'll be able to model a workflow for solving a disk size shortage issue.
- **2 . Set up configuration file retrieval through ownership:** With ownership assigned to objects, you can store the repository information. On detecting an anomaly, the system identifies the impacted service and fetches its associated configuration file. This step ensures that any adaptation made aligns directly with the specific service configuration.

## [15] Global default monitoring settings for Kubernetes/OpenShift — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/default-monitoring-settings
- **Score:** 49 · **Código:** 0 bloques

### Estructura del documento
  - Configuration via web UI
    - Configure environment-level settings
    - List overriding clusters
    - Remove cluster-level overrides
  - Configuration via API
  - Related topics

### Contexto por sección
- **Configuration via web UI:** The monitoring settings can be configured either per cluster or for the whole environment.
- **Configure environment-level settings:** To configure the default settings for the whole environment - Go to **Settings** and select **Cloud and virtualization** > **Kubernetes**. - On the **Monitoring settings** page, change settings as needed. - Select **Save changes**.
- **Configure environment-level settings:** Kubernetes monitoring settings on tenant
- **Configure environment-level settings:** These environment-level settings will be used as default values for all clusters that do not explicitly override them.
- **List overriding clusters:** To see which clusters are currently overriding these settings - On the environment-level **Monitoring settings** page, select **More** (**…**) > **Hierarchy and overrides** in the upper-right corner. - Review the **Hierarchy and overrides** table.
- **List overriding clusters:** For details on the settings hierarchy, see Settings documentation .
- **List overriding clusters:** Kubernetes monitoring settings overrides
- **Remove cluster-level overrides:** If you want to remove an override from a specific cluster
- **Remove cluster-level overrides:** In the **Hierarchy and overrides** table, select the name of the cluster.
- **Remove cluster-level overrides:** This opens the **Monitoring settings** page for the selected cluster. The message "These settings are overriding Environment settings" is displayed.
- **Remove cluster-level overrides:** In the message box, select **Remove override**. If no override is set, the values set on the environment will be used.
- **Remove cluster-level overrides:** Kubernetes monitoring settings on cluster
- **Configuration via API:** You can also configure monitoring settings via the Settings API using the Monitoring settings schema .
- **Configuration via API:** To change the default values for the environment, set the `scope` property in the request to `environment`.
- **Configuration via API:** To use the default settings when connecting a cluster, the Connection settings schema should be version `3.0.0` or higher. Using older versions will automatically override the default monitoring settings for this cluster.

## [16] Enable Kubernetes experience for existing clusters — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/enable-k8s-experience/existing-clusters
- **Score:** 83 · **Código:** 0 bloques

### Estructura del documento
  - Enable all clusters
  - Enable specific clusters

### Contexto por sección
- **Enable all clusters:** - Go to **Settings** > **Collect and capture** > **Cloud and virtualization** > **Kubernetes app**. - Select the toggle to turn on **New Kubernetes experience**.
- **Enable specific clusters:** In **Kubernetes**, select **Activation pending** in the top menu bar.
- **Enable specific clusters:** Select **Activate** for your desired cluster.
- **Enable specific clusters:** When you enable Kubernetes clusters for the new Kubernetes experience, Dynatrace starts to report observability data to the Dynatrace platform, including Grail as a data lakehouse. Related tags

## [17] Kubernetes — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app
- **Score:** 68 · **Código:** 0 bloques

### Estructura del documento
  - Prerequisites
  - Get started
    - Setup and reference
  - Explorer
    - Dynatrace Intelligence health status
    - Health alerts and warning signals
  - Kubernetes Enhanced Object Visibility
    - Prerequisites
    - Transition from Explorer Classic
  - Use cases
  - Reference
  - Learn more
    - Explore in Dynatrace Hub

### Contexto por sección
- **Prerequisites:** - Dynatrace SaaS environment powered by Grail and AppEngine - DPS license with the **Kubernetes Platform Monitoring** capability on your Rate Card - Sufficient permissions to use the **Kubernetes** within your Dynatrace environment ActiveGate version 1.327+ is a prerequisite for Kubernetes Enhanced Object Visibility .
- **Prerequisites:** - Older ActiveGate versions are supported in backward compatibility mode; in that mode, an additional **Explorer (Classic)** tab appears in the UI.
- **Prerequisites:** For more details, see getting started FAQ .
- **Prerequisites:** The new Kubernetes experience is not available for Managed or SaaS on non-Grail environments—you can continue to use **Kubernetes Classic** (accessible from the previous Dynatrace via **Kubernetes**).
- **Get started:** **Kubernetes** provides a comprehensive view of your environment, enabling you to automate monitoring and optimize the health and performance of your Kubernetes clusters and workloads. This page walks you through the main concepts underlying **Kubernetes**.
- **Get started:** With **Kubernetes**, you can: - Set up Kubernetes monitoring with Dynatrace. - Explore cluster, node, and workload insights. - Analyze health status with Dynatrace Intelligence. - Detect and troubleshoot Kubernetes issues.
- **Get started:** 1 of 5 High-level overview of all your Kubernetes clusters, independent of the cloud service they run on.
- **Setup and reference:** Use the following guide to set up and configure Kubernetes monitoring in Dynatrace. 01 Enable Kubernetes experience for existing clusters
- **Setup and reference:** How-to guide - Enable existing clusters for the new Kubernetes experience.
- **Explorer:** **Kubernetes** provides an **Explorer** tab where you can monitor and analyze your Kubernetes environment. The sidebar groups all Kubernetes objects
- **Explorer:** by type—clusters, nodes, namespaces, workloads, pods, services, and containers. Selecting an object opens a detail view with tabs for analyzing health and utilization, as well as for exploring logs, events, ownership, and vulnerabilities.
- **Explorer:** For details, see Explorer view in Dynatrace apps .
- **Dynatrace Intelligence health status:** The health status in **Kubernetes** is based on Kubernetes-focused custom alerts. A Kubernetes object (such as a cluster) is considered unhealthy if any of its associated custom alert configurations are in an unhealthy state. Selecting a specific health indicator reveals the underlying reasons.
- **Dynatrace Intelligence health status:** Example of Dynatrace Intelligence health status for a Kubernetes cluster.
- **Dynatrace Intelligence health status:** In this example, you can see that 1 node out of 5 is currently considered unhealthy.

## [18] Organize Kubernetes/OpenShift deployments by tags — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/leverage-tags-defined-in-kubernetes-deployments
- **Score:** 59 · **Código:** 0 bloques

### Estructura del documento
  - Recommendations
  - Automatic detection of Kubernetes properties and annotations
  - Leverage Kubernetes labels in Dynatrace
  - Import your labels and annotations
    - Grant viewer role to service accounts
  - Related topics

### Contexto por sección
- **Recommendations:** We recommend that you define additional metadata at the deployed system. For Kubernetes-based applications, you can simply use Kubernetes annotations
- **Recommendations:** . Dynatrace automatically detects and retrieves all Kubernetes and OpenShift annotations for pods that are monitored with a OneAgent code module. This enables you to use automated tagging rules , based on existing or custom metadata, to define your filter sets for charts, alerting, and more. These tags and rules can be changed and adapted any time and will apply almost immediately without any change to the monitored 
- **Recommendations:** In Dynatrace, you can specify entity ownership for different Kubernetes objects such as Deployments, Pods, Services, or namespaces. We recommend providing ownership information via Kubernetes labels or annotations (you can use either labels or annotations to attach metadata to Kubernetes objects). This ensures that Kubernetes objects have adequate ownership coverage, which is especially important for short-lived enti
- **Recommendations:** We recommend defining ownership for the Deployment and all other objects for which you want ownership coverage. See also Best practices for entity ownership . You can assign more than one team to a Kubernetes object, provided that the keys in the key-value pairs are unique.
- **Recommendations:** While you can also use tags (manual, automated, and via API) to apply ownership information to Kubernetes objects, this approach has its limitations—read more in Best practices for entity ownership .
- **Automatic detection of Kubernetes properties and annotations:** Dynatrace detects Kubernetes properties and annotations. Such properties and annotations can be used when specifying automated rule-based tags .
- **Automatic detection of Kubernetes properties and annotations:** Additionally Dynatrace detects the following properties that can be used for automated rule-based tags and property-based process group detection rules . - Kubernetes base pod name: User-provided name of the pod the container belongs to. - Kubernetes container: Name of the container that runs the process. - Kubernetes full pod name: Full name of the pod the container belongs to. - Kubernetes namespace: Namespace to w
- **Leverage Kubernetes labels in Dynatrace:** Kubernetes-based tags are searchable via Dynatrace search. This allows you to easily find and inspect the monitoring results of related processes running in your Kubernetes or OpenShift environment. You can also leverage Kubernetes tags to set up fine-grained problem alerting profiles . Kubernetes tags also integrate perfectly with Dynatrace filters .
- **Import your labels and annotations:** For OneAgent to detect Kubernetes annotations and properties, make sure that - Pods are monitored with a code module - `automountServiceAccountToken: false` isn't set in your pod's `spec` Kubernetes OpenShift
- **Import your labels and annotations:** of your application or you can update the labels of your Kubernetes resources using the command `kubectl label`.
- **Import your labels and annotations:** of your application or you can update the labels of your OpenShift resources using the command oc label
- **Import your labels and annotations:** Dynatrace automatically detects all labels attached to pods at application deployment time. All you have to do is grant sufficient privileges to the pods that allow for reading the metadata from the Kubernetes REST API endpoint. This way, the OneAgent code modules can read these labels directly from the pod.
- **Grant viewer role to service accounts:** In Kubernetes, every pod is associated with a service account which is used to authenticate the pod's requests to the Kubernetes API. If not otherwise specified the pod uses the `default` service account of its namespace.
- **Grant viewer role to service accounts:** Every namespace has its own set of service accounts and thus also its own namespace-scoped `default` service account. The labels of each pod for which the service account has view permissions will be imported into Dynatrace automatically.
- **Grant viewer role to service accounts:** The following steps show you how to add view privileges to the `default` service account in the `namespace1` namespace. You need to repeat these steps for all service accounts and namespaces you want to enable for Dynatrace.

## [19] Monitor Kubernetes/OpenShift services — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-services-kubernetes
- **Score:** 58 · **Código:** 0 bloques

### Estructura del documento
  - Prerequisites
  - Access Kubernetes services
  - Types of Kubernetes services
  - Configure management zones
  - Related topics

### Contexto por sección
- **Prerequisites:** - ActiveGate version 1.251+ with Kubernetes API monitoring enabled - In Dynatrace, go to your Kubernetes cluster settings page and make sure that **Monitor Kubernetes namespaces, services, workloads, and pods** is turned on.
- **Prerequisites:** If you're not using Dynatrace Operator, you also need to enable the `list services` and `get services` permissions on your service account
- **Access Kubernetes services:** You can access Kubernetes services in Dynatrace via: - Kubernetes cluster/namespace overview page (see the **Kubernetes services** column) - Kubernetes namespace/workload/pod details page (see the **Kubernetes services** card)
- **Access Kubernetes services:** On the Kubernetes service/workload/pod overview pages, you can filter by: - Kubernetes service - Kubernetes service name - Kubernetes service type (`ClusterIP`, `NodePort`, `LoadBalancer`, and `ExternalName`)
- **Types of Kubernetes services:** **Cluster IP:** A stable, cluster-internal IP address that can be used within the cluster.
- **Types of Kubernetes services:** **Node port:** An extension of the cluster IP type. Clients can send requests to the IP address of a node on one or more node ports. These requests are routed to the cluster IP of the Kubernetes service.
- **Types of Kubernetes services:** Dynatrace provides the cluster IP as well as the port and protocol definitions next to the list of served pods on the Kubernetes service details screen.
- **Types of Kubernetes services:** **Load balancer:** Clients can send requests to the IP address of a network load balancer. Node port and cluster IP services, to which the external load balancer will route, are automatically created.
- **Types of Kubernetes services:** In addition to the cluster IP, Dynatrace provides the external IP address, as well as the port and protocol definitions next to the list of served pods on the Kubernetes service details page.
- **Types of Kubernetes services:** **External name:** Internal clients use the DNS name of a service as an alias for an external DNS name.
- **Types of Kubernetes services:** Dynatrace provides the external name as a property on the Kubernetes service details page
- **Types of Kubernetes services:** **Headless service:** Can be used when you don't need a stable IP address, but still want a pod grouping.
- **Types of Kubernetes services:** Dynatrace provides the port and protocol definitions, as well as the list of served pods for headless services with selectors.
- **Configure management zones:** To configure management zones for Kubernetes services, you need to create a monitored entity rule for the Kubernetes service. Example: `Kubernetes service` on **Hosts** where `Kubernetes cluster name` equals `GKE CP KLU`.
- **Configure management zones:** The rule for Kubernetes services is automatically included when you select **Create management zone** in the Kubernetes cluster context menu.

## [20] Alert on common Kubernetes misconfigurations and detect anomalies with Kubernetes metrics — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/alert-use-case
- **Score:** 49 · **Código:** 0 bloques

### Estructura del documento
  - Real-world scenario
  - Benefits
  - Getting started

### Contexto por sección
- **Real-world scenario:** One of the primary applications of Kubernetes alerts is to detect anomalies in your infrastructure immediately.
- **Real-world scenario:** For instance, consider a scenario where a deployment update causes pods to fail to start in a production environment. While there is no immediate impact on production (no traffic is routed to unready pods), the deployment is stuck and the latest version cannot be rolled out. Dynatrace detects the issue and raises a problem, giving you the context you need to identify the root cause and resolve it quickly.
- **Benefits:** Kubernetes out-of-the-box (OOTB) alerts can be easily configured within the global anomaly-detection settings. With this feature, you can achieve:
- **Benefits:** **Quick setup**: OOTB alerts, including those for Kubernetes, come preconfigured, which ensures that monitoring setups often take less than 5 minutes.
- **Benefits:** **Streamlined monitoring**: OOTB alerts automate the oversight of multiple metrics, centralizing the monitoring process and reducing the need for frequent manual checks.
- **Benefits:** **Responsive adaptability**: The feature adjusts alerting thresholds based on real-time cluster loads, ensuring relevant monitoring and minimizing potential human errors.
- **Benefits:** **Direct navigation**: Navigate to the settings related to your namespace directly from Dynatrace and adapt everything to your needs without the need for external configurations.
- **Benefits:** **Default configurations**: Set up default alert configurations for all active and future Kubernetes clusters, namespaces, and workloads, ensuring consistent monitoring as your infrastructure grows.
- **Benefits:** **Granular customization**: Customize alert settings at various levels, allowing you to handle alerts differently for production and development clusters and adjust node alerts within each.
- **Benefits:** **Automation with Dynatrace API**: Leverage the Dynatrace API to automate configurations, ensuring that your alerting system evolves smoothly with your infrastructure changes. Moreover, with the Dynatrace API, you can adopt the Configuration as Code approach to configure alerts, integrating them into a GitOps workflow.
- **Getting started:** Alerts for common Kubernetes issues can be configured at three levels: - **Environment**: Settings apply to all clusters, nodes, namespaces, or workloads in the Kubernetes environment. - **Cluster**: Settings specific to individual clusters. - **Namespace**: Settings specific to individual namespaces.
- **Getting started:** To configure these settings, go to **Settings**. Select **Analyze and alert** > **Alerts** and select **Cluster** (or **namespace** for namespace-level settings). ** Environment level Cluster level Namespace level - Go to Settings**. - Select **Analyze and alert** > **Alerts** and select **Cluster** (or **Namespace** for namespace-level settings).
- **Getting started:** - Go to **Kubernetes** > **Cluster**. - Select the cluster record that you're interested in. In the cluster header, select
- **Getting started:** - Go to **Kubernetes** > **Namespace**. - Select the namespace record that you're interested in. In the namespace header, select

## [21] Monitor Kubernetes/OpenShift metrics — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-metrics-kubernetes
- **Score:** 44 · **Código:** 0 bloques

### Estructura del documento
  - Prerequisites
  - View Kubernetes metrics
    - Workload resource metrics
  - Related topics

### Contexto por sección
- **Prerequisites:** - In Dynatrace, go to your Kubernetes cluster settings page and make sure that **Monitor Kubernetes namespaces, services, workloads, and pods** is turned on.
- **View Kubernetes metrics:** - For details on container metrics, see Built-in metrics - Containers/CPU and Built-in metrics - Containers/Memory .
- **View Kubernetes metrics:** - For details on Kubernetes metrics, see Built-in metrics - Cloud/Kubernetes .
- **Workload resource metrics:** Dynatrace version 1.264+ ActiveGate version 1.263+
- **Workload resource metrics:** Workload resource metrics rely on cAdvisor, which is only available on POSIX-based Kubernetes nodes. These metrics are not available on Windows.
- **Workload resource metrics:** For clusters with more than 50 nodes or 5,000 pods, resource consumption of the ActiveGate is considerably increased.
- **Workload resource metrics:** The workload and node resource metrics feature aggregates container resource metrics (CPU usage, CPU throttling, and memory consumption) to the workload and node level. Workload and node resource metrics are based on the container metrics exposed by the Kubernetes cAdvisor. This feature does not require OneAgent—an ActiveGate with Kubernetes API monitoring turned on is sufficient.
- **Workload resource metrics:** To enable monitoring of workload and node resource metrics
- **Workload resource metrics:** Go to **Kubernetes Classic** and select the cluster name to open the Kubernetes cluster overview page.
- **Workload resource metrics:** In the upper-right corner, select **More** (**…**) > **Settings**, select **Monitoring settings**, and turn on **Monitor workload and node resource metrics**.
- **Workload resource metrics:** Monitoring **node resource metrics** requires ActiveGate version 1.271+ .
- **Workload resource metrics:** Optional Select **Test connection** to verify that the feature has been successfully activated.
- **Workload resource metrics:** For a list of all available metrics, see Workload metrics or Node for node resource metrics.
- **Related topics:** - Set up Dynatrace on Kubernetes Related tags

## [22] Assess and troubleshoot cluster health — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/kubernetes-app/use-cases/cluster-health
- **Score:** 45 · **Código:** 0 bloques

### Estructura del documento
  - Dynatrace Intelligence health status
  - Troubleshoot unhealthy resources
    - 1 . View unhealthy nodes
    - 2 . Analyze node memory utilization
    - 3 . Go to node events
    - 4 . Identify out-of-memory killed pods from events
    - 5 . Inspect the affected workload

### Contexto por sección
- **Dynatrace Intelligence health status:** Get a quick health overview using the Dynatrace Intelligence health status. Dynatrace Intelligence automatically assesses and aggregates the health of Kubernetes clusters, nodes, namespaces, and workloads. This feature visualizes the current health state at a high level, enabling you to easily identify both healthy and unhealthy clusters, nodes, namespaces, and workloads.
- **Troubleshoot unhealthy resources:** In this example, we observe in the **Cluster** tab that some nodes, namespaces, and workloads are in an unhealthy state, marked as red.
- **Troubleshoot unhealthy resources:** To troubleshoot these unhealthy Kubernetes objects
- **1 . View unhealthy nodes:** Select the red number in the **Nodes** section of the Dynatrace Intelligence health status bar.
- **1 . View unhealthy nodes:** This action reveals a list of the unhealthy objects in the corresponding node list table, providing additional insights into the nature of the problems they are facing. For instance, you might notice a node showing `BackOff` warning with the last termination reason out-of-memory killed, indicating the container exceeded its memory limit and Kubernetes is delaying restarts.
- **2 . Analyze node memory utilization:** In the details view, you can see a breakdown of the node resource utilization.
- **2 . Analyze node memory utilization:** Pay attention to the **Memory** tile. If memory usage exceeds the allocated requests, it indicates a potential resource strain.
- **2 . Analyze node memory utilization:** Kubernetes, in an effort to maintain node stability, might begin evicting pods to free memory. This is often a response to pods consuming more memory than available, based on their reserved requests. Kubernetes may report memory pressure at the node level, and affected containers can be terminated with out-of-memory killed when they exceed their limits.
- **3 . Go to node events:** To identify which pods have been out-of-memory killed, go to the **Events** tab for this node.
- **4 . Identify out-of-memory killed pods from events:** Search the events list for `BackOff`, select the relevant entry, and drill down to view the full event details. In the event details, you can identify the pod and deployment that were terminated due to an `OOMKill` after exceeding the memory limit.
- **5 . Inspect the affected workload:** Close the details view and go to **Workload** > **Top level workloads**. Filter by the deployment name to find the relevant workload and select this workload to display details.
- **5 . Inspect the affected workload:** In the **Utilization** section, you should be able to quickly spot misconfigurations of resource requests. Related tags

## [23] Monitor Kubernetes/OpenShift cluster utilization — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/container-platform-monitoring/kubernetes-monitoring/monitor-cluster-utilization-kubernetes
- **Score:** 54 · **Código:** 0 bloques

### Estructura del documento
  - Prerequisites
  - Kubernetes page
  - Utilization of cluster resources over time
  - View available resources on your Kubernetes nodes
  - Related topics

### Contexto por sección
- **Prerequisites:** - In Dynatrace, go to your Kubernetes cluster settings page and make sure that **Monitor Kubernetes namespaces, services, workloads, and pods** is turned on.
- **Kubernetes page:** After enabling access to the Kubernetes overview page for a specific Kubernetes cluster, the specific cluster will appear on the **Kubernetes** page. The Kubernetes page provides an overview of all Kubernetes clusters showing monitoring data like the clusters’ sizing and utilization.
- **Kubernetes page:** To access this page, go to **Kubernetes Classic**.
- **Utilization of cluster resources over time:** As Kubernetes can run any containerized workloads and allow for horizontal pod autoscaling, the actual utilization of cluster resources will likely be very volatile. That is why Dynatrace offers a single pane of glass for the most important utilization and performance metrics on a cluster level. These metrics are: - Percentage of CPU resources used out of the total allocatable CPU resources. - Percentage of CPU resou
- **Utilization of cluster resources over time:** - Percentage of memory resources limited out of the total allocatable memory resources. - Total CPU/Memory usage. - CPU/Memory resources requested/limited. - CPU/Memory resources allocatable to pods. - Total number of pods running/allocatable on cluster nodes. - Number of times containers have been restarted.
- **View available resources on your Kubernetes nodes:** You can get detailed insights of the Kubernetes node metrics on a per-node level to understand how individual nodes are utilized. The **Node analysis** page also provides information about how much workload can still be deployed on nodes.
- **View available resources on your Kubernetes nodes:** By selecting a specific node, you can access the host details at the top of the node overview page. From there, you can delve into code-level insights on currently deployed containers, along with relevant cloud-specific host properties and Kubernetes node labels.
- **Related topics:** - Set up Dynatrace on Kubernetes Related tags

## [24] Settings API - Kubernetes Connector schema table — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/app-dynatrace-kubernetes-connector-connection
- **Score:** 41 · **Código:** 0 bloques

### Estructura del documento
    - Kubernetes Connector (`app:dynatrace.kubernetes.connector:connection )`
  - Authentication
  - Parameters

### Contexto por sección
- **Kubernetes Connector (`app:dynatrace.kubernetes.connector:connection )`:** Available connections for Kubernetes Connector
- **Kubernetes Connector (`app:dynatrace.kubernetes.connector:connection )`:** . A connection is bound to a Kubernetes cluster where the workflow actions operate. We recommend following the steps described here
- **Kubernetes Connector (`app:dynatrace.kubernetes.connector:connection )`:** using the Dynatrace Operator, which automatically creates the connection. Schema ID Schema groups Scope `app:dynatrace.kubernetes.connector:connection` - `environment` Retrieve schema via Settings API
- **Kubernetes Connector (`app:dynatrace.kubernetes.connector:connection )`:** GET Managed `https://{your-domain}/e/{your-environment-id}/api/v2/settings/schemas/app:dynatrace.kubernetes.connector:connection` GET SaaS `https://{your-environment-id}.live.dynatrace.com/api/v2/settings/schemas/app:dynatrace.kubernetes.connector:connection` GET Environment ActiveGate `https://{your-activegate-domain}/e/{your-environment-id}/api/v2/settings/schemas/app:dynatrace.kubernetes.connector:connection`
- **Authentication:** To execute this request, you need an access token with **Read settings** (`settings.read`) scope. To learn how to obtain and use it, see Tokens and authentication .
- **Parameters:** Property Type Description Required EdgeConnect Name `name` text
- **Parameters:** The name of the EdgeConnect deployment Required K8s Cluster UID `uid` text
- **Parameters:** A pseudo-ID for the cluster, set to the UID of the kube-system namespace Required Namespace `namespace` text
- **Parameters:** The namespace where EdgeConnect is deployed Required Token `token` secret
- **Parameters:** The token required by EdgeConnect to access the ServiceAccount token. Required
