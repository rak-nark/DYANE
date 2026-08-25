# Research Brief: Auto-adaptive thresholds for anomaly detection multidimensional baselining dynamic thresholds sliding window and sensitivity

> Generado deterministamente por `dtx skill draft`. Material de trabajo para la síntesis de la skill.
> La IA debe construir el SKILL.md final SOLO a partir de este brief (principio documentation-first).

- **Dominio:** general
- **Consultas ejecutadas:** 12
- **Documentos analizados:** 24
- **Generado:** 2026-08-25T18:51:57.279Z

## Mapa de fuentes (ranking por relevancia)

| # | Score | Título | Código | URL |
|---|-------|--------|--------|-----|
| 1 | 78 | Classic environment v2 / Dynatrace Developer | 264 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/ |
| 2 | 78 | Classic environment v2 / Dynatrace Developer | 264 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/v8/ |
| 3 | 78 | Classic environment v2 / Dynatrace Developer | 263 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/v7/ |
| 4 | 59 | Classic environment v2 / Dynatrace Developer | 227 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v2/v5/ |
| 5 | 83 | Global field reference — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/semantic-dictionary/fields |
| 6 | 100 | Classic environment v1 / Dynatrace Developer | 59 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v1/ |
| 7 | 100 | Classic environment v1 / Dynatrace Developer | 59 | https://developer.dynatrace.com/develop/sdks/client-classic-environment-v1/v2/ |
| 8 | 102 | Best practices for avoiding overalerting — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/use-cases/avoid-overalerting |
| 9 | 186 | Anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection |
| 10 | 178 | Host anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/infrastructure-observability/hosts/configuration/anomaly-detection |
| 11 | 152 | Adjust the sensitivity of anomaly detection for services — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-services |
| 12 | 151 | Adjust the sensitivity of anomaly detection for database services — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-services-database |
| 13 | 162 | Adjust the sensitivity of anomaly detection for infrastructure — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-infastructure |
| 14 | 144 | Adjust the sensitivity of anomaly detection for applications — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-applications |
| 15 | 187 | Auto-adaptive thresholds for anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/auto-adaptive-threshold |
| 16 | 113 | Anomaly detection configuration — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-configuration |
| 17 | 144 | Static thresholds for anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/static-thresholds |
| 18 | 63 | Service detection rules — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/observe/application-observability/services/service-detection/service-detection-v1/customize-service-detection |
| 19 | 74 | Upgrade Guide - Metric Alerting — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/platform/upgrade/metric-alerting |
| 20 | 111 | Adjust the sensitivity of anomaly detection — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection |
| 21 | 74 | Anomaly Detection app — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-app |
| 22 | 75 | Use segments with Anomaly Detection custom alerts — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/use-cases/use-segments-anomaly-detection |
| 23 | 80 | Anomaly Detection status types — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-app/anomaly-detection-status-types |
| 24 | 114 | Automated multi-dimensional baselining — Dynatrace Docs | 0 | https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/automated-multidimensional-baselining |


## [13] Adjust the sensitivity of anomaly detection for infrastructure — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-infastructure
- **Score:** 162 · **Código:** 0 bloques

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

## [14] Adjust the sensitivity of anomaly detection for applications — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection/adjust-sensitivity-applications
- **Score:** 144 · **Código:** 0 bloques

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

## [15] Auto-adaptive thresholds for anomaly detection — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/auto-adaptive-threshold
- **Score:** 187 · **Código:** 0 bloques

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

## [16] Anomaly detection configuration — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-configuration
- **Score:** 113 · **Código:** 0 bloques

### Estructura del documento
  - Data source
  - Delay
  - Data type
    - Timeseries
      - Analyzer type and parameters
    - Records
      - Alert identity fields
      - Choosing a correct alert identity field
  - Missing data alert
  - Sliding window
  - Event template
  - Related topics

