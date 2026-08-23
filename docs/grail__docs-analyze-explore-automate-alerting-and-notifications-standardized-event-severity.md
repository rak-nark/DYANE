---
formatVersion: "2.0.0"
id: "ff4853d49d161077"
url: "https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/standardized-event-severity"
title: "Standardized event severity — Dynatrace Docs"
domain: "grail"
crawledAt: "2026-08-23T14:58:41.995Z"
contentHash: "8c383f6b1dfd3c71c3beea9fca24a6b9ed75213baaec1da36b999f2715b209a0"
source: "docs.dynatrace.com"
---

# Standardized event severity — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/standardized-event-severity](https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/standardized-event-severity)
- Domain: `grail`
- Document ID: `ff4853d49d161077`
- Format version: `2.0.0`

## Extracted Headings

- Standardized event severity
- Severity levels
- Severity storage in Grail
- Severity for events and problems
- Single events
- Problems
- Set severity for anomaly detectors
- Severity in workflows

## Extracted Code Blocks

- No code blocks extracted

## Content

Standardized event severity — Dynatrace Docs 
# Standardized event severity

 Latest Dynatrace 

 How-to guide 
- Published Jun 19, 2026 

Dynatrace aligns with the ITIL framework standard for IT management systems when classifying event and alert severity.

Severity is expressed as a numeric value from `1` (the most critical state) to `5` (purely informational event).
## Severity levels
 Numeric value Severity level Description 

`1` 

**Critical** 

Complete outage with direct customer impact. The system is down.

For example: SSO is unavailable, users can't log in, or customer data is lost or exposed. 

`2` 

**Major** 

Severe interruption of a service with significant customer impact. The service is operational but significantly degraded.

For example: a large portion of users can't log in. 

`3` 

**Minor** 

Slowdown, service degradation that affects the user experience without causing a full interruption.

For example: login is very slow but functional. 

`4` 

**Warning** 

A noticeable issue with no significant customer impact. 

`5` 

**Informational** 

An event raised for informational purposes only, with no customer impact. 
## Severity storage in Grail

Grail stores severity as a numeric value. You can query severity from individual `davis.events` using DQL: 

 fetch dt.davis.events | fieldsKeep event.name, event.severity 

This returns a table of event names alongside their corresponding severity values. If an event source doesn't set severity, the field is empty.
## Severity for events and problems

### Single events

A single event carries exactly one severity value, or none if the event source doesn't set it.
### Problems

A problem can group multiple events that carry different severities. Dynatrace applies the following aggregation logic: 
- The problem inherits the **highest (most critical) severity** across all grouped events. For example, if a **Minor** (`3`) event and a **Critical** (`1`) event are grouped into one problem, the problem's severity is **Critical** (`1`).
- Severity can only increase, never decrease. Once a problem reaches a severity level, it permanently retains that level—even after the original conditions are resolved. The problem can only be closed. 

The reason severity can increase but never decrease is to preserve historical reporting accuracy. If resolved problems were downgraded, a monthly report of **Critical** incidents would show incorrect data retroactively. 

The severity column shows only **Critical**, **Major**, and **Minor** (levels `1`–`3`).

**Warning** and **Informational** events appear in the event list and can be grouped into a problem by problem correlation, but they don't raise problems on their own. 
## Set severity for anomaly detectors

You can configure severity configuration in two ways: 

When creating a new alert
 Go to **Anomaly Detection** and select 

 **New alert**. 
- In **View alert**, select **Advanced** tab.
- In step 3 **Add details** > step B **Create event template** > **Event properties** section, set this key-value pair: `event.severity - <number from 5 to 1>`.
- Select **Save**.

When editing an existing alert
 
- Go to **Settings** > **Analyze and Alert** > **Alerts**.
- Select an alert, then **Edit**.
- In **Properties**, add `event.severity - <number from 5 to 1>`.

## Severity in workflows

When you configure a workflow with a problem trigger, you can filter by severity level. Selecting a severity level triggers the workflow for that level and all higher (more critical) levels.

Select **Problem trigger** to set **Severity** level for the trigger to alert on: 
- `SEV-1`
- `SEV-2` (`SEV-2` and higher)
- `SEV-3` (`SEV-3` and higher)
- `SEV-4` (`SEV-4` and higher)
- `SEV-5` (`SEV-5` and higher)

Setting the filter to **Minor** (`3`) triggers the workflow for **Minor** (`3`), **Major** (`2`), and **Critical** (`1`) problems, but not for **Warning** (`4`) or **Informational** (`5`) events. Related tags 

 Dynatrace Platform
