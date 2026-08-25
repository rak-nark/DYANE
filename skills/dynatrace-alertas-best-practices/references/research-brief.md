# Research Brief: Alerting best practices anomaly detection default alerts and alerting profiles

> Generado deterministamente por `dtx skill draft`. Material de trabajo para la síntesis de la skill.
> La IA debe construir el SKILL.md final SOLO a partir de este brief (principio documentation-first).

- **Dominio:** general
- **Consultas ejecutadas:** 12
- **Documentos analizados:** 24
- **Generado:** 2026-08-25T17:03:37.773Z

## Mapa de fuentes (ranking por relevancia)

| # | Score | Título | Código | URL |
|---|-------|--------|--------|-----|
| 1 | 75 | Classic environment v2 / Dynatrace Developer | 264 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/ |
| 2 | 75 | Classic environment v2 / Dynatrace Developer | 263 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/v7/ |
| 3 | 75 | Classic environment v2 / Dynatrace Developer | 259 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/v6/ |
| 4 | 75 | Classic environment v2 / Dynatrace Developer | 227 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/v5/ |
| 5 | 88 | Global field reference — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/semantic-dictionary/fields |
| 6 | 188 | Best practices for avoiding overalerting — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/use-cases/avoid-overalerting |
| 7 | 145 | Upgrade Guide - Metric Alerting — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/platform/upgrade/metric-alerting |
| 8 | 145 | Host anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/hosts/configuration/anomaly-detection |
| 9 | 82 | Customize endpoint detection in Service Detection v2 — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/application-observability/services/service-detection/service-detection-v2/endpoint-detection-v2 |
| 10 | 77 | Best practices for optimizing network monitoring cost — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/networks/network-devices/networks-cost-optimization |
| 11 | 109 | Anomaly detection configuration — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-configuration |
| 12 | 92 | Automated multi-dimensional baselining — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/automated-multidimensional-baselining |
| 13 | 124 | Anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection |
| 14 | 97 | Use segments with Anomaly Detection custom alerts — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/use-cases/use-segments-anomaly-detection |
| 15 | 99 | Adjust the sensitivity of anomaly detection for services — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-services |
| 16 | 96 | Adjust the sensitivity of anomaly detection for database services — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-services-database |
| 17 | 96 | Adjust the sensitivity of anomaly detection for applications — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-applications |
| 18 | 102 | Adjust the sensitivity of anomaly detection for infrastructure — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-infastructure |
| 19 | 80 | Anomaly Detection app — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-app |
| 20 | 76 | Anomaly Detection status types — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-app/anomaly-detection-status-types |
| 21 | 76 | Auto-adaptive thresholds for anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/auto-adaptive-threshold |
| 22 | 78 | Best practices for entity ownership — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/deliver/ownership/ownership-classic/best-practices |
| 23 | 78 | Adjust the sensitivity of anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection |
| 24 | 76 | Process group availability monitoring and alerting — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/process-groups/monitoring/process-group-availability-monitoring-and-alerting |


## [13] Anomaly detection — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection
- **Score:** 124 · **Código:** 0 bloques

### Estructura del documento
  - Use cases
  - Concepts
      - Auto-adaptive thresholds for anomaly detection
      - Static thresholds for anomaly detection
      - Anomaly detection configuration
      - Automated multi-dimensional baselining
      - Anomaly Detection status types
  - Getting started
      - Adjust the sensitivity of anomaly detection
      - Anomaly Detection app
      - Metric events
      - Automate alerts with API

### Contexto por sección
- **Use cases:** - Create a custom alert to get notified about problems in your environment. - Configure manually or use an auto-adaptive threshold to detect abnormal behavior. - Set up alerts for custom events.
- **Auto-adaptive thresholds for anomaly detection:** How Dynatrace adapts thresholds for multiple entities within the scope of an anomaly detection configuration.
- **Static thresholds for anomaly detection:** When to use a static threshold for your anomaly detection.
- **Anomaly detection configuration:** How to set up an alert for missing measurements.
- **Automated multi-dimensional baselining:** Learn how Dynatrace AI automatically calculates baselines based on a multi-dimensional baselining scheme.
- **Anomaly Detection status types:** Understand the health status types in Anomaly Detection and what they mean and learn about safety mechanism for failing quesries.
- **Adjust the sensitivity of anomaly detection:** Learn how to adapt the sensitivity of problem detection in Dynatrace.
- **Anomaly Detection app:** Explore anomaly detection configurations using the Anomaly Detection app.
- **Automate alerts with API:** Learn how to set up an Anomaly Detection custom alert via API.

