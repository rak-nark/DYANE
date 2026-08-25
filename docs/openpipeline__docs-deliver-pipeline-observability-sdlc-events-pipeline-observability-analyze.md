---
formatVersion: "3.0.0"
id: "4f2e0f6cb01fbaa6"
url: "https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/pipeline-observability-analyze"
title: "Analyze SDLC events from your pipeline — Dynatrace Docs"
domain: "openpipeline"
crawledAt: "2026-08-25T21:20:16.650Z"
contentHash: "28a20201023159bb6594817c7d63bbfc4a60a31f7e342608f0821394a2359c5b"
source: "docs.dynatrace.com"
---

# Analyze SDLC events from your pipeline — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/pipeline-observability-analyze](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/pipeline-observability-analyze)
- Domain: `openpipeline`
- Document ID: `4f2e0f6cb01fbaa6`
- Format version: `3.0.0`

## Extracted Code Blocks

- 1. dql (375 chars)
- 2. dql (391 chars)
- 3. dql (311 chars)
- 4. dql (378 chars)

## Content

# Analyze SDLC events from your pipeline

- Latest Dynatrace
- Tutorial
- 4-min read
- Published Aug 25, 2024

Once stored in Grail, you can interactively query your software development lifecycle event data and analyze it using Dynatrace Query Language. Dynatrace Query Language (DQL) is the starting point for analysis, whether you use Configure a simple custom alert, Dashboards, or the Grail - DQL Query execution via API. You can use query results interactively or pin them to a dashboard as charts, tiles, or tables.

This guide shows you how to analyze the SDLC events you generated from your pipeline.
### Query SDLC events using Dynatrace API

You can look up the Swagger documentation to learn how to query SDLC events. The Swagger documentation is Dynatrace tenant-based.
#### Find Grail - DQL Query definition in Swagger documentation

You need to find the **Grail - DQL Query** definition and the **Query Execution** method in your tenant-based Swagger documentation.

To find a definition and method in your tenant-based Swagger documentation 
1. Go to Dynatrace.
2. In the platform search, type `API`. In the search results, see **Support resources** section and **Dynatrace API** below it.
3. Select **Dynatrace API** to access the Dynatrace API documentation. A new page opens with the Dynatrace API definitions.
4. In the upper right corner, go to **Select a definition**.
5. From the drop-down list, choose the endpoint.
 
#### Query SDLC events

To run a query for Grail and to retrieve its result, you need to make two different requests 
1. To query Grail, execute the POST `/query:execute` request.
2. To retrieve the result, execute the GET `/query:poll` request.
 
### Analyze with our examples

With DQL you can 
- Create metrics continuously from any numeric data collected as lifecycle events.
- Join data points to derive, for example, the duration of a task.
- Aggregate data to KPIs.
 
#### Average duration of test executions

This example calculates the average duration of test executions in the last week. 
- A JMeter test sends an event once it is started and is finished.
- A test has a unique test ID.

The metric below yields a single numerical value displayed as a **Single value** or a **Record list**. 

```dql
fetch events, from:now()-7d, to:now()
| filter event.kind == "SDLC_EVENT"
| filter event.type == "test"
| summarize {
  started = takeMin(if(event.status == "started", toTimestamp(start_time))),
  finished = takeMax(if(event.status == "finished", toTimestamp(end_time)))
}, by: {test.id}
| fieldsAdd duration = finished - started
| summarize avg_test_duration = avg(duration)
```

  Run in Playground 
#### Average duration of open change requests

This example calculates the average duration of an open request to merge a code change. 
- For GitHub, this is the period from when someone opened a pull request until they merged this pull request.
- For GitLab, this is the period from when someone requested a merge until the change is merged.

The metric below yields a single numerical value displayed as a **Single value** or a **Record list**. 

```dql
fetch events, from:now()-7d, to:now()
| filter event.kind == "SDLC_EVENT"
| filter event.type == "change"
| summarize {
  started = takeMax(if(event.status == "opened", toTimestamp(start_time))),
  finished = takeMax(if(event.status == "merged", toTimestamp(end_time)))
}, by: {vcs.repository.change.id}
| fieldsAdd duration = finished - started
| summarize avg_time_to_merge = avg(duration)
```

  Run in Playground 
#### Percentage of failed validations

This example derives the percentage of failed release validations in the last month. 
- A release validation is classified as `pass`, `warning`, `fail`, or `error`.
- Errored validations are excluded since they represent non-valid executions.

The metric below yields a single numerical value displayed as a **Single value** or a **Record list**. 

```dql
fetch events, from:now()-7d, to:now()
| filter event.kind == "SDLC_EVENT"
| filter event.type == "validation"
| filter event.status == "finished"
| summarize {
  failed = countIf(validation.status == "fail"),
  all = countIf(validation.status != "error")
}
| fields failed_validation_rate = (failed * 100 / all)
```

  Run in Playground 
#### Distribution of pipeline executions by 2-minute buckets

This query shows the distribution of pipeline executions by 2-minute buckets of the last week. To see how many pipelines took 0-2, 2-4, 4-6 minutes, and so on. 
- The pipeline duration is reported in seconds. (2 minutes = 120 seconds)

The **Categorical chart** is the best choice for displaying this data in columns showing the number of pipelines for each bucket. 

```dql
fetch events, from:now()-7d, to:now()
| filter event.kind == "SDLC_EVENT"
| filter event.category == "pipeline"
| filter event.status == "finished"
| summarize numberOfPipelines = count(), by:{pipelineDuration = bin(toLong(duration), 120)}
| fields pipelineDuration = concat(toString(toLong(pipelineDuration)), " - ", toString(toLong(pipelineDuration + 120))), numberOfPipelines
```

  Run in Playground Related tags Software Delivery Dashboards ![OpenPipeline](https://cdn.bfldr.com/B686QPH3/at/rp4vgwhpjx5rv6rm53mk88cc/OpenPipeline.svg?auto=webp&width=72&height=72) OpenPipeline