### Contexto por sección
- **Data source:** Data source provides a time series that is evaluated by Dynatrace Intelligence: - Previous Dynatrace A metric defines the time series. It can be a single metric defined by a metric key or a metric expression .
- **Data source:** If your data has a latency, you need to offset it in your configuration via the **Query offset** parameter. Specify the value in minutes.
- **Delay:** The **Delay** parameter helps you to reduce the frequency of DQL query executions performed by a custom alert in an hour, thereby helping to lower query costs and minimize system load.
- **Delay:** While the default delay period between custom alert executions is `1 Minute`, you can configure the query execution to longer intervals (for example, every five minutes) without losing the ability to perform retroactive evaluations for each minute within the selected time window.
- **Delay:** You can configure the **Delay** parameter using **Minutes** or **Seconds**, but the delay can't be longer than `60 Minutes`.
- **Data type:** The **Data type** parameter allows you to choose which type of data for which the **Anomaly Detection** configuration should create alerts. - Timeseries - Records
- **Timeseries:** Timeseries analyzers alert based on the detected threshold violations, like static threshold analyzer, and pattern deviations, like seasonal baseline. This means that timeseries analyzers raise an alert based on: - A threshold violation condition (above the threshold, below the threshold, or both), where the threshold is calculated from continuous monitoring or is fixed and set within the known, predefined range. - A
- **Timeseries:** Timeseries analyzers are suitable for: - Continuous timeseries monitoring - Pattern detection - Reducing noise in case of frequent value shifts, which can be done via the sliding window
- **Analyzer type and parameters:** Analyzer parameters define how Dynatrace Intelligence evaluates the data provided by the data source. The exact set of parameters depends on the type of the analysis: - Auto-adaptive threshold —Dynatrace calculates the threshold automatically and adapts it dynamically to your data's behavior. - Seasonal baseline —Dynatrace creates a confidence band for data with seasonal patterns. - Static threshold —A threshold that
- **Analyzer type and parameters:** The auto-adaptive threshold consists of two components: a baseline and a signal fluctuation. This parameter defines how many times the signal fluctuation is added to the baseline. For more information, see Threshold calculation .
- **Analyzer type and parameters:** This parameter defines the value of a static threshold and, if applicable, its unit. Select **Suggest values** to use a value calculated by Dynatrace Intelligence based on the previous data.
- **Analyzer type and parameters:** This parameter defines the tolerance of the seasonal model. The higher the tolerance, the broader the confidence band, leading to fewer triggered events.
- **Analyzer type and parameters:** This parameter defines when an event is triggered: if the metric is above, below, or outside of the threshold.
- **Analyzer type and parameters:** This parameter defines whether the missing data alert is active for the configuration. If active, it's combined with the threshold condition by the **OR** logic. You can find it in the **Advanced properties** section of the configuration.
- **Records:** A records data type analyzer alerts based on the records that matches the filters provided in the **Query** parameter field. This means that each record detected by a custom alert with **Data type** set to **Records** is treated as a potential anomaly that should be reported.

## [17] Static thresholds for anomaly detection — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/static-thresholds
- **Score:** 144 · **Código:** 0 bloques

### Estructura del documento
  - Related topics

## [18] Service detection rules — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/observe/application-observability/services/service-detection/service-detection-v1/customize-service-detection
- **Score:** 63 · **Código:** 0 bloques

### Estructura del documento
  - Manage rule-based service detection
  - Configure service detection rules via UI
    - Prerequisites
    - Create a rule
    - Modify a rule
    - Delete a rule
  - Configure service detection rules via Settings API
    - List all rules
    - View a rule
    - Reorder rules
  - Service detection configuration examples
    - Separate fully monitored web request services based on URL or superimposed context root
    - Merge application data into a single service, based on the application ID value
    - Separate services for “public network services” based on URL
    - Separate services for “public network services” based on subdomains
  - Improve service detection
    - Web server naming issues
    - Define web application IDs
    - Rotating and anonymous ports
  - FAQ
  - Related topics

### Contexto por sección
- **Manage rule-based service detection:** You can use transformation rules, for example, to remedy the following use cases:
- **Manage rule-based service detection:** If the web Application IDs contain the version or build date, you can define a rule that removes the build date/ID from the web application ID.
- **Manage rule-based service detection:** When server names are not properly defined in the underlying deployment (for example, with Apache HTTP or Nginx in AWS environments), you can define a stable web server name and therefore a stable cluster service containing all instances.
- **Manage rule-based service detection:** You can correct the misuse of the context root in the deployed application.
- **Manage rule-based service detection:** A typical web server has a concept called the context root to separate services based on the URL. For some technologies, such as Node.js, the context root is not available or it's improperly defined. You can superimpose the context root, and create separate services for each of your applications, instead of a single service containing multiple applications.
- **Manage rule-based service detection:** You can ignore the port for service detection. This is helpful when the port is used dynamically, for example, in Node.js applications.
- **Manage rule-based service detection:** Additionally, the rules can be exported and imported from one environment to another.
- **Manage rule-based service detection:** Detection rules are evaluated from top to bottom, and the first matching rule applies, so be sure to place your rule in the correct position on the list.
- **Configure service detection rules via UI:** You can configure service detection rules via the Dynatrace web UI.
- **Prerequisites:** Familiarize yourself with the notion of a full and external (opaque) request .
- **Create a rule:** When you define a new rule, depending on the configuration, the original services might get less traffic or no traffic at all. New monitoring data is then redirected according to the rule configuration, between the original and the newly detected services.
- **Create a rule:** To define a new service detection rule via the Dynatrace web UI - Go to **Settings**. - Expand **Service Detection** and select a request type (**Full web request rules** or **Full web service rules**, or **External web request rules** or **External web service rules**). Select **Add item** and start configuring the parameters of the new rule.
- **Create a rule:** - Type a **Rule name**. - To change the service detection's behavior, enable at least one of the service identifier contributors, so that the rule's triggered. - To target the rule application, in the **Conditions** section, configure restrictions related to—for example—a management zone, specific conditions, or the port.
- **Modify a rule:** When you modify a rule, some services might not be affected by it anymore. While historical data is available only for the previous service, all newly captured data is then associated with the new standalone service.
- **Modify a rule:** To edit an existing rule via the Dynatrace web UI - Go to **Settings**. - Expand **Service Detection** and select a request type (**Full web request rules** or **Full web service rules**, or **External web request rules** or **External web service rules**). Expand