## [14] Use segments with Anomaly Detection custom alerts — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/use-cases/use-segments-anomaly-detection
- **Score:** 97 · **Código:** 0 bloques

### Estructura del documento
  - Before you begin
    - Prior knowledge
    - Prerequisites
  - Apply segments to a custom alert
  - Why use segments for custom alert
  - Learn more
  - Related topics

### Contexto por sección
- **Prerequisites:** - Dynatrace SaaS environment - `storage:filter-segments:write` and `storage:filter-segments:read` permissions. To learn how to set up the permissions, see Permissions in Grail .
- **Apply segments to a custom alert:** **Environment segmentation** > **Segments** and verify whether the segment you want to use (for example, `payments-eu` or `us-east-prod`) already exists and includes the necessary filters. If it doesn't exist, create your own segment: select
- **Apply segments to a custom alert:** **Segments**, and then select all the filters you need.
- **Apply segments to a custom alert:** Go to **Anomaly Detection** and select the existing detector to edit it and apply a segment, or create a new anomaly detector. To create a new anomaly detector, select
- **Apply segments to a custom alert:** Expand **Set scope** on the **Simple** or **Advanced** tab.
- **Apply segments to a custom alert:** In **Segments**, choose one or more segments you want to filter by.
- **Apply segments to a custom alert:** In **Query**, provide the DQL query to fetch your data.
- **Apply segments to a custom alert:** Don't duplicate filters that are already covered by segments you've selected. Segment filters are automatically applied to your query during execution.
- **Apply segments to a custom alert:** Expand **Define alert condition**, then select **Preview** to verify that the segments have been applied to your query.
- **Why use segments for custom alert:** Using segments in custom alerts has the following benefits:
- **Why use segments for custom alert:** Reusability and simplified management: once you define a segment, you can apply it to multiple custom alerts and dashboards instead of repeatedly creating identical filters. In addition, managing common filters via segments reduces maintenance and helps to unify configuration across multiple anomaly detectors.
- **Why use segments for custom alert:** For example, suppose you need to use the `tag.owner = "payments"` filter in multiple anomaly detectors. You can create a segment for the `tag.owner` filter and reuse it. If the ownership changes, you can edit the segment, and all alerts that use it will automatically reflect the change.
- **Why use segments for custom alert:** Clean query configuration: by using segments as a scope definition, you can keep your configuration query focused on timeseries and aggregation operations and avoid long and cluttered DQL. It also helps you to separate supplementary scope-defining operations from the main operations performed by your anomaly detector.
- **Why use segments for custom alert:** For example, suppose you need to create an anomaly detector that calculates the error rate for a specific region. Instead of including region filters directly in your query, you can apply a `US-EAST` segment for region filtering. You can then reuse the same query for other regions by switching segments.
- **Why use segments for custom alert:** Reduced number of false alerts: by using segments, you can limit an anomaly detector's scope to a responsible team, region, or environment and reduce false positives while improving accuracy.

## [15] Adjust the sensitivity of anomaly detection for services — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-services
- **Score:** 99 · **Código:** 0 bloques

### Estructura del documento
  - Response time degradation
  - Failure rate increase
  - Service load drops
  - Service load spikes
  - Reference period
  - Thresholds for a specific service
  - Thresholds for a specific web request
  - Related topics

