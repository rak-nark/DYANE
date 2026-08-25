---
formatVersion: "3.0.0"
id: "5d7d3021c6cdae15"
url: "https://docs.dynatrace.com/docs/deliver/backstage-integration"
title: "Backstage integration — Dynatrace Docs"
domain: "general"
crawledAt: "2026-08-25T21:20:10.124Z"
contentHash: "c53324bc65ec9716ca8e87200f32f343f0309b927e0e2717016342c1c207e3a7"
source: "docs.dynatrace.com"
---

# Backstage integration — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/deliver/backstage-integration](https://docs.dynatrace.com/docs/deliver/backstage-integration)
- Domain: `general`
- Document ID: `5d7d3021c6cdae15`
- Format version: `3.0.0`

## Extracted Code Blocks

- No code blocks extracted

## Content

# Backstage integration

- Latest Dynatrace
- Tutorial
- 4-min read
- Updated on Nov 17, 2025

Integrate Dynatrace into Backstage to level up developer experience.
## Introduction

Context-rich observability and security insights at hand - While developers know how their service behaves in a development or sandbox environment, they lack insights into the service performance during the staging process or in production. The Dynatrace Backstage plugins enable developers to fetch observability and security data from Dynatrace and display it in software components you manage through your [Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/). The data is in tabular format with smart links to Dynatrace Apps for deeper analysis and root cause investigation in case of a related problem or security vulnerability.

Backstage Dynatrace plugin for Managed and Backstage Dynatrace plugin are available to integrate Dynatrace into Backstage. Disclaimer 

The Backstage Dynatrace plugin for Managed is not explained on this page. For more information, see [Backstage Dynatrace plugin for Managed](https://github.com/backstage/community-plugins/tree/main/workspaces/dynatrace/plugins/dynatrace). 

The Backstage Dynatrace plugin for Managed 
- Display service-related problems and synthetic results
- Based on Dynatrace v2 API

The Backstage Dynatrace plugin provides 
- Kubernetes insights as default with context-rich deep linking
- Multi-environment support
- DQL-based approach to fetch any observability and security data
- Table representation of DQL results
- View Site Reliability Guardian validations

For more information, see [Backstage Dynatrace plugins](https://github.com/Dynatrace/backstage-plugin).
## Target Audience

You're a platform engineer who aims to reduce the cognitive load of developers and install processes that provide fast feedback to them. You should know Backstage and DQL to fulfill the developers` requirements to have a security overview of performance as well as the entry points for deeper investigations.
## Scenario

**Goal**

: Provide Developers with the necessary observability and security insights to improve and operate their components.

[Backstage](https://backstage.io/) has become a popular developer portal for building an Internal Development Platform (IDP). With the focus on various developer-oriented capabilities, the centralized [Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/) is a fundamental element in Backstage. It allows you to manage all your software like microservices, libraries, data pipelines, websites, machine learning models, and others. Backstage restores order to your microservices and infrastructure and enables your product teams to ship high-quality code quickly — without compromising autonomy.

Next to centrally managing software components, developers want to get real-time monitoring data and identify problems or security vulnerabilities for their deployments with one click. The Backstage Dynatrace plugin brings this information to the developers by providing overview tables with context-rich information in Backstage. As a result, they get an overview of the service performance and important indicators like problem counts or security vulnerabilities. Smart deep links lead the developer to Dynatrace, where they can conduct a deeper analysis and root cause investigation to avoid overloading this overview.

The following screenshot depicts the deployments of a service in three stages with a deep link to the Kubernetes workload and logs. Besides, it shows which Dynatrace environment monitors them. 

## Prerequisites
 
- Backstage version 1.18.0 or later
- OAuth 2.0 client:
  
1. Go to [**Account Management**](https://myaccount.dynatrace.com/). If you have more than one account, select the account you want to manage.
2. Select **Identity & access management** > **OAuth clients**.
3. Select **Create client**.
4. Enter a client description and the user email.
5. Select at least the following scopes.
  - `storage:metrics:read`
  - `storage:entities:read`
  - `storage:events:read`
  - `storage:buckets:read`
  - `storage:security.events:read`
6. Scroll down and select **Create client**.
7. Copy your client ID, client secret, and Dynatrace account URN. These settings are required for the Backstage plugin [configuration](https://github.com/Dynatrace/backstage-plugin?tab=readme-ov-file#add-dynatrace-environment-connection).
 
## Setup and use

### First, get started

The guide to installing, integrating, configuring, and running the Dynatrace Backstage plugin is explained and maintained in [getting started guide](https://github.com/Dynatrace/backstage-plugin?tab=readme-ov-file#getting-started).

In a nutshell, you need to: 
- Install the plugins in Backstage
- Integrate the frontend element in a component page
- Integrate the backend plugin
- Configure the Dynatrace environment connection
- Restart/Run Backstage
 
### Second, leverage additional features

The Backstage Dynatrace plugins provide a couple of customization features for different requirements. 
- Multi-environment support: Connect multiple Dynatrace environments with the Backstage Dynatrace plugin to display data from multiple Dynatrace environments. A common use case is the separation in pre-production and production monitoring with different Dynatrace environments.
- Kubernetes Use Case: The Backstage Dynatrace plugins support Kubernetes entities by default with a pre-configured query for Kubernetes deployments and a dedicated component for data representation.
- Custom Queries: Provide any custom DQL query to fetch data from Dynatrace and display it in a tabular format. Single-value results are not supported.
- Backlink to Dynatrace: Enrich your DQL query with smart deep links to guide the Backstage user to Dynatrace for deeper observability and security analysis.

For more information, see [customization features](https://github.com/Dynatrace/backstage-plugin?tab=readme-ov-file#additional-features):
## Conclusion

Congratulations, you have enriched Backstage, as the developer portal of your Internal Development Platform, with real-time monitoring data for the developers. By following this best practice, your developers have observability and security insights at hand allowing them to get immediate feedback from Dynatrace about their services' behavior during the staging process and in production.
## Further reading

How We Made Backstage Improve Developer Efficiency of 1000+ Engineers - Wolfgang Gottesheim & Andi Grabner, Dynatrace; [Recording](https://www.youtube.com/watch?v=0or5K_3HieA); BackstageCon; 2023-11-6, Chicago, US. Related tags Software Delivery ![Site Reliability Guardian](https://dt-cdn.net/images/site-reliability-guardian-ec19b393a6.svg) Site Reliability Guardian
