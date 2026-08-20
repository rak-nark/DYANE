---
id: "f957afd5d1b38d5d"
url: "https://docs.dynatrace.com/docs/license/capabilities/appengine-functions/consumption-details"
title: "Calculate your consumption of AppEngine Functions (DPS) — Dynatrace Docs"
domain: "appengine"
crawledAt: "2026-08-20T19:47:08.015Z"
contentHash: "fa42de19d19547ed5405fac73dabeb3b8bcc689241d34548d84ff0928585a3b2"
---

# Calculate your consumption of AppEngine Functions (DPS) — Dynatrace Docs

*Fuente oficial:* [https://docs.dynatrace.com/docs/license/capabilities/appengine-functions/consumption-details](https://docs.dynatrace.com/docs/license/capabilities/appengine-functions/consumption-details)

Calculate your consumption of AppEngine Functions (DPS) — Dynatrace Docs 
# Calculate your consumption of AppEngine Functions (DPS)

 Latest Dynatrace 

 Explanation 

 12-min read 
- Published Aug 12, 2025 

 AppEngine Functions feature overview 

This page describes how the AppEngine Functions DPS capability is consumed and billed.
For an overview of the capability, including its main features, see AppEngine Functions (Serverless Functions) overview (DPS) . 

Billable consumption of AppEngine functions occurs when: 
- App functions are invoked in a custom app. 
- Ad-hoc functions are invoked in **Notebooks**, **Dashboards**, **Workflows**, or directly via API.
- Custom actions are invoked in workflows. 

Please note that invocation of AppEngine Functions can trigger the ingest (and therefore implicitly the retention) of additional data or the execution of a DQL query. 
## How consumption is calculated: invocations

The unit of measure for consumption of AppEngine Functions is an invocation.
In this context, Dynatrace defines one invocation as each minute (or part thereof) of execution time for a single function call.
One function call will consume either one or two invocations: 
- 0–60 seconds: one invocation. 
- 61–120 seconds: two invocations. 
- After 120 seconds, the function call will time out. 

The total consumption is calculated by multiplying the number of invocations by your rate card price per invocation.
## Track your consumption and costs

### Track your consumption with DQL queries

You can use DQL to filter for events, for example with `event.type == "AppEngine Functions - Small"`, to find Appengine invocations, as shown in the examples below. 

 Example query: See daily AppEngine Function invocations by function type. 

The following DQL query provides an overview of daily AppEngine Function invocations by function type: 

 fetch dt.system.events, scanLimitGBytes: - 1 | filter event.type == "AppEngine Functions - Small" AND event.kind == "BILLING_USAGE_EVENT" AND (billing_type == "BILLABLE" OR isNull(billing_type)) | fieldsAdd data = if(matchesPhrase(function.type, "AD_HOC" ), "Ad-hoc" , else: if(matchesPhrase(function.type, "ACTION" ), "Actions" , else: if(matchesPhrase(function.type, "STANDARD" ), "App functions" ))) | summarize billed_invocations = takeAny(billed_invocations), by: {timestamp=bin(timestamp, 1d), event.id,data} | summarize invocations = sum(if(billed_invocations,billed_invocations, else: 1 )), by: {data, timestamp} | sort timestamp desc, invocations desc 

 Example query: See which users and apps use AppEngine Functions. 

The following DQL query provides details on users and apps using AppEngine Functions: 

 fetch dt.system.events, scanLimitGBytes: - 1 | filter event.type == "AppEngine Functions - Small" AND event.kind == "BILLING_USAGE_EVENT" AND (billing_type == "BILLABLE" OR isNull(billing_type)) | summarize billed_invocations = takeAny(billed_invocations), by: {startHour = bin(timestamp, 1h), event.id, user.email, caller.app.id} | summarize Invocations = sum(if(billed_invocations,billed_invocations, else: 1 )), by: {User = user.email, Calling_App = caller.app.id} | sort Invocations desc 

### Track your consumption and costs in Account Management

You can also track your usage in Account Management.
Go to **Account Management** ﻿ 

 > **Subscription** > **Overview** > **Cost and usage details** > **Usage summary** and select the **AppEngine Functions - Small** capability.
### Track your consumption and costs via API

You can query metrics via the Environment API - Metrics API v2 . 
## Related topics
 
- AppEngine Functions (Serverless Functions) overview (DPS) 
- AppEngine App functions ﻿ 

 Dynatrace pricing ﻿ 

 Related tags 

 Dynatrace Platform 

 Software Delivery
