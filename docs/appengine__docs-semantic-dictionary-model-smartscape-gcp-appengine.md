---
id: "d42655691b928976"
url: "https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/gcp/appengine"
title: "App Engine — Dynatrace Docs"
domain: "appengine"
crawledAt: "2026-08-20T19:47:13.215Z"
contentHash: "d1a195436a9c0ab8dd93f422e9ed6489e1c267b74cc5ac5f84afbde3c22d4945"
---

# App Engine — Dynatrace Docs

*Fuente oficial:* [https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/gcp/appengine](https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/gcp/appengine)

App Engine — Dynatrace Docs 
# App Engine

 Latest Dynatrace 

 Reference 
- Updated on Jul 27, 2026 

Contains entity definitions for Google Cloud App Engine resources in Smartscape on Grail. All App Engine entity types use the `GCP_APPENGINE_GOOGLEAPIS_COM_` prefix.
## App Engine admin application

Smartscape node name: `gcp.resource.name`

Smartscape node type: `GCP_APPENGINE_GOOGLEAPIS_COM_APPLICATION`

App Engine application resource.
### Query

Fetch all smartscape nodes from the smartscape.nodes table and filter for the entity type "GCP_APPENGINE_GOOGLEAPIS_COM_APPLICATION". 

 smartscapeNodes "GCP_APPENGINE_GOOGLEAPIS_COM_APPLICATION" 

### Base entity fields

The following base fields are used for all entities. Attribute Type Description Examples 

`id` 

smartscapeId 

 stable 
Display name: `ID`
A Smartscape ID consists of two components: an UPPER_CASE entity type and a random 16-character hexadecimal unique identifier, separated by a dash. Use Smartscape conversion functions when working with strings that represent Smartscape IDs. 

`<type>-017198AD253CBD63` 

`id_classic` 

string 

 deprecated 
Display name: `Classic ID`
The entity ID that was used in the classic entity store. This ID is present in old monitoring data. Not all entities have this ID, and it is not generated for new entities. Use the `id` field instead, which is the Smartscape ID. 

`<type>-017198AD253CBD63` 

`name` 

string 

 stable 
Display name: `Name`
The entity name. 

`localhost`; `easyTravel`; `product-catalog` 

`type` 

string 

 stable 
Display name: `Type`
The entity type. UPPER_SNAKE_CASE string that represents the type of the entity. 

`TYPE_A` 

`tags` 

record 

 stable 
Display name: `Tags`
A consolidated record that aggregates all tag values originating from different contexts. Each nested field within tags represents a specific key (for example, `release` or `name`). The value of each nested field is the tag value from one or multiple contexts. Tags for specific context can be queried via `tags:context` field. Note that rule-based tags do not exist in the new model. 

`tags[tag_key-1] = [context_A_tag_val-1, context_B_tag_val-1]`; `tags[tag_key-2] = context_C_tag_val-1`; `tags:context_A[tag_key-1] = context_A_tag_val-1` 

`lifetime` 

timeframe 

 stable 
Display name: `Lifetime`
The lifetime of the entity. This is a record with two nested fields: `start` and `end`, which represent the time when the entity was first and last observed, respectively. Each time an entity is updated, the end time is updated to the current time. 

`{ start: 2022-07-06T13:36:00.808Z, end: 2024-04-11T06:56:01.204Z }` 

`references` 

record 

 stable 
Display name: `References`
Provides access to static edges pointing to other entities. In this record each nested field represents a relationship type and target type, and the value is an array of target smartscape IDs. This field is hidden by default but can be added using the fieldsAdd command. 

`{ references[runs_on.host] : [HOST-C251A1173C2B4B39,HOST-0E9038C7C4409D69], references[runs_on.container] : [CONTAINER-68A08967EF4F675B] }` 

`dt.security_context` 

string[] 

 resource stable 
Display name: `DT security context`
The security contexts associated with the entity. For Smartscape entities, this field is always an array.
Tags: `permission` 

