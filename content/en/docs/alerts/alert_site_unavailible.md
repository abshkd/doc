---
title: Alert When Site is Unavailable
---
How to generate a notification when a web site (or other HTTP service)
is unavailable, based on external probes from Scalyr servers.


## Steps

These steps fall into two sections. First, you will create an HTTP Monitor, to periodically fetch
a specified URL. The monitor will record your server's response in your Scalyr log data. Then, you
will create an alert based on that data.

1. From the navigation bar, click {{menuRef:Dashboards}}, and select {{menuRef:Monitors}}.

2. If there is already a monitor listed for the URL you'd like to monitor, skip to step 7. Otherwise,
click {{menuRef:Edit Monitors}} to open the monitors configuration file.

3. Find the ``monitors`` section of the configuration file. If you have never edited this file before,
the monitors section will look like this:

      monitors: [
        // {
        //   type:        \"http\",
        //   url:         \"http://www.example.com/foo?bar=1\"
        // },
        // {
        //   type:        \"http\",
        //   url:         \"http://www.example.com/foo?bar=1\"
        // }
      ]

4. Add a stanza listing the URL you'd like to monitor. If you like, you can also delete the commented-out
example monitors. The section might now look like this:

      monitors: [
        {
          type: "http",
          url: "http://your-domain/your-page"
        }
      ]

5. Click {{menuRef:Update File}} to save your changes. Scalyr will begin fetching the new URL once per minute.

6. Return to the Monitors dashboard (see step 1), refresh, and look for the new URL to appear. You will have
to wait up to one minute before the refresh will display your newly monitored URL.

7. To alert if the site is slow:

- Click in the chart on the average response time for this URL. You should see a graph of response times,
  in milliseconds. (If you've just created the HTTP Monitor, the graph won't have much data yet.)
- Above the graph, click {{menuRef:Save Search}} and choose {{menuRef:As Alert}}.
- In the form that pops up, edit the first row to say "Alert when value is *_more_* than *_XXX_*", where
  XXX is a value in milliseconds.
- The other form fields are optional, but it's usually a good idea to enter a Description. Say something like
  "Server my-server-name: elevated response time".
- Click {{menuRef:Add}} to create the alert.

8. To alert if the site is returning errors:

- Click in the chart on the number of "2xx" (success) responses for this URL.
- Edit the graph Expression to reflect the range of status codes you'd like to alert on. To detect
  only 5xx (server error) responses, change ``status >= 200 status <= 299`` to ``status >= 500 status <= 599``.
- Above the graph, click {{menuRef:Save Search}} and choose {{menuRef:As Alert}}.
- In the form that pops up, edit the first row to say "Alert when value is *_more_* than *_XXX_*", where
  XXX is measured in errors per second.
- The other form fields are optional, but it's usually a good idea to enter a Description. Say something like
  "Server my-server-name: elevated error rate".
- Click {{menuRef:Add}} to create the alert.


## Further Reading

To view all of your alerts, click {{menuRef:Alerts}} in the navigation bar. From here, you can check
alert status, edit, silence, and delete alerts. More information can be found in the
[Alerts Reference](/help/alerts).

To learn more about HTTP monitors, see the [Monitors](/help/monitors) reference.

If you have many servers to monitor, you don't need to follow these steps for each server. Instead, you
can create a templated monitor that checks multiple URLs, and a templated alert that watches for errors
in each URL. See the [Monitor Templates](/help/monitors#templates) and 
[Alert Templates](/help/alerts#templates) documentation.

By default, the alert will send a message to the e-mail address for your Scalyr account, but you can specify
an alternate address such as your server ops team, a PagerDuty, OpsGenie, VictorOps, or Slack account, or a 
webhook. You can also have the alert sent to multiple addresses. See 
[Specifying Alert Recipients](/help/alerts#recipients).