### Contexto por sección
- **Response time degradation:** This type of anomaly detection observes the response time of your services and triggers an alert if a metric violates the specified thresholds. Dynatrace can detect degradation based on automatic baselining (relative threshold) or fixed thresholds (absolute threshold).
- **Response time degradation:** Dynatrace evaluates degradation for two categories: - All responses: alert is raised if the median response time of all requests degrades beyond both the absolute and relative thresholds. - Slowest 10% responses: alert is raised if response time of the slowest 10% of requests degrades beyond both the absolute and relative thresholds.
- **Response time degradation:** To configure response time degradation detection ** Automated baselining Fixed thresholds - Turn on Detect response time degradation** and select **automatically** from the list. - Set degradation values in the remaining fields. Violation of **any** criterion triggers an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which a service should be considered a low load. Services with lower 
- **Response time degradation:** - Turn on **Detect response time degradation** and select **using fixed thresholds** from the list. - Set degradation values in the remaining fields. Violation of **any** criterion triggers an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which a service should be considered a low-load service. Services with lower load rates are excluded from evaluation. - Optional To avoid accidental
- **Response time degradation:** - Low: High statistical confidence is used, so brief violations (for example, due to a surge in load) won't trigger alerts. - Medium: Reasonable statistical confidence is used to not alert on every single violation. - High: No statistical confidence is used. Each violation triggers an alert.
- **Response time degradation:** For fixed thresholds, the problem impact includes the fixed threshold and the amount by which the threshold was exceeded.
- **Failure rate increase:** This type of anomaly detection observes the failure rate of your services and triggers an alert if the rate exceeds the specified thresholds. Dynatrace can detect failure rate increase based on automatic baselining or fixed thresholds.
- **Failure rate increase:** To configure the increased failure rate detection ** Automated baselining Fixed thresholds - Turn on Detect increase in failure rate** and select **automatically** from the list. - Specify the **relative %** and **absolute %** values above which alerts should be sent out. **Both** thresholds must be violated to trigger an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which a service s
- **Failure rate increase:** - Optional To avoid accidental alerts, define how long a service must stay in abnormal state to trigger an alert.
- **Failure rate increase:** - Turn on **Detect increase in failure rate** and select **using fixed thresholds** from the list. - Specify the **absolute %** value above which alerts should be sent out. - Optional To avoid over-alerting, define an **actions/min** rate below which a service should be considered a low-load service. Services with lower load rates are excluded from evaluation. - Optional To avoid accidental alerts, define how long a 
- **Failure rate increase:** - Low: High statistical confidence is used, so brief violations (for example, due to a surge in load) won't trigger alerts. - Medium: Reasonable statistical confidence is used to not alert on every single violation. - High: No statistical confidence is used. Each violation triggers an alert.
- **Failure rate increase:** For fixed thresholds, the problem impact includes the fixed threshold and the amount by which the threshold was exceeded.
- **Service load drops:** This type of anomaly detection learns the normal behavior of your service load over a period of 7 days and triggers an alert if the load drops significantly.
- **Service load drops:** To configure service drops detection - Turn on **Detect service load drops**. - Specify the observed load threshold to receive alerts in case of load drops. - Optional To avoid accidental alerts, define how long a service must stay in abnormal state to trigger an alert.
- **Service load spikes:** This type of anomaly detection learns the normal behavior of your service load over a period of 7 days and triggers an alert if the load increases significantly.

## [16] Adjust the sensitivity of anomaly detection for database services — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-services-database
- **Score:** 96 · **Código:** 0 bloques

### Estructura del documento
  - Response time degradation
  - Failure rate increase
  - Service load drops
  - Service load spikes
  - Reference period
  - Thresholds for a specific database service
  - Thresholds for a specific database statement
  - Related topics

