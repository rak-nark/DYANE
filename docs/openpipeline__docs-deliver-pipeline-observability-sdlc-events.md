---
formatVersion: "3.0.0"
id: "403d017af0d7ee12"
url: "https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events"
title: "Pipeline observability — Dynatrace Docs"
domain: "openpipeline"
crawledAt: "2026-08-25T21:20:16.625Z"
contentHash: "6b23af7c88aa8ab4f76515e4c9687bc3d451815ba69b622216f107c8b157cc4b"
source: "docs.dynatrace.com"
---

# Pipeline observability — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events)
- Domain: `openpipeline`
- Document ID: `403d017af0d7ee12`
- Format version: `3.0.0`

## Extracted Code Blocks

- No code blocks extracted

## Content

# Pipeline observability

- Latest Dynatrace
- Overview
- 1-min read
- Updated on Jun 09, 2026

People often say, "You can't manage what you can't measure."
This principle holds especially true for the software development lifecycle.
Pipeline observability is the practice of capturing telemetry data across the entire lifecycle to gain actionable insights and calculate key delivery metrics — as illustrated in the figure below. ![Pipeline observability diagram](https://cdn.bfldr.com/B686QPH3/as/px9g8mg5bpg8xkp72hq9cr79/Pipeline_observability-Light_Mode?auto=webp&format=png&position=1) Pipeline observability diagram 

By extending observability across the full software development pipeline, organizations unlock several critical capabilities: 
- End-to-end visibility: From planning and coding to deployment and monitoring, teams gain insight into every stage of the process.
- Proactive issue detection: Early identification of bottlenecks, failures, or inefficiencies helps prevent problems before they escalate.
- Feedback loops: Insights from later stages (like monitoring) can inform earlier phases (like planning), driving continuous improvement.
- Security and compliance: Observability supports auditing and ensures that security practices are consistently applied throughout the pipeline.

With pipeline observability in place, conditions such as failed builds, prolonged lead times, or irregular deployment frequencies can be automatically detected and addressed.
A cornerstone of this approach is the use of DORA metrics, which include: 
- Lead time for changes
- Deployment frequency
- Change failure rate
- Mean time to restore (MTTR)

Beyond metrics, logs and traces from pipeline executions provide valuable context for debugging failures and identifying performance bottlenecks.
This enables teams to optimize their pipelines for greater efficiency, reliability, and speed.
### Software development lifecycle events

Events within the Software Development Lifecycle (SDLC) play a pivotal role in achieving effective pipeline observability.
SDLC events represent key actions that occur throughout the lifecycle — such as releasing a new software version, deploying that version, or successfully passing a performance test.
These events are typically emitted by pipelines during the continuous integration (CI) or continuous delivery (CD) phases.
By capturing and analyzing SDLC events, teams gain access to complete, precise, and real-time data.
In essence, SDLC events serve as the foundational signals that power observability across the pipeline, enabling teams to monitor, measure, and optimize every step of the development and delivery process.
### Software development lifecycle event use cases

With SDLC events, you can unlock powerful capabilities across your software delivery process: 
- Derive engineering KPIs such as the DORA metrics — including lead time for changes, deployment frequency, change failure rate, and mean time to restore.
- Automate development and delivery workflows, from triggering test executions and validating releases to enabling progressive delivery strategies.
- Ensure compliance by providing a complete, auditable, end-to-end view of the software delivery lifecycle.
- Monitor pipeline health and dynamically scale infrastructure based on real-time demand and usage patterns.

These capabilities make SDLC events a foundational element for building intelligent, resilient, and efficient engineering platforms.
### Software development lifecycle dataflow

The event dataflow in Dynatrace has three stages: 
1. Capture – SDLC event data can be ingested from event streams, logs, and API (REST endpoint).
2. Process – The data processing pipeline processes incoming software lifecycle events to improve analysis and reporting. Rules can be created to filter, parse, enrich, transform, or assign a retention period. Rules are processed in sequence.
3. Analyze – You can explore data stored in Grail using the Dynatrace Query Language (DQL) to discover patterns, identify anomalies and outliers, report on trends, and more. With DQL queries, you can build dashboards, charts, metrics, and reports. You can also export selected data to external tools.
  ### Ingest SDLC events

Ingest SDLC events via API.### Analyse using examples

Analyze SDLC events from your pipeline using the examples we provided. 
## Related topics

- Observe GitLab pipelines and merge requests with Dashboards and SDLC events
- Observe Azure DevOps pipelines and pull requests with Dashboards and SDLC events
- Observe Argo CD deployment and application health with Dashboards and SDLC events
- Optimize engineering flow metrics using Jira data
- Observe GitHub workflow actions and pull requests with Dashboards and SDLC events
  Related tags Software Delivery