`[]` 
### GCP resource fields
 Attribute Type Description Examples 

`gcp.asset.type` 

string 

 experimental 
Display name: `GCP asset type`
The asset type available in Google Cloud Asset Inventory. These include resource types, policy types, and runtime information types. 

`sqladmin.googleapis.com/Instance`; `k8s.io/ServiceAccount`; `iam.googleapis.com/Role` 

`gcp.region` 

string 

 resource stable 
Display name: `GCP region`
A region is a specific geographical location where you can host your resources.
Tags: `primary-field` 

`europe-west3` 

`gcp.project.id` 

string 

 resource stable 
Display name: `GCP project ID`
Identifier of the GCP project associated with this resource.
Tags: `permission` `primary-field` 

`dynatrace-gcp-extension` 

`gcp.zone` 

string 

 resource stable 
Display name: `GCP zone`
A zone is a subset of a region. Each region has three or more zones. 

`europe-west3-c` 

`gcp.location` 

string 

 resource stable 
Display name: `GCP location`
Region or zone where GCP resource instance is running. 

`europe-west3-c` 

`gcp.resource.type` 

string 

 resource stable 
Display name: `GCP resource type`
The name of a monitored resource type available in Google Cloud Monitoring and Logging. 

`cloudsql_database` 

`gcp.resource.name` 

string 

 resource stable 
Display name: `GCP resource name`
The globally unique resource name in Google Cloud Platform convention. 

`//cloudfunctions.googleapis.com/projects/gcp-example-project/locations/us-central1/functions/examplefunction` 

`cloud.provider` 

string 

 resource stable 
Display name: `Cloud provider`
Name of the cloud provider. 

`alibaba_cloud` 

`cloud.provider` has the following list of well-known values. If one of them applies, then the respective value MUST be used, otherwise a custom value MAY be used. Value Description Display name 

`alibaba_cloud` 

Alibaba Cloud 

Alibaba Cloud 

`aws` 

Amazon Web Services 

AWS 

`azure` 

Microsoft Azure 

Azure 

`gcp` 

Google Cloud Platform 

GCP 

`heroku` 

Heroku Platform as a Service 

Heroku 

`ibm_cloud` 

IBM Cloud 

IBM Cloud 

`tencent_cloud` 

Tencent Cloud 

Tencent Cloud 
### GCP entity fields

Contains the fields shared by all GCP entities. Attribute Type Description Examples 

`gcp.state` 

string 

 experimental 
Display name: `GCP state`
The provisioning state of the instance 

`PROVISIONING`; `STAGING`; `RUNNING`; `PENDING_STOP`; `STOPPING`; `TERMINATED`; `REPAIRING`; `SUSPENDING`; `SUSPENDED` 

`gcp.object` 

string 

 experimental 
Display name: `GCP object`
The full JSON payload of the resource as returned by the Google Cloud Asset Inventory API (the `resource` portion of the asset, including `data` and any supplementary configuration). 

`gcp.properties.version` 

string 

 experimental 
Display name: `GCP properties version`
The gcp.object json content version 

`v1` 

`gcp.organization.id` 

string 

 resource experimental 
Display name: `GCP organization ID`
Unique, immutable identifier assigned to an organization resource. 

`123456789012` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## App Engine admin service

Smartscape node name: `gcp.resource.name`

Smartscape node type: `GCP_APPENGINE_GOOGLEAPIS_COM_SERVICE`

App Engine service resource.
### Query

Fetch all smartscape nodes from the smartscape.nodes table and filter for the entity type "GCP_APPENGINE_GOOGLEAPIS_COM_SERVICE". 

 smartscapeNodes "GCP_APPENGINE_GOOGLEAPIS_COM_SERVICE" 

### Base entity fields

The following base fields are used for all entities. Attribute Type Description Examples 

`id` 

smartscapeId 

 stable 