### Contexto por sección
- **Response time degradation:** This type of anomaly detection observes the response time of your databases and triggers an alert if a metric violates the specified thresholds. Dynatrace can detect degradation based on automatic baselining or fixed thresholds.
- **Response time degradation:** Dynatrace evaluates degradation for two categories—all responses and the slowest 10%—and triggers an alert if **any** response time violates the threshold.
- **Response time degradation:** To configure the response time degradation detection ** Automated baselining Fixed thresholds - Turn on Detect response time degradation** and select **automatically** from the list. - Set degradation values in the remaining fields. Violation of **any** criterion triggers an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which a database should be considered a low load. Databases with 
- **Response time degradation:** - Turn on **Detect response time degradation** and select **using fixed thresholds** from the list. - Set degradation values in the remaining fields. Violation of **any** criterion triggers an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which a database should be considered a low load. Databases with lower load rates are excluded from evaluation. - Optional To avoid accidental alert
- **Response time degradation:** - Low: High statistical confidence is used, so brief violations (for example, due to a surge in load) won't trigger alerts. - Medium: Reasonable statistical confidence is used to not alert on every single violation. - High: No statistical confidence is used. Each violation triggers an alert.
- **Response time degradation:** For fixed thresholds, the problem impact includes the fixed threshold and the amount by which the threshold was exceeded.
- **Failure rate increase:** This type of anomaly detection observes the failure rate of your database services and triggers an alert if the rate exceeds the specified thresholds. Dynatrace can detect failure rate increase based on automatic baselining or fixed thresholds.
- **Failure rate increase:** To configure the increased failure rate detection ** Automated baselining Fixed thresholds - Turn on Detect increase in failure rate** and select **automatically** from the list. - Specify the **relative %** and **absolute %** values above which alerts should be sent out. **Both** thresholds must be violated to trigger an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which a database 
- **Failure rate increase:** - Optional To avoid accidental alerts, define how long a database must stay in abnormal state to trigger an alert.
- **Failure rate increase:** - Turn on **Detect increase in failure rate** and select **using fixed thresholds** from the list. - Specify the **absolute %** value above which alerts should be sent out. - Optional To avoid over-alerting, define an **actions/min** rate below which a database should be considered a low-load database. Databases with lower load rates are excluded from evaluation. - Optional To avoid accidental alerts, define how long
- **Failure rate increase:** - Low: High statistical confidence is used, so brief violations (for example, due to a surge in load) won't trigger alerts. - Medium: Reasonable statistical confidence is used to not alert on every single violation. - High: No statistical confidence is used. Each violation triggers an alert.
- **Failure rate increase:** For fixed thresholds, the problem impact includes the fixed threshold and the amount by which the threshold was exceeded.
- **Service load drops:** This type of anomaly detection learns the normal behavior of your database service load over a period of 7 days and triggers an alert if the load drops significantly.
- **Service load drops:** To configure the database service drops detection - Turn on **Detect service load drops**. - Specify the observed load threshold to receive alerts in case of load drops. - Optional To avoid accidental alerts, define how long a database must stay in abnormal state to trigger an alert.
- **Service load spikes:** This type of anomaly detection learns the normal behavior of your database service load over a period of 7 days and triggers an alert if the load increases significantly.

## [17] Adjust the sensitivity of anomaly detection for applications — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-applications
- **Score:** 96 · **Código:** 0 bloques

### Estructura del documento
  - Key performance metric degradation
  - Traffic drops
  - Traffic spikes
  - Failure rate increase
  - Reference period
  - Thresholds for a specific application
  - Related topics

### Contexto por sección
- **Key performance metric degradation:** This type of anomaly detection observes key performance metrics and triggers an alert if a metric violates the specified threshold. Dynatrace can detect degradation based on automatic baselining or fixed thresholds.
- **Key performance metric degradation:** Dynatrace evaluates degradation for two categories—all actions and the slowest 10%—and triggers an alert if **any** metric violates the threshold.
- **Key performance metric degradation:** To configure key performance metric degradation detection ** Automated baselining Fixed thresholds - Turn on Detect key performance metric time degradations** and select **automatically** from the list. - Set degradation values in the remaining fields. Violation of **any** criterion triggers an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which an application should be considered a l
- **Key performance metric degradation:** - Optional To avoid accidental alerts, define how long an application must stay in abnormal state to trigger an alert.
- **Key performance metric degradation:** - Turn on **Detect key performance metric time degradations** and select **using fixed thresholds** from the list. - Set degradation values in the remaining fields. Violation of **any** criterion triggers an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which an application should be considered a low-traffic application. Applications with lower traffic rates are excluded from evaluati
- **Key performance metric degradation:** - Low: High statistical confidence is used, so brief violations (for example, due to a surge in load) won't trigger alerts. - Medium: Reasonable statistical confidence is used to not alert on every single violation. - High: No statistical confidence is used. Each violation triggers an alert.
- **Key performance metric degradation:** For fixed thresholds, the problem impact includes the fixed threshold and the amount by which the threshold was exceeded.
- **Traffic drops:** This type of anomaly detection learns the normal behavior of your application's traffic over a period of 7 days and triggers an alert if the traffic drops significantly.
- **Traffic drops:** To configure traffic drops detection - Turn on **Detect traffic drops**. - Specify the observed traffic threshold to receive alerts in case of traffic drops.
- **Traffic spikes:** This type of anomaly detection learns the normal behavior of your application's traffic over a period of 7 days and triggers an alert if the traffic rises significantly.
- **Traffic spikes:** To configure traffic spikes detection - Turn on **Detect traffic spikes**. - Specify the observed traffic threshold to receive alerts in case of traffic spikes.
- **Failure rate increase:** This type of anomaly detection observes the failure rate of your applications and triggers an alert if the rate exceeds the specified thresholds. Dynatrace can detect failure rate increase based on automatic baselining or fixed thresholds.
- **Failure rate increase:** To configure the increased failure rate detection ** Automated baselining Fixed thresholds - Turn on Detect increase in failure rate** and select **automatically** from the list. - Specify the **relative %** and **absolute %** values above which alerts should be sent out. **Both** thresholds must be violated to trigger an alert. - Optional To avoid over-alerting, define an **actions/min** rate below which an applicat
- **Failure rate increase:** - Optional To avoid accidental alerts, define how long an application must stay in abnormal state to trigger an alert.
- **Failure rate increase:** - Turn on **Detect increase in failure rate** and select **using fixed thresholds** from the list. - Specify the **absolute %** value above which alerts should be sent out. - Optional To avoid over-alerting, define an **actions/min** rate below which an application should be considered a low-traffic application. Applications with lower traffic rates are excluded from evaluation. - Optional To avoid accidental alerts,

