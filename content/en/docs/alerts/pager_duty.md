---
title: Alert Using PagerDuty
notoc: true
---

This guide describes how to send Scalyr alert notifications through PagerDuty. When a Scalyr alert is triggered,
Scalyr will report an incident to PagerDuty. If the alert resolves, Scalyr will mark the PagerDuty incident as resolved.
You can use PagerDuty for some or all of your Scalyr alerts. You can also choose to have Scalyr send notifications to
both PagerDuty and a list of e-mail addresses.


## Steps

1. You'll need a "Generic API" service in PagerDuty. If you have already created such a service, you can use that.
Otherwise:

- Log into PagerDuty.
- In the navigation bar, click on {{menuRef:Services}}.
- Click {{menuRef:Add New Service}}.
- Give the new service a name (e.g. "Scalyr") and choose an escalation policy. For the Integration Type, choose
  "Use our API directly". Then click {{menuRef:Add Service}}.
- Make a note of the "Service API Key" for the service you've just created.

2. Log into Scalyr, click the {{menuRef:Alerts}} navigation link, and click {{menuRef:Edit Alerts}}.

3. Edit the Alerts configuration file to specify PagerDuty as the alert recipient. To do this for all Scalyr alerts,
create or edit an ``alertAddress`` field at the top level of the file:

    {
      "alertAddress": "***pagerduty:XXXXX***",

      alerts: [
        ...
      ]
    }

Replace XXXXX with the "Service API Key" you generated in PagerDuty.

To send notifications to one or more e-mail addresses in addition to PagerDuty, list them all in ``alertAddress``:

      "alertAddress": "pagerduty:XXXXX, foo@example.com, bar@example.com",

If you only want to use PagerDuty for certain alerts, you can specify an ``alertAddress`` field for those alerts:

    {
      alertAddress: "email@example.com",

      alerts: [
        // This alert will be sent to PagerDuty
        {
          trigger: "count:1m(error) > 10",
          ***"alertAddress": "pagerduty:XXXXX",***
        },

        // This alert will send notifications to email@example.com
        {
          trigger: "mean:10m($source='tsdb' $serverHost='server1' metric='proc.stat.cpu_rate' type='user') > 50"
        }
      ]
    }

To link a whole group of alerts to PagerDuty, specify an appropriate ``alertAddress`` for the group. See
[Specifying Alert Recipients](/help/alerts#recipients).


## Using multiple PagerDuty services

You can create any number of "Generic API" services in PagerDuty, each with its own escalation policy. To link Scalyr
to multiple services, simply enter the appropriate Service API Key in each ``alertAddress`` field.
