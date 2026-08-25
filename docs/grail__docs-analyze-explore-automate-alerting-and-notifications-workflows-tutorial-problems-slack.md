---
formatVersion: "3.0.0"
id: "7ba9622b36fc53c0"
url: "https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-slack"
title: "Send Slack notifications for problems — Dynatrace Docs"
domain: "grail"
crawledAt: "2026-08-25T21:19:42.387Z"
contentHash: "1d4cb196752c2c54a8ece6cf74ede26f823865310445f6d9eaed5d066b376fbe"
source: "docs.dynatrace.com"
---

# Send Slack notifications for problems — Dynatrace Docs

## Source

- Official URL: [https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-slack](https://docs.dynatrace.com/docs/analyze-explore-automate/alerting-and-notifications/workflows-tutorial-problems-slack)
- Domain: `grail`
- Document ID: `7ba9622b36fc53c0`
- Format version: `3.0.0`

## Extracted Code Blocks

- 1. json (1154 chars)

## Content

# Send Slack notifications for problems

- Latest Dynatrace
- Tutorial
- 4-min read
- Updated on Oct 19, 2025

Problems are automatically opened by Dynatrace when anomalies or alert conditions are detected in your environment.
In **Workflows**, build a simple workflow that listens to problems and automatically sends Slack notifications whenever a new problem is triggered.
This guide shows you how.
## What will you learn

In this tutorial, you'll learn how to alert your team in real time by automatically messaging the details of a new problem to a specific Slack channel.

At a short glance, you will: 
1. Create a simple workflow.
2. Add an event trigger for Davis problems.
3. Configure a Slack message.
4. Save and run the workflow to get email notifications.
5. Verify your workflow is working as expected.
 
## Prerequisites
 
 You should have permission to configure and run a simple workflow.
For example, the permission granted with the default policy is for a standard user. You should select the necessary permissions in authorization settings.
 
 You should allow the required permissions to
 
- Access **Workflows**.
- Write and execute a workflow.
  For more information, see authorization settings.
- You have set up Slack integration.
 
## Steps

Create a simple workflow.
 
1. Go to **Workflows**.
2. Select **Workflow** in the upper-right corner of the page.
3. Select the workflow title.
  By default, it is `Untitled workflow`, and enter a meaningful name.
  The workflow type is set to simple workflow by default.

Add an event trigger for Davis problems.
 
1. In the **Select trigger** section, select a Problem trigger.
2. Set the **Problem state** to **active or closed**.
  This option means that the problem can be both active or closed.
  This setting causes the workflow to trigger twice, once when the problem becomes active and again when it is closed.
3. In the **Event category** drop-down list, select **Select all**.
4. Optional Select **Query past events** to see the most recent problem events that would have triggered this workflow.
5. Optional Enter **Entity tags** or **Additional custom filter query** to only trigger the workflow on the relevant problems.

Configure a Slack message.
 
1. Select **Add task** on the trigger node.
2. In the **Choose action** section, select **Send message** action type.
  Give the action type a meaningful title.
3. Select a pre-configured Slack connection.
4. Select a Slack connection from the **Connection** drop-down list.
5. Select a Slack channel for your message from the **Channel** drop-down list.
6. In the **Message** field, enter the following:
  
```json
{
"blocks": [
{
  "type": "header",
  "text": {
    "type": "plain_text",
    "text": "{{ ':white_check_mark:' if event()['event.status'] == 'CLOSED' else ':warning:' }} {{ 'RESOLVED' if event()['event.status'] == 'CLOSED' else 'OPEN' }} - {{ event()['event.name']}}",
    "emoji": true
  }
},
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "- *Problem link*: <{{ environment().url }}/ui/intent/dynatrace.davis.problems/view-problem#%7B%22event.id%22%3A%22{{ event()['event.id'] }}%22,%22event.kind%22%3A%22{{event()['event.kind']}}%22%7D|{{ event()['display_id'] }}> \n- *Impacted Entities:* `{{ event()['affected_entity_ids'] }}`\n- *Problem duration:* `{{ (event().get('resolved_problem_duration', 0) | int) / 1000000 / 1000 / 60 }} minutes`"
  }
},
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": {{ ('>' ~ event()['event.description']) | replace('\n', '\n>') | to_json }}
  }
},
{
  "type": "divider"
},
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "*Workflow link*: <{{ environment().url }}/ui/apps/dynatrace.automations/workflows/{{ execution().workflow.id }}|Workflow>"
  }
}
]
}
```

  This configuration uses event context placeholders to populate the Slack message with relevant problem details dynamically.
  The Problem trigger returns the problem record.
  You can use any field from the problem record, stored in `dt.davis.problems`, in the Slack message.

Save and run the workflow to send out Slack notifications.
 
1. Select **Create draft**.
2. Select **Deploy**.
3. Select **Run** to see the selected problem event that will be used for the workflow.

Verify that your workflow is working as expected:
 
1. Go to your workflow.
2. Select **Run**.
3. Select **Run** again to execute the workflow.
  Execution logs aren't available for a simple workflow.
  If an error occurs, you can find the error details on the right in the task details pane.
 
## Conclusion

You’ve created a simple workflow that sends Slack messages when problems are opened or closed.
This setup helps to ensure that your team is immediately informed about critical issues in your environment.

You can extend this workflow by 
- Adding conditions to handle specific problem categories or severities.
- Adding auto remediation steps to your workflow.

This workflow is a great starting point for automating incident response and improving operational awareness. 
## Related topics

- Create a simple workflow in Dynatrace Workflows
- Problems app
- Slack Connector
  Related tags Dynatrace Platform Workflows Slack
