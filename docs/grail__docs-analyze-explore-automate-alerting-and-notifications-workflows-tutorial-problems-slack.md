---
id: "7ba9622b36fc53c0"
url: "https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-slack"
title: "Send Slack notifications for problems — Dynatrace Docs"
domain: "grail"
crawledAt: "2026-08-20T19:28:50.525Z"
contentHash: "2ed0507f0a184098a070ce96fc09a01175ce3dde255c895bb7ebc1959406a683"
---

# Send Slack notifications for problems — Dynatrace Docs

*Fuente oficial:* [https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-slack](https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-slack)

Send Slack notifications for problems — Dynatrace Docs 
# Send Slack notifications for problems

 Latest Dynatrace 

 Tutorial 

 4-min read 
- Updated on Oct 19, 2025 

Problems are automatically opened by Dynatrace when anomalies or alert conditions are detected in your environment.
In **Workflows**, build a 

 simple workflow that listens to problems and automatically sends Slack notifications whenever a new problem is triggered.
This guide shows you how.
## What will you learn

In this tutorial, you&#x27;ll learn how to alert your team in real time by automatically messaging the details of a new problem to a specific Slack channel.

At a short glance, you will: 
- Create a simple workflow . Add an event trigger for 

 Davis problems . 
- Configure a Slack message . Save and run the 

 workflow to get email notifications. Verify your 

 workflow is working as expected. 
 
## Prerequisites
 You should have permission to configure and run a 

 simple workflow.
For example, the permission granted with the default policy is for a standard user . You should select the necessary permissions in authorization settings .
 You should allow the required permissions to
 
- Access **Workflows**. Write and execute a workflow.
For more information, see authorization settings . 

- You have set up Slack integration .
 
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

Configure a Slack message .

Select 

 **Add task** on the trigger node.

In the **Choose action** section, select **Send message** action type.
Give the action type a meaningful title.

Select a pre-configured Slack connection.

Select a Slack connection from the **Connection** drop-down list.

Select a Slack channel for your message from the **Channel** drop-down list.

In the **Message** field, enter the following:

 { "blocks": [ { "type": "header", "text": { "type": "plain_text", "text": "{{ &#x27;:white_check_mark:&#x27; if event()[&#x27;event.status&#x27;] == &#x27;CLOSED&#x27; else &#x27;:warning:&#x27; }} {{ &#x27;RESOLVED&#x27; if event()[&#x27;event.status&#x27;] == &#x27;CLOSED&#x27; else &#x27;OPEN&#x27; }} - {{ event()[&#x27;event.name&#x27;]}}", "emoji": true } }, { "type": "section", "text": { "type": "mrkdwn", "text": "- *Problem link*: <{{ environment().url }}/ui/intent/dynatrace.davis.problems/view-problem#%7B%22event.id%22%3A%22{{ event()[&#x27;event.id&#x27;] }}%22,%22event.kind%22%3A%22{{event()[&#x27;event.kind&#x27;]}}%22%7D|{{ event()[&#x27;display_id&#x27;] }}> \n- *Impacted Entities:* `{{ event()[&#x27;affected_entity_ids&#x27;] }}`\n- *Problem duration:* `{{ (event().get(&#x27;resolved_problem_duration&#x27;, 0) | int) / 1000000 / 1000 / 60 }} minutes`" } }, { "type": "section", "text": { "type": "mrkdwn", "text": {{ (&#x27;>&#x27; ~ event()[&#x27;event.description&#x27;]) | replace(&#x27;\n&#x27;, &#x27;\n>&#x27;) | to_json }} } }, { "type": "divider" }, { "type": "section", "text": { "type": "mrkdwn", "text": "*Workflow link*: <{{ environment().url }}/ui/apps/dynatrace.automations/workflows/{{ execution().workflow.id }}|Workflow>" } } ] } 

This configuration uses event context placeholders to populate the Slack message with relevant problem details dynamically.

The Problem trigger returns the problem record.
You can use any field from the problem record, stored in `dt.davis.problems`, in the Slack message.

Save and run the 

 workflow to send out Slack notifications.
 Select 

 **Create draft**. 
- Select **Deploy**.
- Select **Run** to see the selected problem event that will be used for the workflow.

Verify that your 

 workflow is working as expected:

Go to your workflow.

Select **Run**.

Select **Run** again to execute the workflow.

Execution logs aren&#x27;t available for a simple workflow.
If an error occurs, you can find the error details on the right in the task details pane.

## Conclusion

You’ve created a 

 simple workflow that sends Slack messages when problems are opened or closed.
This setup helps to ensure that your team is immediately informed about critical issues in your environment.

You can extend this workflow by 
- Adding conditions to handle specific problem categories or severities. 
- Adding auto remediation steps to your workflow. 

This workflow is a great starting point for automating incident response and improving operational awareness. 
## Related topics
 
- Create a simple workflow in Dynatrace Workflows 
- Problems app 
- Slack Connector 
 Related tags 

 Dynatrace Platform Workflows Slack
