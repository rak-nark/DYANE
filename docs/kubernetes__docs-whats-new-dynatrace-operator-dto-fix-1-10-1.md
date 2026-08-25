---
formatVersion: "3.0.0"
id: "6f29cb3db35a5504"
url: "https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-1-10-1"
title: "Dynatrace Operator release notes version 1.10.1 — Dynatrace Docs"
domain: "kubernetes"
crawledAt: "2026-08-25T21:48:47.892Z"
contentHash: "2ba602d23864d0a3f38641c63a4590de24ded2a2ca0e3a8af577564883b77788"
source: "docs.dynatrace.com"
---

# Dynatrace Operator release notes version 1.10.1 — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-1-10-1](https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-1-10-1)
- Domain: `kubernetes`
- Document ID: `6f29cb3db35a5504`
- Format version: `3.0.0`

## Extracted Code Blocks

- 1. text (143 chars)

## Content

# Dynatrace Operator release notes version 1.10.1

- Latest Dynatrace
- Release notes
- Updated on Jul 20, 2026

Release date: July 22, 2026

This page provides an overview of the patches included in Dynatrace Operator version 1.10.1. For detailed information on new features and other enhancements, see the release notes for version 1.10.0.
## Resolved issues
 
- Fixed TLS certificate verification errors that prevented applications instrumented via `classicFullstack` from sending data through the in-cluster ActiveGate. TLS certificate verification is enabled by default and can be disabled via the `feature.dynatrace.com/automatic-tls-certificate` feature flag.
  
- Fixed an issue where auto-update for ActiveGate, CodeModule, and OneAgent did not receive automatic image updates.
  
- Fixed an issue where a newly introduced rollout integrity check caused OneAgent deployments to stall indefinitely.
  
- Fixed an issue where OneAgent endpoints were not correctly translated into Istio ServiceEntries and VirtualServices when `spec.enableIstio` was enabled.
 
## Removal and deprecation notices
 
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
 
## Upgrade from Dynatrace Operator version 1.9

Upgrade to version 1.10.1 to receive all fixes listed on this page. No additional migration steps are required beyond those described in the upgrade notes for version 1.10.0.
