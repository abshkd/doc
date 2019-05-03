---
title: Set Alert on System Metric
---

How to generate notifications based on server metrics, such as a full
disk or overloaded CPU.


## Before You Start

1. The Scalyr Agent should be installed on the server you want to monitor.

To verify:

- In the navigation bar, click {{menuRef:Overview}}.
- Find the server in the list at the bottom of the page.

If the server is not listed:

- If you have not installed the agent on this server, follow the [Agent Installation](/docs/getting_started/agent_linux) guide.
- If you have already installed the agent, consult the [Agent Troubleshooting](/help/scalyr-agent#troubleshooting) guide.


## Steps

1. From the navigation bar, click {{menuRef:Dashboards}}, and select {{menuRef:System}}.

2. In the form near the top of the page, click {{menuRef:ServerHost}} and select the hostname of the
server you wish to monitor. (You should now see a set of graphs, showing system metrics for that server.)

3. Click on the graph showing the metric you'd like to alert on. You should be taken to a page showing a larger
version of that graph.

4. Immediately below the graph is a list of metrics displayed in that graph. If you would like to alert based
on the first metric listed, skip to step 5. Otherwise, you will need to edit the Expression box in the graph
form, to specify the appropriate metric. Use the following chart:

Metric                          | Edit
1-minute CPU load average       | None
15-minute CPU load average      | Change ``proc.loadavg.1min`` to ``proc.loadavg.15min``
User CPU usage                  | None
System or iowait CPU usage      | Change ``type='user'`` to ``type='system'`` or ``type='iowait'``
Free space on root disk         | None
Free space on other disk        | Change ``mount='/'`` to ``mount='/mount-point-of-other-disk'``
Inbound network bandwidth       | None
Outbound network bandwidth      | Change ``direction='in'`` to ``direction='out'``
Average latency of disk reads   | None
Average latency of disk writes  | Change ``metric='iostat.part.msec_read'`` to ``metric='iostat.part.msec_write'``

5. Above the graph, click {{menuRef:Save Search}} and choose {{menuRef:As Alert}}.

6. In the form that pops up, edit the first row to specify when the alert should trigger. When specifying the
numeric value, be careful to use the units of the metric you're alerting on. For instance, to alert when there
is less than 500MB of free disk space, say: "Alert when value is *_less_* than *_500000_*" (since disk space
is measured in KB). To alert if the CPU load average is above 10, say: "Alert when value is *_more_* than *_10_*".

7. The other form fields are optional, but it's usually a good idea to enter a Description. Say something like
"Server my-server-name: elevated CPU load".

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