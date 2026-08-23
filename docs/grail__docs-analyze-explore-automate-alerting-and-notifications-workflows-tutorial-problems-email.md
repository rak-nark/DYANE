---
formatVersion: "2.0.0"
id: "a9048baa80c28adc"
url: "https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-email"
title: "Send email notifications for problems — Dynatrace Docs"
domain: "grail"
crawledAt: "2026-08-23T14:58:42.672Z"
contentHash: "d107e9bdd5decdd0da07f94018ac996f1c918888e0335861fbd20d9e5d428845"
source: "docs.dynatrace.com"
---

# Send email notifications for problems — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-email](https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-email)
- Domain: `grail`
- Document ID: `a9048baa80c28adc`
- Format version: `2.0.0`

## Extracted Headings

- Send email notifications for problems
- What will you learn
- Prerequisites
- Steps
- Conclusion
- Related topics

## Extracted Code Blocks

- No code blocks extracted

## Content

Send email notifications for problems — Dynatrace Docs 
# Send email notifications for problems

 Latest Dynatrace 

 Tutorial 

 4-min read 
- Updated on Oct 19, 2025 

Problems are automatically opened by Dynatrace when anomalies or alert conditions are detected in your environment.
In **Workflows**, build a 

 simple workflow that listens to problems and automatically sends email alerts.
This guide shows you how. 

 Screenshot of a workflow to learn how to send email notifications for Davis problems using a simple workflow. 

## What will you learn

In this tutorial, you'll learn how to alert your team in real time by emailing the details of a new problem to a specific email recipient.

At a short glance, you will: 
- Create a simple workflow . Add an event trigger for 

 Davis problems . 
- Add an email notification . Save and run the 

 workflow to get email notifications. Verify your 

 workflow is working as expected. 
 
## Prerequisites
 You should have permission to configure and run a 

 simple workflow.
For example, the permission granted with the default policy is for a standard user . You should select the necessary permissions in authorization settings .
 You should allow the required permissions to
 
- Access **Workflows**. Write and execute a workflow.
For more information, see authorization settings . 

## Steps

 Create a simple workflow .
 
- Go to **Workflows**. Select 

 **Workflow** in the upper-right corner of the page. Select the workflow title.
By default, it is `Untitled workflow`, and enter a meaningful name.
The workflow type is set to 

 simple workflow by default. 

Add an event trigger for 

 Davis problems .
 In the **Select trigger** section, select a 

 Problem trigger . Set the **Problem state** to **active or closed**.
This option means that the problem can be both active or closed.
This setting causes the workflow to trigger twice, once when the problem becomes active and again when it is closed. 
- In the **Event category** drop-down list, select **Select all**.
- Optional Select **Query past events** to see the most recent problem events that would have triggered this workflow.
- Optional Enter **Entity tags** or **Additional custom filter query** to only trigger the workflow on the relevant problems.

Add an email notification .

Select 

 **Add task** on the trigger node.

In the **Choose action** section, select **Send email** action type.
Give the action type a meaningful title.

Enter the recipient's email address in the **To** field.

In the **Subject** field, enter the following:

 {{ event()["event.status"] }} Problem {{ event()["display_id"] }}: {{ event()["event.category"] }} {{ event()["event.name"] }} 

In the **Message** field, enter the following:

 {{ event()["event.description"] }} 
 Go to problem: {{ environment().url }}/ui/apps/dynatrace.davis.problems/problem/{{ event()["event.id"] }} 

This configuration uses event context placeholders to dynamically populate the email with relevant problem details .

The Problem trigger returns the problem record.
You can use any field from the problem record, stored in `dt.davis.problems`, in the email notification.

Save and run the 

 workflow to get email notifications.
 Select 

 **Create draft**. 
- Select **Deploy**.
- Select **Run** to see the selected problem event that will be used for the workflow.

Verify that your 

 workflow is working as expected:

Go to your workflow.

Select **Run**.

Select **Run** again to execute the workflow.

After the workflow has executed, you should see a **Success** state at the top of the workflow editor.
Execution logs aren't available for a simple workflow.
If an error occurs, you can find the error details on the right in the task details pane.

 Screenshot of a successfully run email notification workflow. 

## Conclusion

You’ve created a 

 simple workflow that sends email notifications when problems are opened or closed.
This setup helps to ensure that your team is immediately informed about critical issues in your environment.

You can extend this workflow by 
- Adding conditions to handle specific problem categories or severities. 
- Adding auto remediation steps to your workflow. 

This workflow is a great starting point for automating incident response and improving operational awareness. 
## Related topics
 
- Create a simple workflow in Dynatrace Workflows 
- Problems app 
- Email 
 Related tags 

 Dynatrace Platform Workflows Email for Workflows
