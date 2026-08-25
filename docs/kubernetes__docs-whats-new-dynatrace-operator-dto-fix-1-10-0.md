---
formatVersion: "3.0.0"
id: "b90ff047cf4899da"
url: "https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-1-10-0"
title: "Dynatrace Operator release notes version 1.10.0 — Dynatrace Docs"
domain: "kubernetes"
crawledAt: "2026-08-25T21:48:48.160Z"
contentHash: "18bde28cbefbca02281fbc250d45d0b2e8d72889c6f80a6a111ae03feed94416"
source: "docs.dynatrace.com"
---

# Dynatrace Operator release notes version 1.10.0 — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-1-10-0](https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-1-10-0)
- Domain: `kubernetes`
- Document ID: `b90ff047cf4899da`
- Format version: `3.0.0`

## Extracted Code Blocks

- 1. text (143 chars)

## Content

# Dynatrace Operator release notes version 1.10.0

- Latest Dynatrace
- Release notes
- Updated on Jul 29, 2026

Release date: July 15, 2026 

If you're running Dynatrace Operator version 1.10.0, we recommend upgrading to version 1.10.2 to receive the latest important patches. 

On this page, you'll find an overview of what's new and improved in Dynatrace Operator version 1.10.0.
### Enrich Kubernetes telemetry with primary Grail fields and tags

Dynatrace now provides a central place to manage metadata enrichment across all telemetry data and data sources in Kubernetes. Through this central configuration, you can: 
- Define custom key-value pairs as primary tags.
- Derive primary tags from Kubernetes namespace annotations and labels.
- Resolve and attach domain tags.
- Set fields such as security context, cost center, and cost product.
- Use Dynatrace Operator to enrich key-value pairs directly through DynaKube resource attributes.

For more information, see Enrich Kubernetes telemetry with primary Grail fields and tags.
### Auto-update for public registry images

Dynatrace now supports auto-update for Dynatrace images 1 hosted on supported public registries, bringing the same seamless update experience previously available through the Dynatrace built-in registry.

Supported public registries offer multi-arch images compatible with ARM64 (AArch64), x86-64, s390x, and PPC64le architectures on Linux, adhering to best practices for immutability and signing to strengthen supply chain security.

For configuration details and more, see Use a public registry. 1 

Dynatrace Operator automatically resolves and updates container images for ActiveGate, OneAgent, OneAgent Log Module, Code Modules, Extension Execution Controller (EEC), and SQL Extension Executor. 
### Dynatrace Operator now supports Platform Tokens

Dynatrace Operator now supports platform tokens, the successor to access tokens that offer a more secure and unified way to authenticate with the Dynatrace platform. No immediate action is required and existing access tokens continue to be accepted. We will inform you with appropriate lead time when a migration to platform tokens becomes mandatory for Dynatrace Operator installations.

For more details about platform tokens and how to adopt them, see Tokens and permissions.
## New features and enhancements

When a platform token is provided, Dynatrace Operator no longer sends mark-for-termination events. In Kubernetes environments — especially those using cluster auto-scalers — it is difficult to reliably distinguish an intentional node removal from an unexpected node failure. This ambiguity caused false-positive "Host is unavailable" alerts and reduced alerting accuracy. Host availability events on host shutdown and reboot, introduced in OneAgent version 1.301, now provide more reliable termination signals from inside the host, superseding the mark-for-termination event.
 
- Mark-for-termination events are also not available on Latest Dynatrace environments.
  
- Dynatrace Operator now downloads and distributes Declarative Process Grouping configuration to OneAgent processes in `cloudNativeFullstack`, `applicationMonitoring`, and `hostMonitoring` modes. For details, see Declarative process grouping.
  
- Dynatrace Operator introduces a mode to facilitate migration away from the CSI driver to ephemeral volumes for code modules. The `csidriver.migrationMode` Helm value lets you enable this feature. While migration mode is active, the CSI DaemonSet continues running so existing CSI mounts can be cleanly unmounted, and all newly injected pods immediately use ephemeral volumes. For step-by-step instructions, see Migrate from CSI driver to ephemeral volumes.
  