## [19] Upgrade Guide - Metric Alerting — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/platform/upgrade/metric-alerting
- **Score:** 74 · **Código:** 0 bloques

### Estructura del documento
  - New concepts
    - Anomaly detection
  - Prerequisites
  - Metric alerting in Dynatrace Classic
    - Out-of-the-box detectors in the previous Dynatrace
    - Customizable classic custom alerts in the previous Dynatrace
      - Metric events
  - How to upgrade metric events to custom alerts
    - Anomaly Detection
  - Example: Upgrade of a metric event from Dynatrace Classic
    - Choose metrics for upgrading
    - Transformation
    - Verify that everything works as expected
  - Related topics

### Contexto por sección
- **New concepts:** Before you start with performing this upgrade, familiarize yourself with core concepts of the latest Dynatrace, such as what Dynatrace Grail is and how to query data using DQL .
- **Anomaly detection:** Anomaly detection is the automated process of identifying unusual patterns or behaviors within data that deviate from the norm. This involves continuous monitoring of application performance, user actions, and various metrics to establish baseline metrics and detect any deviations in real-time. Customizable thresholds and automated baselining help in accurately detecting and notifying anomalies, ensuring prompt alert
- **Anomaly detection:** In the latest Dynatrace, custom alerts help with the following: - Getting notified about problems in an environment. - Using Davis analyzer ( static and auto-adoptive thresholds , or seasonal baseline ) to detect abnormal behavior and set up alerts for custom events.
- **Prerequisites:** - An active DPS license - **Anomaly Detection** permissions
- **Metric alerting in Dynatrace Classic:** The main use case for configuring and applying thresholds and baselines on metrics and timeseries in general is automatic detection of outliers and anomalies and raising alerts for those.
- **Metric alerting in Dynatrace Classic:** Dynatrace by default ships a large list of out-of-the-box custom alerts. Extensions and users have the possibility to introduce their own completely customized custom alerts.
- **Out-of-the-box detectors in the previous Dynatrace:** Host and process infrastructure custom alerts
- **Out-of-the-box detectors in the previous Dynatrace:** Detecting CPU and memory saturation along with network, host, process, and process groups instance availability detection. For more information, see Adjust the sensitivity of anomaly detection for infrastructure . Automated multi-dimensional baselining detector
- **Out-of-the-box detectors in the previous Dynatrace:** Automated baselining attempts to determine the best reference values for incoming application and service traffic. For more information, see the following topics: - Adjust the sensitivity of anomaly detection for applications - Adjust the sensitivity of anomaly detection for services - Adjust the sensitivity of anomaly detection for database services Extension events
- **Out-of-the-box detectors in the previous Dynatrace:** Installed extensions providing various event thresholds that are evaluated by anomaly detection. For more information, see Adjust the sensitivity of anomaly detection for extension events .
- **Metric events:** Dynatrace offers customizable custom alerts for domain specific business needs. Once a custom alert is triggered, an event is created based on metric data.
- **Metric events:** There are two types of metric events based on how the metric is queried for event evaluation:
- **Metric events:** Metric key events evaluate the incoming measures of a single metric. You can use only static thresholds with this query type.
- **Metric events:** Metric selector events evaluate a complex query defined by the metric selector . This query type can include historical data and even arithmetic operations with multiple metrics.
- **Metric events:** To learn more about the differences between metric key and metric selector and how to set them up in classic settings, see Dynatrace Metric Events – Setup anomaly detection based on your business

## [20] Adjust the sensitivity of anomaly detection — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/adjust-sensitivity-anomaly-detection
- **Score:** 111 · **Código:** 0 bloques

### Estructura del documento
  - Related topics

## [21] Anomaly Detection app — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-app
- **Score:** 74 · **Código:** 0 bloques

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

## [22] Use segments with Anomaly Detection custom alerts — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/use-cases/use-segments-anomaly-detection
- **Score:** 75 · **Código:** 0 bloques

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

