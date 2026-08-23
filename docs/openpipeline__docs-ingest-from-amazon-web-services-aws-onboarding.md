---
formatVersion: "2.0.0"
id: "7234e699c0b77391"
url: "https://docs.dynatrace.com/docs/ingest-from/amazon-web-services/aws-onboarding"
title: "Get started with AWS Cloud Platform Monitoring — Dynatrace Docs"
domain: "openpipeline"
crawledAt: "2026-08-23T14:59:42.953Z"
contentHash: "863756fb455a8cdc0d5ec1bd1c974e08baee9efa94dd8abb93bd52f9bc5206d8"
source: "docs.dynatrace.com"
---

# Get started with AWS Cloud Platform Monitoring — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/ingest-from/amazon-web-services/aws-onboarding](https://docs.dynatrace.com/docs/ingest-from/amazon-web-services/aws-onboarding)
- Domain: `openpipeline`
- Document ID: `7234e699c0b77391`
- Format version: `2.0.0`

## Extracted Headings

- Get started with AWS Cloud Platform Monitoring
- What will you learn?
- Eliminate heavy lifting
- Enriched telemetry for powerful cloud insights
- CloudWatch metrics
- AWS logs
- AWS topology
- AWS EventBridge events
- Next steps

## Extracted Code Blocks

- No code blocks extracted

## Content

Get started with AWS Cloud Platform Monitoring — Dynatrace Docs 
# Get started with AWS Cloud Platform Monitoring

 Latest Dynatrace 

 Explanation 
- Published Sep 25, 2025 

Our latest evolution in cloud observability delivers a seamless experience for acquiring diverse AWS cloud telemetry regardless of scale or speed.

Built natively on the Grail™ data lakehouse, this solution ensures that all ingested telemetry is stored efficiently and made available, powered by the Dynatrace software platform.

Apps like **Clouds** app can then leverage this rich data and metadata to deliver contextual visualizations, preconfigured health alerts, and ready-to-use dashboards.

Ingest metrics, logs, topology, and AWS EventBridge events to unlock actionable insights within minutes.
## What will you learn?

Onboard your AWS accounts and turn them into native Dynatrace AWS connections, managing them from a dedicated **Clouds** app app.

You'll learn how to: 
- Easily create an AWS connection using a streamlined user interface. 
- All AWS connection creation methods are powered by CloudFormation as Infrastructure-as-Code (IaC) engine. 
- Dynatrace administrators can define monitoring configurations and delegate deployment to AWS administrators—either via web UI or programmatically—supporting clear separation of duties. 
- Manage all your AWS connections from a single, unified UX pane. Configure monitoring settings and easily track connection health continuously. 
 
## Eliminate heavy lifting

The new AWS Cloud Platform Monitoring is fully managed by Dynatrace SaaS—no need to deploy ActiveGate compute resources for metric polling within your AWS environment.

This simplifies setup and operations, delivering a frictionless, cloud-native monitoring experience.
## Enriched telemetry for powerful cloud insights

Ingested telemetry signals (metrics, logs, topology, EventBridge events) are transformed and enriched with cloud-native metadata (for example, AWS tags and Account ID). Enriched signals enable: 
- Attribute-based filtering by querying via DQL 
- AWS tag-driven conditional notifications 
- Source-level enrichment with security context for fine-grained access control 
- Data segmentation by cloud attributes (for example, AWS Account ID) for scoped views 
 
### CloudWatch metrics

Our metrics strategy allows the polling of any CloudWatch metric from any namespace. 
- Cherry-pick metrics groups (collections of recommended metrics) for AWS services that are curated by our cloud engineers—the optimal starting point. 
- Business-critical AWS services often require the ingest of all key metrics. Use our Auto discovery metric group to accomplish that. 
- Cherry-pick only the AWS Regions that our metric poller should poll from. 
 
### AWS logs

Automated CloudWatch log integration via Firehose 
- Subscribe CloudWatch log groups to auto-generated Firehose streams for immediate ingestion and analysis via **Logs**.
- Route incoming logs to multiple log buckets using OpenPipeline for flexible processing. 
- Supported sources (for example, AWS Lambda CloudWatch Logs) are transformed and enriched with cloud metadata (for example, AWS tags, Account ID). 
- View logs in context within **Clouds**. For example, logs from Lambda functions are automatically linked and visualized.

For details, see AWS logs .
### AWS topology

Topology service periodically scans AWS environments to build a dynamic inventory of resources, enriched with detailed metadata.

Visualize all discovered resources and metadata directly in **Clouds** and leverage DQL to: 
- Identify idle resources or unattached EBS volumes. 
- Identify idle EC2 instance utlization across all your AWS environments. 
- Perform advanced queries using cloud attributes. 

For details, see AWS topology .
### AWS EventBridge events

Event-driven integration via AWS EventBridge 
- Subscribe AWS event sources and publish them to EventBridge, configured with Dynatrace as an API destination, enabling synchronous, event-driven upstream workflows. 
- Register and forward events such as `aws.health` for EC2, and visualize them in context within **Clouds**, which is directly linked to the affected EC2 instance.
- Define workflows, triggered by specific event types or payloads, to automate corrective actions based on an event content. 

For details, see Events in Amazon EventBridge .
## Next steps 

Manage all telemetry in context using **Clouds**—define alerts, drill down into specific data points, search and filter for resources.

For further details, see Clouds app . Related tags 

 Infrastructure Observability
