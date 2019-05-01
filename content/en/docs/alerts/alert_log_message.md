---
title: Alert On Log Messages
---

How to generate a notification when a particular message (such as an error message) appears in your logs.


## Prerequisites

1. The Scalyr Agent should be installed on the server(s) you want to monitor, and should be configured
to upload the log file(s) you want to search.

To verify:

- In the navigation bar, click {{menuRef:Overview}}.
- Find each server in the list at the bottom of the page.
- Verify that each log file is listed next to the appropriate server.

If any server is not listed:

- If you have not installed the agent on this server, follow the [Agent Installation](/help/install-agent-linux) guide.
- If you have already installed the agent, consult the [Agent Troubleshooting](/help/scalyr-agent#troubleshooting) guide.

If any log file is not listed:

- Follow the instructions in the [Upload Multiple Log Files](/solutions/upload-multiple-logs) solution.


## Steps

1. In the navigation bar, click {{menuRef:Overview}}.

2. Find a server that you want to monitor. Click on the link for a relevant log file, to view all messages
in that log.

3. In the log page, the Expression box will look something like this:

    ($logfile='/var/log/tomcat6/accesslog') $serverHost='your-server-name'

This expression selects the specific log file you clicked on in step 2. If you want to monitor just this
log file, skip to step 4. Otherwise, you can remove the ``$serverHost`` clause, to monitor this file on
all servers:

    ($logfile='/var/log/tomcat6/accesslog')

Or remove the other clauses, to monitor all files on this server:

    $serverHost='your-server-name'

You can even erase the Expression box entirely, to monitor all log files from all servers.

4. Add your search phrase to the Expression box. It might now look like this:

    ***"deadline exceeded"*** ($logfile='/var/log/tomcat6/accesslog') $serverHost='your-server-name'

5. Click {{menuRef:Search}} to search for this phrase.

If you don't find any matches, you might have mistyped the expression, or you might be looking at the wrong
log. If you're searching for an unusual error message and it's possible that this message has not appeared
in the default search period of four hours, you can search a longer time period by editing the {{menuRef:Start}}
box and clicking {{menuRef:Search}} again.

6. Click {{menuRef:Save Search}} and choose {{menuRef:As Alert}}.

7. In the form that pops up, edit the first row to say "Alert when value is *_more_* than *_XXX_*", where
XXX is a value in events per second. You can use fractional values. Use 0 to be notified on any instance of
this message in the log.

8. The other form fields are optional, but it's usually a good idea to enter a Description. Say something like
"Server my-server-name: excessive rate of [your search phrase]".

9. Click {{menuRef:Add}} to create the alert.


## Further Reading

To view all of your alerts, click {{menuRef:Alerts}} in the navigation bar. From here, you can check
alert status, edit, silence, and delete alerts. More information can be found in the
[Alerts Reference](/help/alerts).

If you have many servers to monitor, you don't need to follow these steps for each server. You can remove the
``$serverHost`` clause from the alert, to monitor the specified log file on all servers. Or you can create a
templated alert, with an instance for each server. See the [Alert Templates](/help/alerts#templates) 
section of the Alerts Reference.

By default, the alert will send a message to the e-mail address for your Scalyr account, but you can specify
an alternate address such as your server ops team, a PagerDuty, OpsGenie, VictorOps, or Slack account, or a webhook. 
You can also have the alert sent to multiple addresses. See 
[Specifying Alert Recipients](/help/alerts#recipients).