Display name: `ID`
A Smartscape ID consists of two components: an UPPER_CASE entity type and a random 16-character hexadecimal unique identifier, separated by a dash. Use Smartscape conversion functions when working with strings that represent Smartscape IDs. 

`<type>-017198AD253CBD63` 

`id_classic` 

string 

 deprecated 
Display name: `Classic ID`
The entity ID that was used in the classic entity store. This ID is present in old monitoring data. Not all entities have this ID, and it is not generated for new entities. Use the `id` field instead, which is the Smartscape ID. 

`<type>-017198AD253CBD63` 

`name` 

string 

 stable 
Display name: `Name`
The entity name. 

`localhost`; `easyTravel`; `product-catalog` 

`type` 

string 

 stable 
Display name: `Type`
The entity type. UPPER_SNAKE_CASE string that represents the type of the entity. 

`TYPE_A` 

`tags` 

record 

 stable 
Display name: `Tags`
A consolidated record that aggregates all tag values originating from different contexts. Each nested field within tags represents a specific key (for example, `release` or `name`). The value of each nested field is the tag value from one or multiple contexts. Tags for specific context can be queried via `tags:context` field. Note that rule-based tags do not exist in the new model. 

`tags[tag_key-1] = [context_A_tag_val-1, context_B_tag_val-1]`; `tags[tag_key-2] = context_C_tag_val-1`; `tags:context_A[tag_key-1] = context_A_tag_val-1` 

`lifetime` 

timeframe 

 stable 
Display name: `Lifetime`
The lifetime of the entity. This is a record with two nested fields: `start` and `end`, which represent the time when the entity was first and last observed, respectively. Each time an entity is updated, the end time is updated to the current time. 

`{ start: 2022-07-06T13:36:00.808Z, end: 2024-04-11T06:56:01.204Z }` 

`references` 

record 

 stable 
Display name: `References`
Provides access to static edges pointing to other entities. In this record each nested field represents a relationship type and target type, and the value is an array of target smartscape IDs. This field is hidden by default but can be added using the fieldsAdd command. 

`{ references[runs_on.host] : [HOST-C251A1173C2B4B39,HOST-0E9038C7C4409D69], references[runs_on.container] : [CONTAINER-68A08967EF4F675B] }` 

`dt.security_context` 

string[] 

 resource stable 
Display name: `DT security context`
The security contexts associated with the entity. For Smartscape entities, this field is always an array.
Tags: `permission` 

`[]` 
### GCP resource fields
 Attribute Type Description Examples 

`gcp.asset.type` 

string 

 experimental 
Display name: `GCP asset type`
The asset type available in Google Cloud Asset Inventory. These include resource types, policy types, and runtime information types. 

`sqladmin.googleapis.com/Instance`; `k8s.io/ServiceAccount`; `iam.googleapis.com/Role` 

`gcp.region` 

string 

 resource stable 
Display name: `GCP region`
A region is a specific geographical location where you can host your resources.
Tags: `primary-field` 

`europe-west3` 

`gcp.project.id` 

string 

 resource stable 
Display name: `GCP project ID`
Identifier of the GCP project associated with this resource.
Tags: `permission` `primary-field` 

`dynatrace-gcp-extension` 

`gcp.zone` 

string 

 resource stable 
Display name: `GCP zone`
A zone is a subset of a region. Each region has three or more zones. 

`europe-west3-c` 

`gcp.location` 

string 

 resource stable 
Display name: `GCP location`
Region or zone where GCP resource instance is running. 

`europe-west3-c` 

`gcp.resource.type` 

string 

 resource stable 
Display name: `GCP resource type`
The name of a monitored resource type available in Google Cloud Monitoring and Logging. 

`cloudsql_database` 

`gcp.resource.name` 

string 

 resource stable 
Display name: `GCP resource name`
The globally unique resource name in Google Cloud Platform convention. 

`//cloudfunctions.googleapis.com/projects/gcp-example-project/locations/us-central1/functions/examplefunction` 

`cloud.provider` 

string 

 resource stable 