## [18] Adjust the sensitivity of anomaly detection for infrastructure — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-infastructure
- **Score:** 102 · **Código:** 0 bloques

### Estructura del documento
  - Thresholds for specific disks
    - Anomaly detection configuration hierarchy
  - Thresholds for a specific host group
  - Thresholds for a specific host
  - Related topics

### Contexto por sección
- **Thresholds for specific disks:** Server-side disk alerting for new tenants
- **Thresholds for specific disks:** Starting with SaaS version 1.308, server-side disk alerting is disabled for new tenants by default. We recommend using Disk Edge alerting instead. Disk Edge alerting allows you to create more complex and specific rules using: - Metrics to alert on (available disk space, is read-only file system, read time, write time, and available inodes) - Operating system to which the policy should be applied - Disk name filters -
- **Thresholds for specific disks:** Keep in mind that Disk Edge alerting requires OneAgent version 1.293+.
- **Thresholds for specific disks:** Dynatrace Intelligence automatically detects disk anomalies such as low available disk space or slow disks. There are different kinds of disks on a host, such as a boot disk, a disk holding all the logs, or a disk for storing business data. While alerting on low disk space would not make any sense for a fixed-sized boot disk image, it makes perfect sense for a disk containing critical business data.
- **Thresholds for specific disks:** With custom disk detection rules, you can provide fine-tuned rules for individual groups (groups are based on disk name patterns and/or host tags) of disks. Disk-level thresholds override global thresholds for matching disks, while global settings still apply to other disks.
- **Thresholds for specific disks:** To change threshold settings for a group of disks
- **Thresholds for specific disks:** Go to **Settings** > **Anomaly detection**.
- **Thresholds for specific disks:** In the **Infrastructure** section, select **Custom disk-detection rules**.
- **Thresholds for specific disks:** Select the metric to be monitored and provide a meaningful name for the rule.
- **Thresholds for specific disks:** Specify the threshold for the metric and the number of samples that must violate the threshold to trigger an alert.
- **Thresholds for specific disks:** Optional Specify the name pattern of the disk.
- **Thresholds for specific disks:** The individual rules aren't logically bound and are applied separately. For example, if one rule matches all disks not containing `A` and another matches all disks not containing `B`, then every disk will be matched by either the first, the second, or both rules simultaneously. Note that it is also not possible to add multiple values, wildcards, or regular expressions within a single rule filter.
- **Thresholds for specific disks:** Optional To further narrow down the disk usage, list the tags that the host must have.
- **Anomaly detection configuration hierarchy:** You can configure anomaly detection on multiple levels—environment, host group, host, and so on. When you have multiple rules affecting the same entity, the most specific rule prevails over more generic rules, as described on the diagram below.
- **Thresholds for a specific host group:** To configure the disk rules for a specific host group - Go to **Deployment Status**. - Filter the table by **Host group** and select the name of the host group for which you want to configure custom disk-detection rules. - For one of the listed hosts, select the host group. - Expand **Anomaly detection** and select **Custom disk-detection rules**. - Select **Add item**. - Select the metric to be monitored and provide

## [19] Anomaly Detection app — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-app
- **Score:** 80 · **Código:** 0 bloques

