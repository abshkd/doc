---
title: "Alert Using VictorOps"
notoc: true
---

This guide describes how to send Scalyr alert notifications through VictorOps. When a Scalyr alert is triggered or
resolves, Scalyr will trigger an event to VictorOps. You can use VictorOps for some or all of your Scalyr alerts.
You can also choose to have Scalyr send notifications to both VictorOps and a list of e-mail addresses or other
recipients.


## Steps

1. Log into VictorOps and go to: [VictorOps](https://help.victorops.com/knowledge-base/victorops-restendpoint-integration{target=_blank})
   and follow the instructions to enable the REST alerts.

2. Note the REST notification URL. It will look like: 


    https://alert.victorops.com/integrations/generic/20131114/alert/$apikey/$routing_key

3. Log into Scalyr, click the {{menuRef:Alerts}} navigation link, and click {{menuRef:Edit Alerts}}.

4. Edit the Alerts configuration file to specify VictorOps as the alert recipient. To do this for all Scalyr alerts,
create or edit an ``alertAddress`` field at the top level of the file:

    {
      alertAddress: "***victorops:webhookUrl=https://alert.victorops.com/integrations/generic/20131114/alert/$api_key/$routing_key***",
      alerts: [
        ...
      ]
    }


To send notifications to one or more e-mail addresses in addition to VictorOps, list them all in ``alertAddress``:

      "alertAddress": "victorops:XXX, webhook-resolve:XXX, foo@example.com, bar@example.com",

If you only want to use VictorOps for certain alerts, you can specify an ``alertAddress`` field for those alerts:

    {
      alertAddress: "email@example.com",

      alerts: [
        // This alert will be sent to VictorOps
        {
          trigger: "count:1m(error) > 10",
          ***"alertAddress": "victorops:XXX"
        },

        // This alert will send notifications to email@example.com
        {
          trigger: "mean:10m($source='tsdb' $serverHost='server1' metric='proc.stat.cpu_rate' type='user') > 50"
        }
      ]
    }

To link a whole group of alerts to VictorOps, specify an appropriate ``alertAddress`` for the group. See
[Specifying Alert Recipients](/help/alerts#recipients).

## VictorOps notification settings

### Message Type/Severity
Scalyr will send a message to VictorOps when an alert triggers. By default, the message severity will be ``CRITICAL``. 
All ``CRITICAL`` alerts are paged. You can choose from severities by adding a URL parameter ``messageType`` with values ``messageType=CRITICAL``, ``messageType=WARNING`` or 
``messageType=INFO``.

eg. ``victorops:webhookUrl=https://alert.victorops.com....&messageType=WARNING`` will send warning messages. 


All the resolved Scalyr alerts will be sent with a message type ``RECOVERY``. 

### Message Display Name
By default, the ``entity`` field will have the Scalyr Alert URL as the content. If you wish to add more context, you can do it via
adding a URL parameter ``displayName`` 

eg. ``victorops:webhookUrl=https://alert.victorops.com....&displayName=somemeaningfulname`` will append the 
text ``somemeaningfulname`` to the Scalyr Alert URL string in the ``entity`` field.



## Troubleshooting

If you don't see messages appearing in VictorOps, you may have misconfigured the victorops: notification address.
For example, you may have an incorrect routing key, or alert URL, in which case VictorOps will refuse to accept notifications
from Scalyr. 

## Further Reading

The [Alerts reference](/help/alerts) documents the format of the Scalyr alerts file.

Scalyr sends notifications to VictorOps at the same time it would send an e-mail notification. In particular,
[Grace Periods](/help/alerts#gracePeriod) and 
[Repeated Notifications](/help/alerts#renotification) both apply.