Display name: `Cloud provider`
Name of the cloud provider. 

`alibaba_cloud` 

`cloud.provider` has the following list of well-known values. If one of them applies, then the respective value MUST be used, otherwise a custom value MAY be used. Value Description Display name 

`alibaba_cloud` 

Alibaba Cloud 

Alibaba Cloud 

`aws` 

Amazon Web Services 

AWS 

`azure` 

Microsoft Azure 

Azure 

`gcp` 

Google Cloud Platform 

GCP 

`heroku` 

Heroku Platform as a Service 

Heroku 

`ibm_cloud` 

IBM Cloud 

IBM Cloud 

`tencent_cloud` 

Tencent Cloud 

Tencent Cloud 
### GCP entity fields

Contains the fields shared by all GCP entities. Attribute Type Description Examples 

`gcp.state` 

string 

 experimental 
Display name: `GCP state`
The provisioning state of the instance 

`PROVISIONING`; `STAGING`; `RUNNING`; `PENDING_STOP`; `STOPPING`; `TERMINATED`; `REPAIRING`; `SUSPENDING`; `SUSPENDED` 

`gcp.object` 

string 

 experimental 
Display name: `GCP object`
The full JSON payload of the resource as returned by the Google Cloud Asset Inventory API (the `resource` portion of the asset, including `data` and any supplementary configuration). 

`gcp.properties.version` 

string 

 experimental 
Display name: `GCP properties version`
The gcp.object json content version 

`v1` 

`gcp.organization.id` 

string 

 resource experimental 
Display name: `GCP organization ID`
Unique, immutable identifier assigned to an organization resource. 

`123456789012` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## App Engine admin version

Smartscape node name: `gcp.resource.name`

Smartscape node type: `GCP_APPENGINE_GOOGLEAPIS_COM_VERSION`

App Engine version resource.
### Query

Fetch all smartscape nodes from the smartscape.nodes table and filter for the entity type "GCP_APPENGINE_GOOGLEAPIS_COM_VERSION". 

 smartscapeNodes "GCP_APPENGINE_GOOGLEAPIS_COM_VERSION" 

### Base entity fields

The following base fields are used for all entities. Attribute Type Description Examples 

`id` 

smartscapeId 

 stable 
Display name: `ID`
A Smartscape ID consists of two components: an UPPER_CASE entity type and a random 16-character hexadecimal unique identifier, separated by a dash. Use Smartscape conversion functions when working with strings that represent Smartscape IDs. 

`<type>-017198AD253CBD63` 

`id_classic` 

string 

 deprecated 
Display name: `Classic ID`
The entity ID that was used in the classic entity store. This ID is present in old monitoring data. Not all entities have this ID, and it is not generated for new entities. Use the `id` field instead, which is the Smartscape ID. 

`<type>-017198AD253CBD63` 

`name` 

string 

 stable 
Display name: `Name`
The entity name. 

`localhost`; `easyTravel`; `product-catalog` 

`type` 

string 

 stable 
Display name: `Type`
The entity type. UPPER_SNAKE_CASE string that represents the type of the entity. 

`TYPE_A` 

`tags` 

record 

 stable 
Display name: `Tags`
A consolidated record that aggregates all tag values originating from different contexts. Each nested field within tags represents a specific key (for example, `release` or `name`). The value of each nested field is the tag value from one or multiple contexts. Tags for specific context can be queried via `tags:context` field. Note that rule-based tags do not exist in the new model. 

`tags[tag_key-1] = [context_A_tag_val-1, context_B_tag_val-1]`; `tags[tag_key-2] = context_C_tag_val-1`; `tags:context_A[tag_key-1] = context_A_tag_val-1` 

`lifetime` 

timeframe 

 stable 
Display name: `Lifetime`
The lifetime of the entity. This is a record with two nested fields: `start` and `end`, which represent the time when the entity was first and last observed, respectively. Each time an entity is updated, the end time is updated to the current time. 

