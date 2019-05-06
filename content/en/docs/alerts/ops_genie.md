---
title: "Alert Using OpsGenie"
notoc: true
---

This guide describes how to send Scalyr alert notifications through OpsGenie. 

When a Scalyr alert is triggered,
Scalyr will report an incident to OpsGenie. If the alert resolves, Scalyr will mark the OpsGenie incident as resolved. You can use OpsGenie for some or all of your Scalyr alerts. You can also choose to have Scalyr send notifications to
both OpsGenie and a list of e-mail addresses.


## Steps

1. You'll need a "Scalyr Integration" in OpsGenie. If you have already created such an integration, you can use that.
Otherwise:

- Log into OpsGenie.
- Go to the [Integrations](https://www.opsgenie.com/integration) page.
- Type "scalyr" in the Search field
- Move your mouse over the Scalyr box and click "Add".
- Make a note of the {{menuRef:API Key}}.
- Make any settings changes for this integration, such as the list of teams to be notified, and click
  {{menuRef:Save Integration}}.

2. Log into Scalyr, click the {{menuRef:Alerts}} navigation link, and click {{menuRef:Edit Alerts}}.

3. Edit the Alerts configuration file to specify OpsGenie as the alert recipient. To do this for all Scalyr alerts,
create or edit an ``alertAddress`` field at the top level of the file:

    {
      "alertAddress": "***opsgenie:XXXXX***",

      alerts: [
        ...
      ]
    }

Replace XXXXX with the "API Key" you generated in OpsGenie.

To send notifications to one or more e-mail addresses in addition to OpsGenie, list them all in ``alertAddress``:

      "alertAddress": "opsgenie:XXXXX, foo@example.com, bar@example.com",

If you only want to use OpsGenie for certain alerts, you can specify an ``alertAddress`` field for those alerts:

    {
      alertAddress: "email@example.com",

      alerts: [
        // This alert will be sent to OpsGenie
        {
          trigger: "count:1m(error) > 10",
          ***"alertAddress": "opsgenie:XXXXX",***
        },

        // This alert will send notifications to email@example.com
        {
          trigger: "mean:10m($source='tsdb' $serverHost='server1' metric='proc.stat.cpu_rate' type='user') > 50"
        }
      ]
    }

To link a whole group of alerts to OpsGenie, specify an appropriate ``alertAddress`` for the group. See
[Specifying Alert Recipients](/help/alerts#recipients).


## Using multiple OpsGenie integrations

You can create any number of Scalyr integrations services in OpsGenie, each with its own settings. To link Scalyr
to multiple integrations, simply enter the appropriate API Key in each ``alertAddress`` field.