## [23] Anomaly Detection status types — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/anomaly-detection-app/anomaly-detection-status-types
- **Score:** 80 · **Código:** 0 bloques

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

## [24] Automated multi-dimensional baselining — Dynatrace Docs

- **URL:** https://docs.dynatrace.com/docs/dynatrace-intelligence/anomaly-detection/automated-multidimensional-baselining
- **Score:** 114 · **Código:** 0 bloques

### Estructura del documento
    - Traffic
    - Error rate
    - Response time
  - Multi-dimensionality
    - Baselining dimensions
      - Application baselining dimensions
      - Service baselining dimensions
    - How automated baselining works
  - Smart alerting
    - Default baseline event timeouts

### Contexto por sección
- **Traffic:** Dynatrace application traffic anomaly detection is based on the assumption that most business traffic follows predictable daily and weekly traffic patterns. Dynatrace automatically learns each application's unique traffic patterns. Alerting on traffic spikes and drops begins after a learning period of one week because baselining requires a full week’s worth of traffic to learn daily and weekly patterns.
- **Traffic:** Following the learning period, Dynatrace forecasts the next week’s traffic and then compares the actual incoming application traffic with the prediction. If Dynatrace detects a statistically significant deviation from forecasted traffic levels, it raises an alert.
- **Error rate:** Dynatrace also alerts on failures. Alerting on error rate increases begins once the baseline cube is ready and the application or service, as well as its actions, requests, or endpoints, has run for at least 20% of a week (7 days).
- **Error rate:** For new services detected less than 24 hours ago, several adapted baselines are calculated in smaller intervals, enabling you to start monitoring as soon as possible. After the first 24-hour threshold is reached, adapted baselines are calculated at regular intervals on a daily basis.
- **Error rate:** Again, each baseline cube cell also contains the measured error rate. This perfectly adapts to individual browser versions that can show either a higher or lower error rate compared to other browser types.
- **Response time:** For response times, Dynatrace collects references for the median (above which are the slowest 50% of all callers) and the 90th percentile (the slowest 10% of all callers). A slowdown event is raised if the typical response times for either the median or the 90th percentiles degrade.
- **Response time:** Dynatrace places special emphasis on the 10% of slowest response times experienced by your customers. This is because if you only know the average (median or mean) response times experienced by the majority of your customers, you'll miss a crucial point: Some of your customers are experiencing unacceptable performance problems! Consider a typical search service that performs some database calls. The response time of 
- **Response time:** Alerting on response time degradations begins once the baseline cube is ready and the application or service has run for at least 20% of a week (7 days).
- **Response time:** For new services detected less than 24 hours ago, several adapted baselines are calculated in smaller intervals, which ensures that you can start monitoring them as soon as possible. After the first 24-hour threshold is reached, adapted baselines are calculated at regular intervals on a daily basis.
- **Multi-dimensionality:** Multi-dimensionality offers a highly granular baselining scheme, leading to a more sophisticated baselining approach that ultimately results in more accurate thresholds. The more accurate the thresholds are, the more intelligent the overall anomaly detection process becomes.
- **Multi-dimensionality:** Consider as an example the application baseline cube that is generated for the calculation of the response time thresholds. Suppose that you have a web application called "easyTravel". A non-multidimensional system would learn a reference value for the response time of the entire application. A more fine-grained approach however would delve into each user action and learn a separate reference value for each of them. 
- **Multi-dimensionality:** In addition to user actions, Dynatrace takes into account the geographical location. This means that Dynatrace AI will identify baselines for the combinations of each user action with each geolocation. A response time baseline of 90msec could be, for example, the response time baseline for the logout action in the US. But multi-dimensionality in Dynatrace AI goes even deeper. Each geolocation is combined with the bro
- **Multi-dimensionality:** For geolocations, Dynatrace offers multiple levels of granularity. For example, Dynatrace calculates not only the response time for the entire US region, but also the response time for each state, as well as for each city in each state. The same is true for other regions (for example, Europe, Asia). Conversely, a more coarse-grained view is possible for user actions, as user actions can be grouped into XHR and load a
- **Baselining dimensions:** The identification of reference values is based, as explained above, on a baseline cube calculation. For applications, this cube is generated by the combination of four application dimensions while for services, they are based on two dimensions.
- **Application baselining dimensions:** - **User action**: An application's user action (for example, `orange.jsf`, `login.jsp`, `logout`, or `specialOffers.jsp`). - **Geolocation**: Hierarchically organized list of geolocations where user sessions originate. Geolocations are organized into continents, countries, regions, and cities. - **Browser**: Hierarchically organized list of browser families, such as Firefox and Chrome. The topmost categories are the
