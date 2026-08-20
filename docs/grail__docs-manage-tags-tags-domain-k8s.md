---
id: "517bc494e08257a3"
url: "https://docs.dynatrace.com/docs/manage/tags/tags-domain-k8s"
title: "Enrich Kubernetes telemetry with primary Grail fields and tags — Dynatrace Docs"
domain: "grail"
crawledAt: "2026-08-20T19:28:59.624Z"
contentHash: "f9ad97d52697c0d61947a1c3940a844122606b938dac17bb2990f63bd8afcf40"
---

# Enrich Kubernetes telemetry with primary Grail fields and tags — Dynatrace Docs

*Fuente oficial:* [https://docs.dynatrace.com/docs/manage/tags/tags-domain-k8s](https://docs.dynatrace.com/docs/manage/tags/tags-domain-k8s)

Enrich Kubernetes telemetry with primary Grail fields and tags — Dynatrace Docs 
# Enrich Kubernetes telemetry with primary Grail fields and tags

 Latest Dynatrace 

 How-to guide 

 8-min read 
- Updated on Jul 07, 2026 

 Dynatrace Operator version 1.10+ OneAgent version 1.333+ ActiveGate version 1.343+ 

This page describes the new tagging model for Latest Dynatrace with some capabilities still rolling out. 
- **Coming from classic auto-tagging?** See Classic vs. latest to understand how your existing setup maps to the new model.
- **Already using Kubernetes telemetry enrichment?** Follow the migration steps to adopt the new tagging and enrichment capabilities.

Dynatrace enriches telemetry from Kubernetes workloads with primary Grail fields and tags. You can use the same metadata for segments , pipeline routing , bucket assignment , Grail permissions , and cost allocation , consistently across logs, metrics, spans, events, and Smartscape entities.

If you operate Kubernetes workloads as an SRE or application owner, this page shows you how to make the labels and annotations you already maintain work for filtering, routing, and access control in Dynatrace. Data arrives in Dynatrace already tagged, with no post-processing rules required. The same metadata appears on every signal the workload emits.

For general guidance on primary Grail fields and tags, see Primary tags . Platform capability How primary fields and tags help 

Data routing 

Route data to specific pipelines based on `primary_tags.*` or primary fields like `k8s.namespace.name`. 

Bucket assignment 

Assign a target retention bucket based on `k8s.cluster.name`, `k8s.namespace.name`, or `primary_tags.*`. 

Grail permissions 

Derive security context from namespace boundaries or your own labels and annotations. 

Cost allocation 

Track costs per team or product with `dt.cost.costcenter` and `dt.cost.product` . 

Segments 

Define segments based on primary fields and tags to filter data across Dynatrace apps. 

Alerting 

Create targeted alerts and notifications based on primary fields and tags. 
## Enrichment guidance 

Choose one of the options below. Try each in order and stop at the first one that covers your use case. Prerequisites 

All enrichment options require `metadataEnrichment` to be enabled in your DynaKube: 

 spec : metadataEnrichment : enabled : true 

By default, enrichment applies to all namespaces. 1 If you configure a `namespaceSelector`, only matching namespaces receive enrichment. Excluded namespaces won&#x27;t have complete primary Grail fields or tags populated on their telemetry. For complete coverage, prefer omitting the selector or configuring it to match all monitored namespaces. 1 

Except `kube-*`, `openshift-*`, and the Dynatrace Operator namespace. See Configure monitoring for namespaces and pods for details. 
### 1 . Out-of-the-box primary Grail fields 

Dynatrace automatically populates `k8s.cluster.name` and `k8s.namespace.name` on all telemetry from Kubernetes workloads, with no configuration required. If filtering, routing, and access control at the cluster or namespace level cover your use case, no additional setup is needed. 
### 2 . Promote existing namespace labels or annotations 

Central configuration is the recommended approach and will be made available mid-summer. Until it&#x27;s shipped, use Kubernetes telemetry enrichment to enrich your workloads. If you&#x27;re already using that setup, see the migration steps . 

If your namespaces already carry labels or annotations that represent the context you want, such as team ownership, environment, cost center, security boundary, use central configuration to promote them to primary Grail tags or fields.
No changes to workload manifests are required.

Each central configuration rule selects a source, for example, a namespace label, a namespace annotation, or a static literal value, and a target, such as a primary field or a primary tag.

How the source value reaches telemetry depends on the rule type: 
- Static literal: The configured value is written directly to the target primary field or primary tag. Namespace label or annotation: The source value is first written to telemetry as a Kubernetes tag, such as `k8s.namespace.label.<key>` or `k8s.namespace.annotation.<key>`.
A follow-up OpenPipeline processing step then copies the Kubernetes tag into the desired `primary_tags.<key>` or primary field.
This two-step flow keeps the original Kubernetes tag available for filtering and inspection while also lifting it into a primary tag.
Configuration changes to central rules can take up to 15 minutes to take effect. You might need to restart affected pods. Rules created before you deploy your DynaKube are picked up immediately. 

- Central configuration currently supports namespace-level labels and annotations only. Promoting workload-level and pod-level labels and annotations is on the roadmap. 
- Central configuration is also useful as a migration path when transitioning from classic auto-tagging to primary tags on the latest platform. 
 
### 3 . Enrich with dedicated `metadata.dynatrace.com` annotations 

If your namespaces don&#x27;t carry suitable existing labels or annotations, or if you need pod-level granularity that central configuration can&#x27;t provide, add dedicated `metadata.dynatrace.com/primary_tags.<key>:<value>` annotations directly to your Kubernetes manifests to set primary Grail tags . The same convention also accepts the supported primary fields `dt.security_context`, `dt.cost.costcenter`, and `dt.cost.product`. Any other `metadata.dynatrace.com/<key>` annotation is ignored for enrichment on signals. Pod or namespace annotation example 

 metadata : annotations : # Primary tags: metadata.dynatrace.com/primary_tags.team : payments metadata.dynatrace.com/primary_tags.environment : production 
 # Supported primary fields: metadata.dynatrace.com/dt.security_context : confidential metadata.dynatrace.com/dt.cost.costcenter : it_services metadata.dynatrace.com/dt.cost.product : fin_app 

You can place these annotations at two scopes: Namespace-level: Annotations on a `Namespace` apply to every workload and pod inside that namespace.
Use this when the team, environment, or security context is defined at the namespace boundary and is shared by everything that runs there. Pod-level: Annotations on a `Pod` (typically through the pod template of a `Deployment`, `StatefulSet`, or `DaemonSet`) apply only to that pod.
Use this when you need to override the namespace defaults for a specific workload, or when different workloads in the same namespace need different metadata. 

When the same key is set at both scopes, the pod-level value wins for that pod. 
### 4 . Configure attributes in the DynaKube 

You can define additional resource attributes directly in your DynaKube. Dynatrace Operator propagates these attributes to all telemetry signals without requiring you to modify namespaces, workloads, or pods. This is useful when you want to attach a fixed tag to all signals from a cluster, such as a team identifier, at the DynaKube level.

Three DynaKube sections control which signals receive which attributes: Field Scope 

`.spec.resourceAttributes` 

Applied to all signals: OneAgent injection, OTLP exporter injection, standalone log monitoring, and ActiveGate. 

`.spec.oneAgent.<mode>.additionalResourceAttributes` 

Applied to OneAgent signals only. Takes precedence over duplicate keys in `.spec.resourceAttributes`. 

`.spec.otlpExporterConfiguration.additionalResourceAttributes` 

Applied to OTLP telemetry of configured exporters only. Takes precedence over duplicate keys in `.spec.resourceAttributes`. DynaKube snippet showcasing attribute configuration 

Attribute keys prefixed with `primary_tags.*` become primary Grail tags . The primary fields `dt.security_context`, `dt.cost.costcenter`, and `dt.cost.product` are also supported. 

 apiVersion : dynatrace.com/v1beta6 kind : DynaKube metadata : name : dynakube namespace : dynatrace spec : apiUrl : https : //<environment - id > .live.dynatrace.com/api resourceAttributes : primary_tags.team : "alpha" oneAgent : cloudNativeFullStack : additionalResourceAttributes : aws.account.id : "000000000000" primary_tags.team : "charly" namespaceSelector : matchLabels : my.app.com/oneagent : "true" 
 otlpExporterConfiguration : additionalResourceAttributes : aws.account.id : "000000000000" primary_tags.team : "charly" namespaceSelector : matchLabels : my.app.com/otel : "true" signals : metrics : { } traces : { } logs : { } 

Dynatrace Operator propagates the merged attributes as follows: 
- **OneAgent injection**: Dynatrace Operator writes attributes to `dt_node_metadata.properties` for OneAgents, and to `dt_metadata.properties`, `dt_metadata.json`, and the `metadata.dynatrace.com` pod annotation for OneAgent injected pods.
- **OTLP exporter injection**: Dynatrace Operator appends attributes to `OTEL_RESOURCE_ATTRIBUTES` and the `metadata.dynatrace.com` pod annotation for injected pods.
- **Standalone log monitoring and ActiveGate**: Dynatrace Operator applies `.spec.resourceAttributes` directly. Mode-specific `additionalResourceAttributes` does not affect these components.

 Conflicting keys with concurrent OneAgent and OTLP injection 

When both OneAgent injection and OTLP exporter injection are active on the same pod, both write to the shared `metadata.dynatrace.com` JSON annotation. Having the same key defined in both sections will result in undefined behavior. You must use distinct keys across OneAgent and OTLP `additionalResourceAttributes` when both are active on the same pod to avoid unpredictable behavior. Attribute key sanitization 

For pod injection use cases (OneAgent injection and OTLP exporter injection), Dynatrace Operator propagates attributes as Kubernetes pod annotations in the form `metadata.dynatrace.com/<key>`. Kubernetes annotation key suffixes must consist of valid DNS label characters, so Dynatrace Operator sanitizes attribute keys by replacing any invalid characters before writing them to annotations.

Dynatrace Operator validates attribute keys and reports the following: 
- **Warning**: The key contains characters Dynatrace Operator replaces during sanitization - Dynatrace Operator renames the key but still writes the annotation.
- **Error**: The sanitized key is an empty string - Dynatrace Operator drops the key.
- **Error**: Two keys produce the same sanitized value - the result is a collision.
- **Error**: The sanitized key exceeds 63 characters - this violates the Kubernetes annotation name-segment limit for `metadata.dynatrace.com/<key>`.

For the full parameter reference, see the DynaKube API reference . 
### 5 . OpenPipeline (last resort) 

If none of these options apply, derive or assign primary tags at ingest with OpenPipeline and the processing stage. Use this as a fallback for environments where source-side or central enrichment isn&#x27;t possible. 
### Precedence

When the same key is set at multiple levels, the most specific definition wins: 
- Pod-level annotation (most specific) 
- Namespace-level annotation 
- DynaKube resource attributes 
- Central configuration rule (least specific) 
 
## Coverage by signal type

The following table shows where primary tags and the special fields (`dt.security_context`, `dt.cost.*`) land, by enrichment option. Signal Central configuration Dedicated annotations (pod or namespace) 

 Distributed traces powered by Grail 1 

OneAgent metrics 1 

JMX/PMI metrics collected via OneAgent 1 

Service metrics 1 

Kubernetes platform metrics 

Kubernetes events 

Smartscape Kubernetes entities 

 Prometheus metrics scraping 

Logs collected by OneAgent log module 1 

Logs collected by FluentBit 

Spans, metrics, and logs collected by the OpenTelemetry Collector 

OneAgent events 1 

 1 

OneAgent-based enrichment requires the Cloud Native Full Stack or Application Monitoring deployment mode. Classic Full Stack is not supported. 
## Query enriched data in Grail

Primary Grail fields and tags appear as top-level fields and can be queried with DQL. Filter logs by namespace and team 

 fetch logs | filter k8s.namespace.name == "checkout" AND primary_tags.team == "payments" 

 Cost allocation aggregation 

 fetch bizevents | filter dt.cost.costcenter == "it_services" | summarize sum(value), by: {dt.cost.product} 

 Security context filtering 

 fetch logs | filter dt.security_context == "confidential" | filter k8s.cluster.name == "prod-eu-1" 

## Central configuration setup checks

The following checks apply to the central configuration setup described in Promote existing namespace labels or annotations . Verify the rule definition.
Confirm that each rule points to the correct metadata type `Label`, `Annotation`, or `Literal`, and that the source key exactly matches the key on the namespace. Check that the source metadata exists.
Open the namespace in the **Kubernetes app** and look for the expected labels and annotations, or run `kubectl get namespace <name> -o yaml` and inspect the `metadata.labels` and `metadata.annotations` sections. Validate that metadata enrichment is turned on.
The feature works only if `metadataEnrichment` is allowed in your DynaKube.
If you specify a `namespaceSelector`, make sure it matches the namespace you&#x27;re testing. Confirm that enrichment reached the pods.
Run `kubectl get pod <pod-name> -o yaml` on a pod in the namespace and look for annotations starting with `metadata.dynatrace.com/`.
Their presence means the metadata reached the pod. 
 
## Limitations
 
- Dynatrace Classic platform is not supported. 
 
## Related topics
 
- Primary Grail fields and tags 
- Organize your data with primary Grail fields and tags 
- Enrich OneAgent telemetry with primary Grail fields and tags 
- Set up Grail permissions for telemetry from Kubernetes and Kubernetes workloads 
- Set up Cost Allocation for Kubernetes deployments 
- Global field reference 
- Primary Grail fields 
- Plan your tagging strategy 
- Best practices for enriching primary Grail fields and tags 
 Related tags 

 Dynatrace Platform
