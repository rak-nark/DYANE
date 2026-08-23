---
formatVersion: "2.0.0"
id: "65a15219f8937e47"
url: "https://docs.dynatrace.com/docs/ingest-from"
title: "Ingest data into Dynatrace — Dynatrace Docs"
domain: "openpipeline"
crawledAt: "2026-08-23T14:57:55.771Z"
contentHash: "70ab2e06e92e491112567e33d5e74833f1abc8404684fd1e0634f4dc6e51b4c7"
source: "docs.dynatrace.com"
---

# Ingest data into Dynatrace — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/ingest-from](https://docs.dynatrace.com/docs/ingest-from)
- Domain: `openpipeline`
- Document ID: `65a15219f8937e47`
- Format version: `2.0.0`

## Extracted Headings

- Ingest data into Dynatrace
- Where ingestion fits in the Dynatrace journey
- What determines the right approach
- Select your environment
- Infrastructure prerequisites

## Extracted Code Blocks

- No code blocks extracted

## Content

Ingest data into Dynatrace — Dynatrace Docs 
# Ingest data into Dynatrace

 Latest Dynatrace 

 Explanation 

 2-min read 
- Updated on Jun 22, 2026 

Dynatrace needs data to work. Before you can analyze performance, detect anomalies, trace requests, or trigger automation, your environment needs to send telemetry to Dynatrace. That process is ingestion: getting your data from wherever it originates into the platform.

This section covers every supported ingestion approach: which one fits your environment, how to set it up, and what happens to your data once it arrives.
## Where ingestion fits in the Dynatrace journey

Data doesn't go directly from your environment into dashboards: it passes through a processing layer that shapes how it lands in storage and becomes available for analysis and action. Ingestion is the first step in a sequence. Stage What happens Where to learn more 

**Ingest** 

Data leaves your environment via agents, SDKs, or API integrations and arrives at Dynatrace 

This section 

**Process** 

OpenPipeline routes, filters, enriches, and transforms your data before it reaches storage 

 Process your data with OpenPipeline 

**Store** 

Processed data lands in Dynatrace for querying, alerting, and analysis 

Automatic: no configuration required to get started 

**Analyze and act** 

Data becomes insights, alerts, dashboards, and automated responses 

Dynatrace platform 

You don't need to configure every stage before you start. Default pipelines handle your data automatically once it's flowing. Configure OpenPipeline later, after ingestion is working, when you need to shape how your data lands.
## What determines the right approach

Several factors determine the right data ingestion approach for your environment, including: 
- Your infrastructure type 
- Whether you can install software on it 
- What monitoring tools you already use 
- How you prefer to instrument 

 Choose how to ingest data into Dynatrace covers each factor and helps you identify the right path (or combination of paths) for your setup.
## Select your environment

If you're not sure which to select, or you think your environment may need more than one approach, see Choose how to ingest data into Dynatrace to help you decide. Section Best for 

 Servers and VMs 

Linux, Windows, AIX, Solaris, z/OS: physical or virtual machines you manage 

 Kubernetes 

Orchestrated containers on a K8s cluster, any cloud provider or self-managed 

 Containers and PaaS 

Docker on a host, Cloud Foundry, Heroku, Azure App Service: non-K8s containers and PaaS platforms 

 AWS Lambda 

AWS serverless functions: monitored using the Dynatrace Lambda extension or OpenTelemetry 

 Azure Functions 

Azure serverless functions: monitored using OpenTelemetry SDKs Amazon Web Services AWS managed services: RDS, S3, SQS, and CloudWatch metrics and logs 

 Microsoft Azure 

Azure managed services: Azure SQL, Blob Storage, and Azure Monitor metrics 

 Google Cloud Platform 

GCP managed services: Cloud SQL, Cloud Storage, and GCP Operations metrics 

 OpenTelemetry 

Existing OTel instrumentation, or a preference for open-standard SDK-based instrumentation regardless of environment 

 Extend and customize 

Custom data sources, unsupported technologies, or direct API ingestion 
## Infrastructure prerequisites

Some ingestion setups require connectivity infrastructure before data can flow, such as proxies, routing components, or network configuration for environments that can't reach Dynatrace directly. If a setup guide in this section tells you that you need an ActiveGate or specific network configuration, ActiveGate covers what to deploy and how.