- The `troubleshoot` command now reports recently OOMKilled ActiveGate pods in `troubleshoot.txt`, making it easier to identify out-of-memory issues via the support archive.
  
- Dynatrace Operator now performs webhook certificate generation and CRD storage migration in dedicated init containers (`webhook-cert-generator` and `crd-storage-migrator`), making startup more deterministic and easier to diagnose. `webhook-cert-generator` is skipped on OpenShift and OLM marketplace installations, where the platform manages certificates. The `crd-storage-migrator` init container is controlled by the `operator.crdStorageMigrationInitManager` Helm value (enabled by default for new installations).
  
- Dynatrace Operator version 1.9.0 introduced AppArmor support via the `securityContext` field on deployed components. Dynatrace Operator version 1.10.0 extends this by also translating the deprecated [AppArmor annotation](https://kubernetes.io/docs/reference/labels-annotations-taints/#container-apparmor-security-beta-kubernetes-io) on Pod templates into the corresponding [container security context](https://kubernetes.io/docs/tutorials/security/apparmor/#appArmorProfile) (Kubernetes 1.31+) and stripping the legacy annotation. This applies to all deployed components and is a temporary measure until a dedicated field in the DynaKube and EdgeConnect spec is available. No action is required. For details, see Enable AppArmor for enhanced security.
  
- You can now pin the Dynatrace Operator image by digest using the new `image.digest` Helm value, separately from `image.tag`. When `image.digest` is set, it is used to pull the image, while `image.tag` continues to be used as the version label. This matches the new `imageRef.digest` field on the DynaKube spec and follows the Kubernetes recommendation to deploy workloads by digest.
  
- The `feature.dynatrace.com/node-image-pull` feature flag now only affects the CSI driver. CSI-less `codeModulesImage` injection does not require this flag and is not affected by it.
  
- When `spec.telemetryIngest` is configured and `spec.metaDataEnrichment` is enabled, Dynatrace Operator now automatically enriches all ingested telemetry with the full set of resource attributes.
  
- The default `whenUnsatisfiable` policy for the ActiveGate `TopologySpreadConstraint` has changed from `DoNotSchedule` to `ScheduleAnyway`. This makes ActiveGate updates more reliable on clusters with few nodes, where `DoNotSchedule` could prevent pods from being scheduled during rolling updates. **This change causes an ActiveGate restart on upgrade.**
  
- To deploy Dynatrace Operator with minimal RBAC permissions, sample deployer `ClusterRole` manifests are now available. These manifests grant exactly the permissions needed to install the Operator, with variants for clusters with and without the CSI driver, and for environments that prohibit the `escalate` and `bind` RBAC verbs. For details, see Deployment permissions.
  
- The Dynatrace OpenTelemetry collector now uses liveness and readiness probes, allowing Kubernetes to automatically detect and restart unresponsive collector instances and to route traffic only to pods that are ready to serve.
 
## Known issues
 
- Since Dynatrace Operator 1.9.0, a `RuntimeDefault` seccomp profile is applied to the Dynatrace init container by default. On OpenShift, this can interfere with [SecurityContextConstraints (SCCs)](https://docs.redhat.com/en/documentation/openshift_container_platform/4.22/html/authentication_and_authorization/managing-pod-security-policies) — such as `anyuid`, `restricted`, or `nonroot` — that prevent seccomp profile usage, causing the system to fall back to a different SCC (for example `restricted-v2`). This may render application pods unschedulable or cause workload degradation. Disable seccomp profile for Dynatrace init containers if you are affected.
 
## Resolved issues
 
- Fixed an issue where injection events were incorrectly reported when the mutating webhook processed a large number of pods simultaneously.
  
- Dynatrace Operator-managed component pods no longer mount the Operator pull secret unless the component image is pulled from a private registry, removing unnecessary pull secret warnings on clusters that use public registries.
  
- When `networkZone` is configured on the DynaKube, Dynatrace Operator now waits for the in-cluster routing ActiveGate to register with the Dynatrace environment before deploying OneAgent. This prevents connection failures during initial setup of restricted network-zone deployments.
  
- Fixed a startup deadlock when KSPM was enabled and the in-cluster ActiveGate was configured as the only ActiveGate in the network zone with no fallback configured. The ActiveGate pod and KSPM reconciler each waited for the other to complete initialization, preventing either from starting.
  
- Fixed an issue where the Log Module failed to retrieve metadata enrichment in GKE Autopilot clusters, where the `nodes/proxy` permission is not allowed. The `dynatrace-logmonitoring` ClusterRole now includes the fine-grained `nodes/pods` permission when deploying to Kubernetes 1.36 or later, where [Fine-Grained Kubelet API Authorization is now GA](https://kubernetes.io/blog/2026/04/24/kubernetes-v1-36-fine-grained-kubelet-authorization-ga/). You can also set the Helm value `rbac.kubeletFineGrainedAuthz` to `true` to enable `nodes/pods` on older Kubernetes versions, or to `false` to enforce `nodes/proxy` on newer clusters.
  
- The OAuth endpoint on the EdgeConnect custom resource is now validated to ensure only Dynatrace SSO is used. Non-Dynatrace OAuth endpoints are rejected at admission time.
  
- Fixed an issue where the `dynatrace-operator-crd-storage-migration` job failed with `BackoffLimitExceeded` due to expired webhook certificates. The certificate-generation init container now runs before CRD storage migration, ensuring certificates are renewed first. This applies only when the `crdStorageMigrationJob` Helm value is enabled (disabled by default).
  
- Dynatrace Operator now logs a warning when `otelCollector` is configured but `telemetryIngest` is not enabled.
  
- The Dynatrace OpenTelemetry collector deployed for telemetry ingest is now automatically restarted when the ingest token changes, avoiding interruptions in data ingest.
  
- Fixed a regression introduced in version 1.9.0 where the Dynatrace webhook entered `CrashLoopBackOff` when `webhook.hostNetwork` was enabled — a setting required by some CNI plugins such as Calico on AWS EKS. The startup probe's DNS lookup for `kubernetes.default.svc` failed in host network mode without the correct DNS policy. Dynatrace Operator now automatically sets `dnsPolicy: ClusterFirstWithHostNet` when `webhook.hostNetwork` is enabled.
  
- Fixed an issue where `spec.templates.otelCollector.annotations` were not consistently propagated to the OpenTelemetry collector.
  
- Fixed a security issue where a modified secret in a monitored namespace could redirect the OneAgent binary download during injection. The binary download URL has been removed from the `dtclient.config` field of the `bootstrapper-config` secret and is now passed to the bootstrapper init container as a command-line argument.
  
- Fixed an issue where the CSI driver registrar container did not retry registration after a `RegisterPlugin` failure, leaving the CSI driver unregistered on the node. The registrar container is now restarted to repeat the registration procedure.
  
- Fixed an issue on GKE clusters where webhook conversion failed with a TLS handshake error when accessed via FQDN.
  
- Fixed a delay in rotating the tenant pull secret when the API token changes.
  
- Fixed an issue where not all deployed components were correctly reflected in the DynaKube status.
  
- Fixed an issue where user-provided volumes with conflicting configurations could be mounted during OneAgent pod injection. Dynatrace Operator now skips injection for pods with conflicting volumes and records the reason in pod annotations.
  
- Fixed an issue where certain user-provided configuration values could contain characters that were not properly handled when passed to monitoring components. Dynatrace Operator now validates these values and rejects DynaKube resources that contain forbidden characters.
  
- Fixed an issue where link entries in codemodules image archives were unnecessarily extracted. Dynatrace Operator now only extracts regular files from codemodules archives by default; the previous behavior can be temporarily re-enabled by setting the `extractCodeModulesImageLinks` Helm value to `true`, but this option will be removed in a future release.
  
- Fixed an issue where the process agent could not write debug logs in injected applications because `logDir` and `dataStorageDir` were missing from `ruxitagentproc.conf`.
  
- Fixed an issue where pod creation failed when the DynaKube name was too long, causing StatefulSet label values to exceed Kubernetes limits. Dynatrace Operator now validates the DynaKube name length at admission time.
  
- Fixed an issue where the OneAgent DaemonSet init container `resources` did not match the main container’s and could not be configured via the `oneAgentResources` field.
 
## Removal and deprecation notices
 
- **Deprecated `k8s-app-enabled` feature flag**: The `feature.dynatrace.com/k8s-app-enabled` feature flag is deprecated. The `builtin:app-transition.kubernetes` settings schema it previously created is no longer available on newer Dynatrace environments, where the Kubernetes app experience is enabled automatically. Setting this flag now triggers a validation warning. Remove this annotation from your DynaKube configuration. For details, see DynaKube feature flags.
- The `gke-autopilot.yaml` file has been removed from GitHub release artifacts. Use Helm to deploy Dynatrace Operator on GKE Autopilot clusters instead.
  
- The Helm repository located in `dynatrace/helm-charts` is deprecated and will stop receiving updates in a future release! If you are still using it,
  please update the URL to `dynatrace/dynatrace-operator` or switch to the OCI registry-based approach. Update the Helm repository URL with the following commands:
  
```text
helm repo remove dynatrace
helm repo add dynatrace https://raw.githubusercontent.com/Dynatrace/dynatrace-operator/main/config/helm/repos/stable
```

  
- **Removed DynaKube API version `v1beta3`; `v1beta4` is now deprecated**: The `v1beta3` version has been removed from the DynaKube CRD. The `v1beta4` version is now deprecated. Migrate your DynaKube resources to `v1beta6`. For details, see DynaKube API version migration.
  
 To prevent potential disruptions, we strongly advise keeping your DynaKube API version up to date. Once a version is deprecated and removed, updates may become significantly more complex and time-sensitive.
 
- More information about the deprecation process of the DynaKube API versions can be found in the migration guide.
  
- The `operator.apparmor`, `webhook.apparmor`, and `csidriver.apparmor` Helm values are deprecated. On Kubernetes version 1.31+, set AppArmor using `appArmorProfile` in the `podSecurityContext` instead. These values will continue to work until Kubernetes version 1.30 reaches end of life (August 2026). See Enable AppArmor for enhanced security for details.
  
- The “Mark for Termination” event is deprecated and will be removed in a future Operator version. This functionality is now redundant, as it has been superseded by host availability events on host shutdown and reboot introduced in OneAgent version 1.301.
  
- **Deprecated Kubernetes attributes**: The Kubernetes attributes `dt.kubernetes.cluster.id`, `dt.kubernetes.workload.kind`, and `dt.kubernetes.workload.name` are deprecated. The new `feature.dynatrace.com/enable-attributes-dt.kubernetes` feature flag lets you opt out of injecting these by setting it to `"false"` on the DynaKube. The flag is enabled by default to support a smooth migration to the replacements `k8s.cluster.uid`, `k8s.workload.kind`, and `k8s.workload.name`. In a future release, the flag will default to `false`, and eventually the deprecated attributes will be removed entirely. Migrate your dashboards, alerts, and queries to the new attributes. For details, see DynaKube feature flags.
  
- The `paasToken` field in the `dynakube.spec.tokens` secret is deprecated. Provide the Operator token in the `apiToken` field instead.
 
## Upgrade from Dynatrace Operator version 1.9
 
- If you upgrade from Dynatrace Operator 1.7.x or earlier, first upgrade to 1.8.x or 1.9.x before moving to 1.10.0. The one-time cleanup for the legacy `extensions-controller` resources (renamed to `extension-controller` in 1.8.0) was removed in 1.10.0; skipping the intermediate version leaves stale StatefulSet, Service, and Secret resources in the cluster.
- If you deploy Dynatrace Operator on GKE Autopilot using the `gke-autopilot.yaml` file, switch to Helm deployment before upgrading. This file is no longer published as a release artifact.
- [Kubernetes recommended labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels) are now applied consistently across all operator-managed components and other Kubernetes objects. If you select resources by label, verify that your selectors still match after upgrade.
  
- The default `whenUnsatisfiable` policy for the ActiveGate `TopologySpreadConstraint` has changed to `ScheduleAnyway`. Upgrading to 1.10.0 triggers an ActiveGate restart.