### Estructura del documento
    - Permissions
    - Installation
  - Learning modules
  - Custom alert actors
    - Actor
      - Service user
  - Explore in Dynatrace Hub
  - Related topics

### Contexto por sección
- **Permissions:** The following table describes the required permissions. settings:schemas:read Read access to settings schemas. settings:objects:read Read access to settings objects. settings:objects:write Write access to settings objects. iam:service-users:use Allows using service users davis:analyzers:read Read list of analyzers state:user-app-states:write Write user settings state:user-app-states:read Read user settings davis:anal
- **Permissions:** User permissions can only be changed by your Dynatrace administrator in **Account Management** > **Identity and Access Management**. To learn more about user groups and assigning permissions, see Working with policies .
- **Installation:** Make sure the app is installed in your environment . Get started Concepts Use cases
- **Installation:** 1 of 3 Get an overview of all available anomaly detectors.
- **Installation:** When you open the app, you can see the information about your existing anomaly detection configurations, such as: - Status—If there's an error, the status is displayed as **Error**, select it to open the detailed report in a notebook . - Source - Type of anomaly prediction model
- **Installation:** **Column settings** and then select the columns you want to display. You can also filter the table by any of these parameters.
- **Learning modules:** Go through the following processes to learn how to use **Anomaly Detection**: 01 Anomaly Detection DQL writing guide
- **Learning modules:** How-to guide - Best practices for creating Anomaly Detection custom alert DQL queries.
- **Learning modules:** 02 Anomaly Detection DQL optimization guide
- **Learning modules:** How-to guide - Best practices for optimizing Anomaly Detection DQL queries.
- **Learning modules:** How-to guide - Learn how to create and edit simple custom alerts in the Anomaly Detection app.
- **Learning modules:** How-to guide - Learn how to create and edit advanced custom alerts in the Anomaly Detection app
- **Learning modules:** Explanation - Understand the health status types in Anomaly Detection and what they mean and learn about safety mechanism for failing quesries.
- **Custom alert actors:** Every execution of custom alert is performed in the context of a user. If you're an administrator or have permission to use a predefined service user, you'll see two types of users you can choose when creating or editing a custom alert: actor and service user. Otherwise, you'll be the only visible actor.
- **Actor:** An actor is the user used to execute the custom alert. Unless you have administrator rights or permission to use a predefined service user, you'll only have the option to set yourself as an actor for either a new or updated custom alert configuration.

## [20] Anomaly Detection status types — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-app/anomaly-detection-status-types
- **Score:** 76 · **Código:** 0 bloques

### Estructura del documento
  - Anomaly Detection status list
    - Throttling behavior after sustained query failure
  - Troubleshooting
  - Related topics

### Contexto por sección
- **Anomaly Detection status list:** A custom alert can have any of the following status types: Status Description
- **Anomaly Detection status list:** The success rate for the last 24 hours is over 99%.
- **Anomaly Detection status list:** The success rate for the last 24 hours is under 95%.
- **Anomaly Detection status list:** The success rate for the last 24 hours is between 95% and 99%.
- **Anomaly Detection status list:** Status currently unavailable. Check if you have the following permissions: - `storage:system:read`
- **Anomaly Detection status list:** Can't calculate the success rate. The custom alert has not yet been executed, or the query does not contain any execution events.
- **Throttling behavior after sustained query failure:** When a query fails repeatedly, Dynatrace activates throttling to avoid incurring additional costs for failed query executions.
- **Throttling behavior after sustained query failure:** After the query execution has failed for the first time, Dynatrace begins to progressively suppress subsequent execution attempts. The timeframe starts from every 2 minutes, then progresses to 4, 8, 16, 32, and 64 minutes for each subsequent failed attempt. If the query still fails, the execution timeframe is set to once every 24 hours until the query execution succeeds.
- **Throttling behavior after sustained query failure:** Suppressing failing query executions allows you to check whether the issue has been resolved while reducing potential costs of failing queries.
- **Troubleshooting:** If the status of your custom alert shows an error, select
- **Troubleshooting:** **Error** > **View more details** to see the error message.
- **Troubleshooting:** Some of the error messages might be more complicated than others. Here are some of the common ones to help you resolve the issue faster. - `Query failed because the response time exceeded 10000 ms`: **Anomaly Detection** sets a 10-second execution limit on queries. This safety limit helps to prevent other custom alert configurations from being delayed or stuck in the queue.
- **Troubleshooting:** - `Query does not result in a valid timeseries: No valid time series records found. A valid time series record contains a single duration field, a single timeframe and one or multiple numeric arrays. Consider using the 'timeseries' or 'makeTimeseries' DQL command`: **Anomaly Detection** requires a timeseries to automatically check the alert condition. For more information and examples of a valid query, see Examples o
- **Related topics:** - Anomaly Detection app - Examples of anomaly detection on Grail Related tags