`{ start: 2022-07-06T13:36:00.808Z, end: 2024-04-11T06:56:01.204Z }` 

`references` 

record 

 stable 
Display name: `References`
Provides access to static edges pointing to other entities. In this record each nested field represents a relationship type and target type, and the value is an array of target smartscape IDs. This field is hidden by default but can be added using the fieldsAdd command. 

`{ references[runs_on.host] : [HOST-C251A1173C2B4B39,HOST-0E9038C7C4409D69], references[runs_on.container] : [CONTAINER-68A08967EF4F675B] }` 

`dt.security_context` 

string[] 

 resource stable 
Display name: `DT security context`
The security contexts associated with the entity. For Smartscape entities, this field is always an array.
Tags: `permission` 

`[]` 
### GCP resource fields
 Attribute Type Description Examples 

`gcp.asset.type` 

string 

 experimental 
Display name: `GCP asset type`
The asset type available in Google Cloud Asset Inventory. These include resource types, policy types, and runtime information types. 

`sqladmin.googleapis.com/Instance`; `k8s.io/ServiceAccount`; `iam.googleapis.com/Role` 

`gcp.region` 

string 

 resource stable 
Display name: `GCP region`
A region is a specific geographical location where you can host your resources.
Tags: `primary-field` 

`europe-west3` 

`gcp.project.id` 

string 

 resource stable 
Display name: `GCP project ID`
Identifier of the GCP project associated with this resource.
Tags: `permission` `primary-field` 

`dynatrace-gcp-extension` 

`gcp.zone` 

string 

 resource stable 
Display name: `GCP zone`
A zone is a subset of a region. Each region has three or more zones. 

`europe-west3-c` 

`gcp.location` 

string 

 resource stable 
Display name: `GCP location`
Region or zone where GCP resource instance is running. 

`europe-west3-c` 

`gcp.resource.type` 

string 

 resource stable 
Display name: `GCP resource type`
The name of a monitored resource type available in Google Cloud Monitoring and Logging. 

`cloudsql_database` 

`gcp.resource.name` 

string 

 resource stable 
Display name: `GCP resource name`
The globally unique resource name in Google Cloud Platform convention. 

`//cloudfunctions.googleapis.com/projects/gcp-example-project/locations/us-central1/functions/examplefunction` 

`cloud.provider` 

string 

 resource stable 
Display name: `Cloud provider`
Name of the cloud provider. 

`alibaba_cloud` 

`cloud.provider` has the following list of well-known values. If one of them applies, then the respective value MUST be used, otherwise a custom value MAY be used. Value Description Display name 

`alibaba_cloud` 

Alibaba Cloud 

Alibaba Cloud 

`aws` 

Amazon Web Services 

AWS 

`azure` 

Microsoft Azure 

Azure 

`gcp` 

Google Cloud Platform 

GCP 

`heroku` 

Heroku Platform as a Service 

Heroku 

`ibm_cloud` 

IBM Cloud 

IBM Cloud 

`tencent_cloud` 

Tencent Cloud 

Tencent Cloud 
### GCP entity fields

Contains the fields shared by all GCP entities. Attribute Type Description Examples 

`gcp.state` 

string 

 experimental 
Display name: `GCP state`
The provisioning state of the instance 

`PROVISIONING`; `STAGING`; `RUNNING`; `PENDING_STOP`; `STOPPING`; `TERMINATED`; `REPAIRING`; `SUSPENDING`; `SUSPENDED` 

`gcp.object` 

string 

 experimental 
Display name: `GCP object`
The full JSON payload of the resource as returned by the Google Cloud Asset Inventory API (the `resource` portion of the asset, including `data` and any supplementary configuration). 

`gcp.properties.version` 

string 

 experimental 
Display name: `GCP properties version`
The gcp.object json content version 

`v1` 

`gcp.organization.id` 

string 

 resource experimental 
Display name: `GCP organization ID`
Unique, immutable identifier assigned to an organization resource. 

`123456789012` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE`
