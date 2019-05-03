---
title: Set Alert on Live Server Count
---

How to get notified if too many servers in a group are not functioning, without being
bothered for routine events affecting a single server. You might use an alert like this if you are running a
set of interchangable servers (e.g. a web frontend pool), and it is routine for one or two servers to be down
for updates, but you want to be alerted if an unexpected number of servers are all down at once.

For unique or non-interchangable servers, such as database servers, it is generally more appropriate to
alert when an individual server goes down. See [Set Alert on Server Down](/solutions/alert-server-down).


## Before You Start

1. The Scalyr Agent should be installed on each server you want to monitor.

To verify:

- In the navigation bar, click {{menuRef:Overview}}.
- Find the servers in the list at the bottom of the page.

If any server is not listed:

- If you have not installed the agent on this server, follow the [Agent Installation](/docs/getting_started/agent_linux) guide.
- If you have already installed the agent, consult the [Agent Troubleshooting](/help/scalyr-agent#troubleshooting) guide.

2. You should assign a tag to the servers in the group, so that you can write a search that selects exactly those
servers. See [Manage Groups of Servers](/solutions/manage-server-groups). Note that 
you can combine tags with AND and OR rules, e.g. ``$tier='frontend' AND $region='us-east-1'`` or 
``$group='primary-frontend' OR $group='secondary-frontend'``.


## Steps

1. From the navigation bar, click {{menuRef:Search}}.

2. In the {{menuRef:Expression}} box, enter the following text:

    $source='tsdb' metric='proc.uptime.now'

Then press Enter.

This will show a graph of the rate at which the Scalyr Agent is reporting the server-uptime metric (proc.uptime.now),
across all of your servers. We use this metric because it is reliably reported every 30 seconds, and so can be used
to determine how many servers are up and functioning.

3. Switch to the {{menuRef:Graph}} tab, to display a larger graph.

4. Refine your search to include only the servers in the group you wish to monitor. In the
{{menuRef:Refine search by}} section to the left of the graph, select an appropriate field and value.

5. You should see a straight-line graph, with occasional narrow spikes (caused by routine jitter in the timing
of metric reports). To verify that the correct servers are included, go back to the {{menuRef:Refine search by}} section
and hover over the {{menuRef:serverHost}} field.

6. In a new browser tab, open Scalyr, click the {{menuRef:Alerts}} navigation link, and click {{menuRef:Edit Alerts}}.

7. In the ``alerts`` section of the file, add a new alert:

    {
      alertAddress: "prod@scalyr.com",
        
      alerts: [
        ***{***
          ***description: "Not enough servers running",***
          ***trigger: "count:30s(SEARCH) < THRESHOLD",***
          ***gracePeriodMinutes: 5***
        ***},***
      ]
    }

For SEARCH, paste the value from the {{menuRef:Expression}} box in your previous browser tab. For THRESHOLD, enter the
minimum number of servers you'd like to have running.

This alert will trigger if fewer than the specified number of servers have reported metrics in a 30-second window. Occasionally
a live server will miss the window due to random time jitter. The ``gracePeriodMinutes`` setting prevents the alert from
sending a notification unless it is triggered for 5 minutes in a row, filtering out false alarms.

8. Click {{menuRef:Update File}} to save your changes.


## Further Reading

To view all of your alerts, click {{menuRef:Alerts}} in the navigation bar. From here, you can check
alert status, edit, silence, and delete alerts. More information can be found in the
[Alerts Reference](/help/alerts).

By default, the alert will send a message to the e-mail address for your Scalyr account, but you can specify
an alternate address such as your server ops team, a PagerDuty, OpsGenie, VictorOps, or Slack account, or a webhook. You can also
have the alert sent to multiple addresses. See [Specifying Alert Recipients](/help/alerts#recipients).

This alert will only trigger if the Scalyr Agent is unable to report data, e.g. because the machine has failed or
has lost network connectivity. Instead (or additionally), you might want to alert if your web server is not
functioning properly. To do this, follow the [Alert When Site is Unavailable](/solutions/alert-site-unavailable)
solution to create an HTTP monitor for each server. You will probably want to create a templated monitor, as
noted in the Further Reading section of that solution. Then create an alert similar to the alert shown above.
HTTP Monitors report data every 60 seconds, so you'll want to say ``count:60s`` instead of ``count:30s``. And you'll
need to adjust the trigger search to match on a successful result from the HTTP monitor. The trigger expression
might look something like this:

    tag='httpMonitor' status=200 url contains "https://frontend-pool"

This expression would match all monitors on a url beginning with "frontend-pool". Adjust the expression as needed
to match the servers in your pool. Or you can apply a tag to your monitors, and then reference that tag in your
trigger expression. Here is an example of a templated monitor declaration that includes a tag:

    {
      templateParameters: [
        { hostname: "frontend-pool-1.example.com" },
        { hostname: "frontend-pool-2.example.com" },
        { hostname: "frontend-pool-3.example.com" },
        { hostname: "frontend-pool-4.example.com" }
      ],
      
      monitors: [
        { type: "http", url: "http://#hostname#/healthcheck", logAttributes: {monitorPool: "frontend"} }
      ]
    }

You could then use the following trigger expression to count the number of properly functioning web servers in this group:

    tag='httpMonitor' status=200 monitorPool='frontend'
