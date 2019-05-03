---
title: Set Alert on Server Down
---

How to get notified if a server ceases to function. This alert is designed
to monitor the basic functioning of the server host (power, network connectivity, etc.). To alert on
problems with a particular piece of software, such as a web server, see other solutions in the
[Alerts](/help/solutions#alerts) section of the Solutions directory.


## Before You Start

1. The Scalyr Agent should be installed on the server you want to monitor.

To verify:

- In the navigation bar, click {{menuRef:Overview}}.
- Find the server in the list at the bottom of the page.

If the server is not listed:

- If you have not installed the agent on this server, follow the [Agent Installation](/docs/getting_started/agent_linux) guide.
- If you have already installed the agent, consult the [Agent Troubleshooting](/help/scalyr-agent#troubleshooting) guide.


## Steps

Scalyr provides a powerful alert manager which can trigger alerts based on any of your server metrics or
logs. These steps show how to use the alert manager to notify you when a server ceases to function.

1. From the navigation bar, click {{menuRef:Dashboards}}, and select {{menuRef:System}}.

2. In the form near the top of the page, click {{menuRef:ServerHost}} and select the hostname of the
server you wish to monitor. (You should now see a set of graphs, showing system metrics for that server.)

3. Click in the first graph ("CPU load average"). You should be taken to a page showing a larger graph of
the server's CPU usage.

4. In the form above the graph, in the {{menuRef:Variable}} box, delete the word "value" and press
{{menuRef:Search}}. You should now see a flat graph (with value around 0.033), showing the number of
CPU measurements per second transmitted by the Scalyr Agent on this server.

5. Above the graph, click {{menuRef:Save Search}} and choose {{menuRef:As Alert}}.

6. In the form that pops up, edit the first row to say: "Alert when value is *_less_* than *_0.02_*".
This will trigger an alert if the Scalyr Agent transmits fewer than 0.02 CPU measurements per second
(on average). Normally, it transmits a measurement every 30 seconds, or 0.033 per second. If this value
drops, it means the server has failed, or is experiencing serious network problems.

7. The other form fields are optional, but you should probably fill in the Description. Say something like
"Server my-server-name down (no data received from the Scalyr Agent)".

8. Click {{menuRef:Add}} to create your alert.


## Further Reading

To view all of your alerts, click {{menuRef:Alerts}} in the navigation bar. From here, you can check
alert status, edit, silence, and delete alerts. More information can be found in the
[Alerts Reference](/help/alerts).

If you have many servers to monitor, you don't need to follow these steps for each server. Instead, you
can create a templated alert that monitors all of your servers at once. See the
[Alert Templates](/help/alerts#templates) section of the Alerts Reference.

By default, the alert will send a message to the e-mail address for your Scalyr account, but you can specify
an alternate address such as your server ops team, a PagerDuty, OpsGenie, VictorOps, or Slack account, or a webhook. You can also
have the alert sent to multiple addresses. See [Specifying Alert Recipients](/help/alerts#recipients).