## [21] Auto-adaptive thresholds for anomaly detection — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/auto-adaptive-threshold
- **Score:** 76 · **Código:** 0 bloques

### Estructura del documento
  - Auto-adaptive vs. static threshold
  - Threshold calculation
  - Related topics

### Contexto por sección
- **Auto-adaptive vs. static threshold:** Let's look at an example where an adaptive threshold has an advantage over a statically defined threshold. The chart below shows a disk's measured write times in milliseconds. This is a volatile metric that spikes depending on the amount of write pressure the disk faces. If we were to define a threshold for each disk within this IT system based on the initial data (beginning of the chart), we'd set the static thresho
- **Auto-adaptive vs. static threshold:** An example of static threshold anomaly detection of disk write time in the Notebooks app.
- **Auto-adaptive vs. static threshold:** Auto-adaptive thresholds, however, automatically adapt reference thresholds daily based on the measurements of the previous seven days. If a metric changes its behavior, the threshold adapts automatically.
- **Auto-adaptive vs. static threshold:** An example of auto adaptive threshold anomaly detection of disk write time in the Notebooks app.
- **Threshold calculation:** The reference values for threshold calculation are the metric data values over the last seven days. - Measurements for each minute are used to calculate the 99 th percentile of all the measurements. This determines the appropriate **baseline**. - The interquartile range between the 25 th and 75 th percentiles is then used as the **signal fluctuation**, which can be added to the baseline. By using the `number of signa
- **Threshold calculation:** Another important parameter for dynamic thresholds is the sliding window that is used to compare current measurements against the calculated threshold. It defines how often the calculated threshold must be violated within a sliding window of time to raise an event (violations don't have to be successive). This approach helps to avoid alerting too aggressively on single violations. You can set the sliding window to a 
- **Threshold calculation:** By default, any 3 minutes out of a sliding window of 5 minutes must violate your threshold to raise an event. That is, an event must have 3 violating minutes within any 5-minute sliding window.

## [22] Best practices for entity ownership — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/deliver/ownership/ownership-classic/best-practices
- **Score:** 78 · **Código:** 0 bloques

### Estructura del documento
  - Ownership assignment
    - Kubernetes
    - Tags
      - Advantages and uses of tags
      - Important considerations when using tags for ownership
  - Team information
  - Related topics

### Contexto por sección
- **Ownership assignment:** We recommend that you **assign owners to critical entities**. These are entities that experience a high number of outages or security issues, have high throughput, are business critical, or are customer facing.
- **Ownership assignment:** **Use these recommended methods for applying ownership based on entity type**; while you can use tags to apply ownership to any monitored entity, these recommended methods are the most efficient ways to assign entities to owners. - Kubernetes labels for Kubernetes objects - Metadata for hosts - Environment variables for processes - Tags (manual, automated, and via API) for all other entities
- **Kubernetes:** For Kubernetes objects , **define ownership simultaneously for all desired Kubernetes objects**. This ensures that all your Kubernetes objects have adequate ownership coverage at the time of deployment. - Always apply labels for the **Deployment**. - We recommend specifying ownership for at least the `CLOUD_APPLICATION` (for example, the Deployment, Job, CronJob, or DaemonSet) and the `CLOUD_APPLICATION_INSTANCE` (Po
- **Kubernetes:** Sample Kubernetes deployment file with ownership defined for Deployment, Pod, and process
- **Kubernetes:** apiVersion : apps/v1 kind : Deployment metadata : name : demo labels : dt.owner-1 : my - team - 1 # Dual team ownership defined for the Deployment dt.owner-2 : my - team - 2 spec : replicas : 1 selector : matchLabels : app : demo template : metadata : labels : app : demo dt.owner-1 : my - team - 1 # Ownership defined for the Pod spec : containers : - name : demo image : demo : 1.0.0 ports : - containerPort : 8888 env
- **Tags:** **Use tags to apply ownership only for entities that aren't covered by other methods**.
- **Advantages and uses of tags:** - Tags are appropriate for assigning a **few stable entities** (for example, an application and the synthetic monitors running against it) to specific ownership teams. - Manual tagging or the Custom tags API are effective in applying ownership to **existing (already deployed) entities**. - Automatic tagging rules have the advantage of capturing **new entities** that match your tagging rules. Automatically applied tag
- **Advantages and uses of tags:** - While the Custom tags API and automatic tagging rules both use the powerful and flexible **entity selector** for selecting entities, the **Custom tags API call is executed immediately**. This is a major advantage over automatic tagging rules that are scheduled via the Dynatrace tagging process. This helps you speed up execution time when complex tagging rules are necessary.
- **Important considerations when using tags for ownership:** - **Manual tagging** doesn't **scale** adequately for assigning ownership in large, dynamic monitoring environments. Manual tags can also be removed manually. - While (web UI–based) **automatic tagging rules** are designed for complexity, automatic tagging runs can take a **long time** to be completed, depending on the complexity of your rules and the size of your environment. Meanwhile, a critical entity experiencin
- **Important considerations when using tags for ownership:** - While the **Custom tags API call** is executed immediately, the tradeoff is that it's a **one-time operation**. Depending on the frequency of your tagging runs, new or short-lived entities could miss being tagged with ownership information entirely, making it difficult to find owners in case of vulnerabilities or outages. - We **do not recommend** using tags to apply ownership to processes or process groups.
- **Team information:** While only the **Team name** and **Team identifier** fields are required for creating an ownership team , here are some suggestions and best uses of other fields.
- **Team information:** When defining custom keys for ownership identifiers, use specific, easily understandable names that are not likely to be used for other tagging needs.
- **Team information:** Always add a team **Description**—this is displayed along with the team name on the **Ownership teams** settings page and helps to differentiate teams at a glance. Teams with no description or a poor name (team 1) offer no clues as to their role in your organization. Teams with descriptions (2 and 3) are more identifiable.
- **Team information:** **Supplementary identifiers**—you can define up to three per team—are especially useful when:
- **Team information:** - Your team name changes—you can add a supplementary identifier to reflect the name change while leaving the main team identifier unchanged. (Once created, the main team identifier cannot be edited or changed.) - You want to define sub-teams. Create a supplementary ID for each sub-team—you can use the main team ID as a prefix. For example, for the main team ID `team1`, create the supplementary IDs `team1-taskforce` a

## [23] Adjust the sensitivity of anomaly detection — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection
- **Score:** 78 · **Código:** 0 bloques

### Estructura del documento
  - Related topics

## [24] Process group availability monitoring and alerting — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/infrastructure-observability/process-groups/monitoring/process-group-availability-monitoring-and-alerting
- **Score:** 76 · **Código:** 0 bloques

### Estructura del documento
  - Enable process-group availability monitoring
  - When to activate this setting

### Contexto por sección
- **Enable process-group availability monitoring:** Instead of reporting process availability events of service-hosting process groups by default, you have the option to receive alerts when a process becomes unavailable or when minimum threshold isn't met. - Go to **Hosts Classic**. - Select the host you’re interested in. - Scroll down and select **Consuming processes**. - From the **Process** list, select the process group (or individual process) you’re interested in
- **Enable process-group availability monitoring:** - Select **Availability monitoring**. - Alerting is disabled by default. **Enable process group availability monitoring** must be toggled on in order to enable alerting.
- **When to activate this setting:** Once the **Enable process group availability monitoring** is toggled on, you have two options. Receive alerts only for the most important process-group availability issues
- **When to activate this setting:** This option triggers an availability event when any process in the selected process group becomes unavailable.
- **When to activate this setting:** Raise an alert when any process in a selected process group becomes unavailable
- **When to activate this setting:** This option triggers an availability event when a user-defined threshold for the minimum number of running processes within a selected process group isn’t met.
- **When to activate this setting:** In the example below, the required minimum number of running processes is set to `2`. This means that whenever this process group has fewer than two running processes, Dynatrace will trigger an availability-level event for the process group.
- **When to activate this setting:** Infrastructure Observability Technologies Classic
