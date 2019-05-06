---
title: Alert Using Slack
notoc: true
---

This guide describes how to send Scalyr alert notifications through Slack. When a Scalyr alert is triggered or
resolves, Scalyr will send a message to a Slack channel. You can use Slack for some or all of your Scalyr alerts.
You can also choose to have Scalyr send notifications to both Slack and a list of e-mail addresses or other
recipients.


## Steps

1. Log into Slack and go to the Incoming Webhooks page: [https://api.slack.com/incoming-webhooks](https://api.slack.com/incoming-webhooks{target=_blank}).

2. Scroll down and click the "incoming webhook integration" link.

3. Select the Slack channel where you'd like your notifications to appear, and click "Add Incoming WebHooks Integration".

4. You may wish to customize some settings. For instance, the "Customize Name" field allows you to specify the username
(e.g. "Scalyr") under which notifications will appear.

5. Click "Save Settings".

6. Make a note of the Webhook URL -- it will look something like this:

    https://hooks.slack.com/services/XXXXXXXXX/YYYYYYYYY/abc123abc123abc123

7. Log into Scalyr, click the {{menuRef:Alerts}} navigation link, and click {{menuRef:Edit Alerts}}.

8. Edit the Alerts configuration file to specify Slack as the alert recipient. To do this for all Scalyr alerts,
create or edit an ``alertAddress`` field at the top level of the file:

    {
      alertAddress: "***slack:webhookUrl=https://hooks.slack.com/services/INTEGRATION_PATH***",
      alerts: [
        ...
      ]
    }

Replace INTEGRATION_PATH with the last three sections of the Webhook URL you obtained from Slack.

To send notifications to one or more e-mail addresses in addition to Slack, list them all in ``alertAddress``:

      "alertAddress": "webhook-trigger:XXX, webhook-resolve:XXX, foo@example.com, bar@example.com",

If you only want to use Slack for certain alerts, you can specify an ``alertAddress`` field for those alerts:

    {
      alertAddress: "email@example.com",

      alerts: [
        // This alert will be sent to Slack
        {
          trigger: "count:1m(error) > 10",
          ***"alertAddress": "slack:XXX"
        },

        // This alert will send notifications to email@example.com
        {
          trigger: "mean:10m($source='tsdb' $serverHost='server1' metric='proc.stat.cpu_rate' type='user') > 50"
        }
      ]
    }

To link a whole group of alerts to Slack, specify an appropriate ``alertAddress`` for the group. See
[Specifying Alert Recipients](/help/alerts#recipients).

##Slack notification settings
Scalyr will send a message to Slack when an alert triggers, and a second message when the
alert resolves. You can disable the second message by adding ``&notifyResolved=false`` to the
``slack:`` alert address.

You can customize the color of the trigger message by adding ``&color=red``, ``&color=green``, or ``&color=yellow``.
 The resolved notification (if enabled) will always use color ``green``.

## Using multiple Slack channels

You can send notifications for different alerts to different channels in Slack. Simply create a separate WebHook
Integration for each channel.


## Troubleshooting

If you don't see messages appearing in Slack, you may have misconfigured the webhook-trigger: notification address.
For example, you may have an incorrect authorization token, in which case Slack will refuse to accept notifications
from Scalyr. To check for Slack API errors, search your logs for
[[[publicAppUrl(tag='webhookError',events?filter=tag%3D%27webhookError%27)]]].
