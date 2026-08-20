---
id: "11cc58a5b5ae4bb8"
url: "https://docs.dynatrace.com/docs/platform/appengine"
title: "AppEngine — Dynatrace Docs"
domain: "appengine"
crawledAt: "2026-08-20T19:47:05.527Z"
contentHash: "a3e21e2b6c72444aec4aac5461e3b34ca4f9890f88bd1fa5f041566d418b7c1e"
---

# AppEngine — Dynatrace Docs

*Fuente oficial:* [https://docs.dynatrace.com/docs/platform/appengine](https://docs.dynatrace.com/docs/platform/appengine)

AppEngine — Dynatrace Docs 
# AppEngine

 Latest Dynatrace 

 2-min read 
- Updated on Apr 10, 2026 

With the introduction of the Dynatrace AppEngine, you can now build custom apps on top of all the observability data collected by Dynatrace.

Compared to other Dynatrace platform functionality, Dynatrace apps are smaller, self-contained, and focused on specific use cases. But a Dynatrace app is not an isolated application: the Dynatrace platform implements an intent concept ﻿ 

 that allows interoperability between Dynatrace apps.
## Why AppEngine?

The following areas make AppEngine unique: 
- **Logic to data:** With AppEngine, you bring logic to data. Writing apps on the Dynatrace platform allows you to utilize the capabilities like Smartscape on Grail and Dynatrace Intelligence to solve your custom use cases close to where the data is stored.
- **Secure and scalable app runtime:** AppEngine adds security to your data by ensuring logic and data stay within the security boundaries and everything runs within a defined scope. Furthermore, AppEngine makes sure your app scales up to your needs.
- **Integrates your environment:** AppEngine enables you to create any integration to third-party systems to solve all your custom use cases.

Dynatrace apps are self-contained and focus on specific use cases. However, a Dynatrace app isn&#x27;t an isolated application. It interacts with the capabilities of the Dynatrace platform via APIs, with other apps via intents ﻿ 

 , or with publicly available third-party systems. Dynatrace apps can also interact with your on-premises systems via EdgeConnect, which you can run in your corporate network. 

 AppEngine architecture 

## Building blocks

The user interface of a Dynatrace app is written as a React single-page application and uses TypeScript to enhance the developer experience. The Dynatrace platform provides an extensive toolchain to make the life of an app developer as easy as possible: The **Strato design system** ﻿ 

 and design tokens provide fundamental and customizable UI components. **TypeScript SDKs** ﻿ 

 allow apps to interact with the Dynatrace platform services ﻿ 

 (querying data, document service, state service, etc.). **app functions** ﻿ 

 as the backend for your app, written in TypeScript and run within the Dynatrace JavaScript runtime ﻿ 

 . The **Dynatrace app Toolkit** ﻿ 

 allows you to easily create, build, and deploy apps and their functions. 
 
## Learn more

For tutorials, how-to guides, and technical references for Dynatrace app developers, head over to Dynatrace Developer ﻿ 

 . There&#x27;s something for every skill level. 
## Related topics
 AppEngine empowers organizations to create custom apps for better data insights ﻿ 

 Related tags 

 Dynatrace Platform
