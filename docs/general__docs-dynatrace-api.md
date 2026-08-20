---
id: "6104f2d1c4d11ded"
url: "https://docs.dynatrace.com/docs/dynatrace-api"
title: "Dynatrace API — Dynatrace Docs"
domain: "general"
crawledAt: "2026-08-20T19:26:26.596Z"
contentHash: "950954226b95c5de5bc0b70d8313e3227b99063afb64261c7c67309a4e3939ef"
---

# Dynatrace API — Dynatrace Docs

*Fuente oficial:* [https://docs.dynatrace.com/docs/dynatrace-api](https://docs.dynatrace.com/docs/dynatrace-api)

Dynatrace API — Dynatrace Docs 
# Dynatrace API

 Reference 
- Updated on Feb 26, 2026 

Use the Dynatrace API to automate your monitoring tasks and export different types of data into your third-party reporting and analysis tools. API communication ensures safety by using secured communication via the HTTPS protocol.
## Basics

 Authentication 

 Response codes 

 Access limit 

 Preview and Early Access releases 

 Migration guides 

 Grail APIs ﻿ 

## Endpoints
 Environment Configuration Account Management 
### ActiveGate

 Information 

 Auto-update configuration 

 Auto-update jobs 
### Anonymization

 Anonymization 
### Application Security

 Vulnerabilities 

 Davis Security Advisor 
 Attacks 
### Audit logs

 Audit logs 

### Business Events

 Business Events 
### Cluster information

 Cluster information 
### Credential vault

 Credential vault 
### Custom tags

 Custom tags of monitored entities 
### Deployment

 OneAgent 

 ActiveGate 

 BOSH tarballs 

 Orchestration tarballs 
### Events

 List events 

 List event types 

 List event properties 

 Ingest events 
### Extensions 2.0

 Extensions 2.0 
### Hub capabilities

 Hub capabilities 
### Log Monitoring

 Log Monitoring 
### Metrics

#### Version 1

 Basics 
#### Version 2

 List metrics 

 Get data points 

 Ingest data points 

 Metric selector 

 Metric expressions 
### Metric units

 List units 

 View a unit 

 Convert units 
### Monitored entities

 Monitored entities 
### Network zones

 Network zones 
### OneAgent on a host

 OneAgent on a host 
### Problems

 Problems v2 
### Releases

 Releases 
### Remote configuration

 OneAgent 

 ActiveGate 
### RUM

 Geographic regions 

 User sessions 

 Real User Monitoring JavaScript 
### Settings

 Settings 
### SLO

 Service-Level Objectives 
### Synthetic

 Monitors 

 Monitor executions v2 

 Locations v1 

 Locations v2 

 Nodes v1 

 Nodes v2 

 Third-party synthetic 
### Tokens

 Tokens v2 
### Anomaly detection

 Applications 

 AWS 

 Database services 

 Disk events 

 Hosts 

 Process groups 

 Services 

 VMware 
### AWS

 AWS credentials 

 AWS PrivateLink 

 AWS supported services 
### Azure

 Azure credentials 

 Azure supported services 
### Calculated metrics

 Mobile app metrics 

 Service metrics 

 Synthetic metrics 

 Web application metrics 
### Conditional naming

 Conditional naming 
### Data privacy

 Data privacy 
### Dashboards

 Dashboards 
### Extensions

 Extensions 

 Plugins 
### Mobile

 Mobile and custom app configuration 

 Mobile symbolication 
### OneAgent

 OneAgent on a host 

 OneAgent in a host group 

 Environment-wide configuration 
### Remote environments

 Remote environments 
### Reports

 Reports 
### RUM

 Allowed beacon origins for CORS 

 Applications detection configuration 

 Calculated web application metrics 

 Content resources 

 Geographic regions - IP address mapping rules 

 Geographic regions - IP mapping headers 

 Mobile and custom app configuration 

 Web application configuration 
### Services

 Calculated service metrics 

 Custom services 

 Failure detection 

 Request attributes 

 Request naming 

 Service detection rules 
### User management

View and manage Dynatrace users in your account. 
### Group management

View and manage user groups in your account. 
### Permission management

Manage user permissions in your account. 
### Policy management

Manage access policies in your account. 

### Account limits

View account limits of your account. 
### Service user management

Manage service users in your account. 
### Platform tokens

Manage platform tokens of your account. 
### Environment management

View monitoring environments of your Dynatrace account. 
### Dynatrace Platform Subscription

View your Dynatrace Platform Subscription and how it is used. 

### Account audit logs

View audit logs related to your Dynatrace account. 

### Notifications

List notifications for your account. 
### Reference data

View the reference info about your account. 
## API Explorer 
 Environment Configuration Account Management 

You can access all Dynatrace API endpoints using the API Explorer. 

 Latest Dynatrace Go to **Access Tokens** and then select the **Dynatrace API Explorer** link. 
- Previous Dynatrace From the user menu , scroll down to **Dynatrace API** and select the API section you&#x27;re interested in.

Alternatively, you can access the API Explorer via the direct link `https://{your-environment-id}.live.dynatrace.com/rest-api-doc/`.
### Authentication in the API Explorer

Select the lock 

 icon next to any end point to display information about the OAuth 2.0 tokens that secure that endpoint. Each endpoint requires a specific token type.

You can also unlock all endpoints by selecting **Authorize**. In the displayed dialog, you can then see which token permissions are necessary for each API endpoint. By entering your OAuth 2.0 token into the global **Available authorizations** dialog, you can unlock all related API endpoints.
### Try out an API call

Once you&#x27;ve entered your OAuth 2.0 token, you can directly execute API calls within the API explorer. Just select **Try it out** to open the parameter section of the selected API endpoint, where you can enter additional parameters and modify the request payload before executing it by selecting **Execute**. 

You can access all Dynatrace API endpoints using the API Explorer. 

 Latest Dynatrace Go to **Access Tokens** and then select the **Dynatrace API Explorer** link. 
- Previous Dynatrace From the user menu , scroll down to **Dynatrace API** and select the API section you&#x27;re interested in.

Alternatively, you can access the API Explorer via the direct link `https://{your-environment-id}.live.dynatrace.com/rest-api-doc/`.
### Authentication in the API Explorer

Select the lock 

 icon next to any end point to display information about the OAuth 2.0 tokens that secure that endpoint. Each endpoint requires a specific token type.

You can also unlock all endpoints by selecting **Authorize**. In the displayed dialog, you can then see which token permissions are necessary for each API endpoint. By entering your OAuth 2.0 token into the global **Available authorizations** dialog, you can unlock all related API endpoints.
### Try out an API call

Once you&#x27;ve entered your OAuth 2.0 token, you can directly execute API calls within the API explorer. Just select **Try it out** to open the parameter section of the selected API endpoint, where you can enter additional parameters and modify the request payload before executing it by selecting **Execute**. 

You can access all Dynatrace API endpoints using the API Explorer. Go to **Account Management** ﻿ 

 . If you have more than one account, select the account you want to manage. 
- On the top navigation bar, go to **Identity & access management** > **OAuth clients**.
- In the upper-right corner of the page, select **Account Management API**.
 
### Authentication in the API Explorer

Select the lock 

 icon next to any end point to display information about the OAuth 2.0 tokens that secure that endpoint. Each endpoint requires a specific token type.

You can also unlock all endpoints by selecting **Authorize**. In the displayed dialog, you can then see which token permissions are necessary for each API endpoint. By entering your OAuth 2.0 token into the global **Available authorizations** dialog, you can unlock all related API endpoints.
### Try out an API call

Once you&#x27;ve entered your OAuth 2.0 token, you can directly execute API calls within the API explorer. Just select **Try it out** to open the parameter section of the selected API endpoint, where you can enter additional parameters and modify the request payload before executing it by selecting **Execute**.
