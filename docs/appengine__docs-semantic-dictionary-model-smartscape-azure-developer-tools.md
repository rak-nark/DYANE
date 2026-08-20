---
id: "5441005f427ba0f2"
url: "https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/azure/developer-tools"
title: "Developer Tools — Dynatrace Docs"
domain: "appengine"
crawledAt: "2026-08-20T19:47:11.899Z"
contentHash: "5d80c797888e8eec485141d9b18698d1f8f4110ec5665ca605464184fe4243d5"
---

# Developer Tools — Dynatrace Docs

*Fuente oficial:* [https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/azure/developer-tools](https://docs.dynatrace.com/docs/semantic-dictionary/model/smartscape/azure/developer-tools)

Developer Tools — Dynatrace Docs 
# Developer Tools

 Latest Dynatrace 

 Reference 
- Updated on Jul 27, 2026 

Contains entity definitions for Azure Developer Tools stored in Smartscape on Grail. Entities are prefixed with `AZURE_`.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for Azure Developer Tools entity types. 

 smartscapeNodes "AZURE_MICROSOFT_APPCONFIGURATION*" | append [ smartscapeNodes "AZURE_MICROSOFT_AZUREPLAYWRIGHTSERVICE*" ] | append [ smartscapeNodes "AZURE_MICROSOFT_DEVCENTER*" ] | append [ smartscapeNodes "AZURE_MICROSOFT_DEVHUB*" ] | append [ smartscapeNodes "AZURE_MICROSOFT_DEVSPACES*" ] | append [ smartscapeNodes "AZURE_MICROSOFT_DURABLETASK*" ] | append [ smartscapeNodes "AZURE_MICROSOFT_LOADTESTSERVICE*" ] | append [ smartscapeNodes "AZURE_MICROSOFT_TESTBASE*" ] 

### Permission fields
 
- `azure.subscription`
- `azure.resource.group`
- `dt.security_context`
 
## App configuration store

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_APPCONFIGURATION_CONFIGURATIONSTORES`

Centralised key-value store for application configuration and feature flags.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_APPCONFIGURATION_CONFIGURATIONSTORES" 

 smartscapeNodes "AZURE_MICROSOFT_APPCONFIGURATION_CONFIGURATIONSTORES" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Azure playwright service accounts

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_AZUREPLAYWRIGHTSERVICE_ACCOUNTS`

Azure playwright service accounts in Azure Playwright Service.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_AZUREPLAYWRIGHTSERVICE_ACCOUNTS" 

 smartscapeNodes "AZURE_MICROSOFT_AZUREPLAYWRIGHTSERVICE_ACCOUNTS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Controllers

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DEVSPACES_CONTROLLERS`

Controllers in Azure Dev Spaces.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DEVSPACES_CONTROLLERS" 

 smartscapeNodes "AZURE_MICROSOFT_DEVSPACES_CONTROLLERS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Dev centers

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DEVCENTER_DEVCENTERS`

Dev centers in Azure Dev Center.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DEVCENTER_DEVCENTERS" 

 smartscapeNodes "AZURE_MICROSOFT_DEVCENTER_DEVCENTERS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## DevHub workflows

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DEVHUB_WORKFLOWS`

DevHub workflows in Azure DevHub.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DEVHUB_WORKFLOWS" 

 smartscapeNodes "AZURE_MICROSOFT_DEVHUB_WORKFLOWS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## IaC profiles

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DEVHUB_IACPROFILES`

IaC profiles in Azure Dev Hub.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DEVHUB_IACPROFILES" 

 smartscapeNodes "AZURE_MICROSOFT_DEVHUB_IACPROFILES" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Load test mappings

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTMAPPINGS`

Load test mappings in Azure Load Testing.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTMAPPINGS" 

 smartscapeNodes "AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTMAPPINGS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Load test profile mappings

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTPROFILEMAPPINGS`

Load test profile mappings in Azure Load Testing.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTPROFILEMAPPINGS" 

 smartscapeNodes "AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTPROFILEMAPPINGS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Load tests

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTS`

Load tests in Azure Load Testing.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTS" 

 smartscapeNodes "AZURE_MICROSOFT_LOADTESTSERVICE_LOADTESTS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Network connections

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DEVCENTER_NETWORKCONNECTIONS`

Network connections in Azure Dev Center.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DEVCENTER_NETWORKCONNECTIONS" 

 smartscapeNodes "AZURE_MICROSOFT_DEVCENTER_NETWORKCONNECTIONS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Plans

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DEVCENTER_PLANS`

Plans in Azure Dev Center.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DEVCENTER_PLANS" 

 smartscapeNodes "AZURE_MICROSOFT_DEVCENTER_PLANS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Playwright workspaces

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_LOADTESTSERVICE_PLAYWRIGHTWORKSPACES`

Playwright workspaces in Azure Load Testing.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_LOADTESTSERVICE_PLAYWRIGHTWORKSPACES" 

 smartscapeNodes "AZURE_MICROSOFT_LOADTESTSERVICE_PLAYWRIGHTWORKSPACES" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Projects

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DEVCENTER_PROJECTS`

Projects in Azure Dev Center.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DEVCENTER_PROJECTS" 

 smartscapeNodes "AZURE_MICROSOFT_DEVCENTER_PROJECTS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Schedulers

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DURABLETASK_SCHEDULERS`

Schedulers in Azure Durable Task.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DURABLETASK_SCHEDULERS" 

 smartscapeNodes "AZURE_MICROSOFT_DURABLETASK_SCHEDULERS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Templates

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_DEVHUB_TEMPLATES`

Templates in Azure Dev Hub.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_DEVHUB_TEMPLATES" 

 smartscapeNodes "AZURE_MICROSOFT_DEVHUB_TEMPLATES" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE` 
## Test base accounts

Smartscape node name: `azure.resource.name`

Smartscape node type: `AZURE_MICROSOFT_TESTBASE_TESTBASEACCOUNTS`

Test base accounts in Azure Test Base.
### Query

Fetch all Smartscape nodes from the `smartscape.nodes` table and filter for the entity type "AZURE_MICROSOFT_TESTBASE_TESTBASEACCOUNTS" 

 smartscapeNodes "AZURE_MICROSOFT_TESTBASE_TESTBASEACCOUNTS" 

### ID input

The ID is calculated based on the following fields in the defined order: `azure.resource.id`
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
### Azure resource fields

Contains all fields that are provided by all resources running on Azure, including Azure, Core and K8s entities. Attribute Type Description Examples 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.resource.id` 

string 

 resource experimental 
Display name: `Azure resource ID`
A unique, immutable identifier assigned to each Azure cloud resource. 

`/subscriptions/27e9b03f-04d2-2b69-b327-32f433f7ed21/resourceGroups/demo-backend-rg/providers/Microsoft.ContainerService/managedClusters/demo-aks` 

`azure.resource.name` 

string 

 resource experimental 
Display name: `Azure resource name`
User-provided name of the Azure cloud resource. 

`demo-aks` 

`azure.resource.type` 

string 

 resource experimental 
Display name: `Azure resource type`
The name of a resource type in the format: {resource-provider}/{resource-type}. 

`Microsoft.ContainerService/managedClusters` 
### Azure entity fields

Contains all fields that are provided by all Azure entities. Attribute Type Description Examples 

`azure.resource.kind` 

string 

 experimental 
Display name: `Azure resource kind`
A kind of the Azure resource 

`app,linux` 

`azure.resource.sku.name` 

string 

 experimental 
Display name: `Azure resource SKU name`
Name of the Azure resource SKU 

`B_Gen5_1` 

`azure.resource.sku.tier` 

string 

 experimental 
Display name: `Azure resource SKU tier`
Tier of the Azure resource SKU 

`Basic` 

`azure.resource.sku.capacity` 

string 

 experimental 
Display name: `Azure resource SKU capacity`
Capacity of the Azure resource SKU 

`20` 

`azure.status` 

string 

 experimental 
Display name: `Azure status`
The status of the instance 

`Running`; `Stopped (deallocated)` 

`azure.provisioning_state` 

string 

 experimental 
Display name: `Azure provisioning state`
The provisioning status of the resource 

`Succeeded`; `DELETED`; `ERROR`; `INCOMPLETE` 

`azure.object` 

string 

 experimental 
Display name: `Azure object`
The full JSON content of Azure object 

`azure.properties.version` 

string 

 experimental 
Display name: `Azure properties version`
The json content version 

`...` 

`azure.subscription` 

string 

 resource stable 
Display name: `Azure subscription`
An Azure subscription is a logical container used to provision resources in Azure.
Tags: `permission` `primary-field` 

`27e9b03f-04d2-2b69-b327-32f433f7ed21` 

`azure.location` 

string 

 resource stable 
Display name: `Azure location`
A specific geographical location of Azure cloud resource.
Tags: `primary-field` 

`westeurope` 

`azure.availability_zones` 

string[] 

 resource experimental 
Display name: `Azure availability zones`
Availability zones of Azure cloud resource. 

`[&#x27;1&#x27;]` 

`azure.resource.group` 

string 

 resource stable 
Display name: `Azure resource group`
A resource group is a container that holds related resources for an Azure solution.
Tags: `permission` `primary-field` 

`demo-backend-rg` 

`azure.tenant.id` 

string 

 resource experimental 
Display name: `Azure tenant ID`
Unique, immutable identifier assigned to the Azure tenant. 

`37c4add3-612a-483d-8b24-cccbb35d3306` 
### Cloud entity fields

Fields that are provided by all Cloud workloads. Attribute Type Description Examples 

`cloud.acquisition.status` 

string 

 experimental 
Display name: `Cloud acquisition status`
The status of Smartscape nodes data acquisition by Data Acquisition Conroller `OK` - node is consistent `DELETED` - node was deleted in the cloud platform `ERROR` - there was an error acquiring node, but the node was upserted `INCOMPLETE` - there was an error acquiring node child resource (ie. EC2 Instance, with no EBS volumes due to missing permissions) , but the node was upserted. 

`OK`; `DELETED`; `ERROR`; `INCOMPLETE`
