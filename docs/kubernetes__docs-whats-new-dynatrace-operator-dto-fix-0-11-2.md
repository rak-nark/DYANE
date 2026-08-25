---
formatVersion: "3.0.0"
id: "cdda74c721b10305"
url: "https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-0-11-2"
title: "Dynatrace Operator release notes version 0.11.2 — Dynatrace Docs"
domain: "kubernetes"
crawledAt: "2026-08-25T21:48:48.043Z"
contentHash: "418075ecbc577f072af56cc95c8a37e3d2ec5ccf8008e5719655f0436d5638a0"
source: "docs.dynatrace.com"
---

# Dynatrace Operator release notes version 0.11.2 — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-0-11-2](https://docs.dynatrace.com/docs/whats-new/dynatrace-operator/dto-fix-0-11-2)
- Domain: `kubernetes`
- Document ID: `cdda74c721b10305`
- Format version: `3.0.0`

## Extracted Code Blocks

- No code blocks extracted

## Content

# Dynatrace Operator release notes version 0.11.2

- Latest Dynatrace
- Release notes
- Published May 17, 2023

Release date: May 19, 2023
## New features and enhancements
 
- Added support for Pod Security Standard `restricted` on OpenShift 4.13+ by adding a new label `security.openshift.io/csi-ephemeral-volume-profile: "restricted"` to the CSIDriver resource. For more information, see [CSI Inline Ephemeral Volume Security](https://dt-url.net/6i0345m).
 
### Feature flags
 
- Introduced a feature flag `feature.dynatrace.com/init-container-seccomp-profile`—when set to `true`, it configures the seccomp profile to `Runtime/default` in the `initContainer`. This enhancement allows your workloads to meet the restricted `PodSecurityStandard`, thereby ensuring enhanced security.
 
## Resolved issues
 
- Added an informational log line to the provisioner container of the CSI driver, indicating the specific imageUri that failed to be parsed in case of an error.
  
- Resolved an issue where an error response from the API could trigger an unintended rollout of OneAgents or ActiveGates.
  Related tags Dynatrace Platform
