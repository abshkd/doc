---
title: "Create Alerts"
weight: 23
---

Scalyr's Alerts feature lets you define rules that generate and distribute alert events when their conditions are met. Those conditions typically involve some metric's value moving out of its normal range, or the occurrence of an event. These can be one-time events, or they can require a number of instances within a time interval. You can define rules based on any type of data, such as system metrics, access logs, or custom metrics, using simple or complex rules. Here are some examples:

- CPU usage exceeds 90%
- Disk space utilization is above 90%
- More than 50 error pages served in a 5-minute period
- For ``/renderImage`` requests returning less than 5MB of data, 90th percentile latency over the last 10 minutes was more than twice the equivalent latency for ``/home`` requests


For each rule, you can specify one or more email addresses to receive alert notifications. In addition, you have the option of temporarily disabling any rule, whether it has triggered an alert or not. That is known as *muting* the alert.

Whenever a rule's conditions apply, Scalyr sends an Alarm Triggered message to the rule's email addresses, with details about the event. Once the conditions no longer apply, Scalyr sends an Alarm Resolved message.

You generally create new rules from the Search page, then view and manage them on the Alerts page. However, some advanced features are available only by editing the Alerts configuration file directly. This topic is addressed later, under [Editing the Alerts Config File](#alertsConfig).


definingRules: <Defining Rules>
## Defining Alert Rules
To define a new rule, go to the Search page, set up a search that includes filter conditions in the query expression field, and click Save > Save as Alert. This opens the Add Rule editor as shown below.

[[[{type: "image", name: "newAddAlert.png", maxWidth: 750}]]]

The editor displays the following property fields, which define the rule:

|||  Property            |||   Description                                                  |||   Default
|||  Description         |||   Description of the condition \
                               that triggers this alert. Shown \
                               in all three tabs on the Alerts page, \
                               and included in alert notification messages. \
                               Serves as the rule's name.                                   |||   The actual query expression
|||  Trigger             |||   Specifies the interval and condition that trigger \
                               the alert. \
                               Refer to [Trigger Expressions](/help/alerts#triggers) below \
                               for more details.                                            |||   Any instance
|||  email              |||   Specifies one or more email addresses to notify. \
                               Multiple \
                               addresses must be separated by commas or semicolons.         |||   The address of the current user or account.
|||  Grace Period        |||   Specifies the duration a trigger event must last \
                               before an alert is generated.  Details are provided \
                               [below](#gracePeriod).                                       |||   1 minute
|||  Reminder Period     |||   Specifies the interval, in minutes, at which Scalyr \
                               will send repeat alerts about the same continuing event. \
                               Details are provided [below](#reminders).                    |||   60 minutes
|||  Resolution Delay    |||   Specifies how long an alert condition must no longer \
                               be true for the alert to be considered resolved. Details \
                               are provided [below](#resolution).                           |||   5 minutes
   
When you have set the properties for a rule, click the Save button and it will be added to the list on the Alerts page. New rules take effect immediately.


gracePeriod: <Grace Period>
### Grace Period

Sometimes you may not want to be notified of an alert unless it has triggered for several minutes in a row. For instance, it may be normal for a server to experience a brief spike of high latency, but you want to be notified if the high latency persists for more than a few minutes. In this case, you might set the rule's grace period to 3 minutes, requiring the high latency to persist for 3 minutes before an alert is generated.

Advanced users, note that this value can be edited in the config file as the ``gracePeriodMinutes:`` property.

reminders: <Reminder Period>
### Reminder Period

If a rule remains triggered for a long time, Scalyr will send repeat alerts as a reminder that the trigger condition is still in effect. By default, a new message is sent once per hour, but you can control this by specifying a value for the reminder period. For example, to repeat an alert once every two hours, set the reminder period to 120 minutes.

The default value is 60 minutes. To disable reminder alerts altogether, set this value to 0.

Advanced users, note that this value is stored in the config file as the ``renotifyPeriodMinutes:`` property.

Note that this setting applies only to alert states that remain continuously triggered for a long period of time. If an alert triggers, quickly resolves, and then quickly triggers again, a new notification will be sent regardless of its reminder period.

Also, when you specify [PagerDuty](#pagerduty), [OpsGenie](#opsgenie), or [VictorOps](#victorops) as your alert delivery channel, Scalyr does not send repeated notifications, because those products have their own systems for managing unresolved alerts (details below).


resolution: <Resolution Delay>
### Resolution Delay

When an alert resolves, Scalyr waits a few minutes before notifying you, in order to avoid a flood of alternating Triggered and Resolved messages if the condition is moving in and out of alert state. By default, the resolution delay is 5 minutes.

Setting the value to 0 disables any delay, and messages will be sent instantly. A value of 9999 disables Resolved messages altogether.

Advanced users, note that this value is stored in the config file as the ``resolutionDelayMinutes:`` property.

Once a rule has been defined and saved, it appears in the list of all alerts on the Alerts page. The list includes rules that have not triggered alerts, and those that have.

## Defining Rules Directly
To define a new rule from the Alerts page, click the ADD ALERT button. A rule editor similar to the one described above will open. Edit the new rule, including specifying the actual terms of the trigger expression, and then save it; guidelines are provided below. In general, it's easier to create an alert from the Search page, since the trigger expression has already been defined.
   
triggers: <Trigger Expressions>
### Trigger Expression Syntax

The Trigger property for every rule defines the event or condition that will trigger an alert. It is expressed in the same [query language](/help/query-language)
as search expressions on the Search page. The basic syntax of an alert trigger is an expression with the following format:

    [Function]:[Time]([Attr where] [Filter])

where:

- [Function] is one of the functions listed in the table below. 
- [Time] specifies the time window to be considered, e.g. ``5m`` for 5
minutes. (The unit can be 'seconds', 'minutes', 'hours', 'days', 'weeks', or their abbreviations.)
- [Attr where] is the name of an event field with numeric values
- [Filter] is a filter expression. The function should then be compared with a threshold
value, using standard operators such as < and >.

Examples:

Alert if more than 10 log messages in the last minute contain the word "error":

    count:1m(error) > 10

Alert if the average response size in requests for ``/home``, over the last 5 minutes, is less than 100:

    mean:5m(bytes where path == '/home') < 100

Alert if the 95th percentile latency of requests for ``/home`` over the last hour exceeds 1000 milliseconds:

    p[95]:1h(latency where path == '/home') >= 1000

You can use any of the functions described in [Graph Functions](/help/graph-reference#functions), plus the following:

- ``count``: The number of matching events over the entire time period
- ``countPerSecond``: The number of matching events per second
- ``mean``: The average field value

Functions can be combined using the following standard operators: + - * / < > <= >= && || !.

Examples:

Alert if there are at least 10% as many *'server error'* messages as *success* messages (note that *'server error'* needs quotes, because it contains a space, but *success* does not):

    count:1m('server error') > count:1m(success) * 0.1
    
Alert if mean latency for ``/home`` requests is greater than 200 milliseconds, but only if there are at least 20 such requests to take an average from:

    mean:1m(latency where path == '/home') > 200 && count:1m(path == '/home') >= 20

Alert if available disk space falls by more than 1GB in an hour (ex. if in the last hour disk space has ever been at least 1 GB more than it was in the last 5 minutes on the localhost):

    max:1h(metric='df.1kblocks.free' mount='/' serverHost='localhost') - min:5m(metric='df.1kblocks.free' mount='/' serverHost='localhost') > 1000000


#### Special Functions

You can use the following special functions in defining trigger expressions:

|||  Function                    |||   Result
|||  ``hourOfDay()``             |||   The current hour of the day (0 - 23), in GMT.
|||  ``hourOfDay(timeZone)``     |||   The current hour of the day (0 - 23), in the specified time zone. For instance, \
                                       "PST".
|||  ``dayOfWeek()``             |||   The current day of the week (0 for Sunday, 1 for Monday, 6 for Saturday), in GMT.
|||  ``dayOfWeek(timeZone)``     |||   The current day of the week (0 for Sunday, 1 for Monday, 6 for Saturday), \
                                       in the specified time zone. For instance, "PST".
|||  ``dayOfMonth()``            |||   The current date of the month (1 for the first day of the month), in GMT.
|||  ``dayOfMonth(timeZone)``    |||   The current date of the month (1 for the first day of the month), in the \
                                       specified time zone. For instance, "PST".

The ``hourOfDay()``, ``dayOfWeek()``, and ``dayOfMonth()`` functions can be used to write rules that only trigger during
certain times of the day, week, or month. For example, the following rule will trigger if the message "success" occurs
fewer than 5 times per second during business hours:

    countPerSecond:10m(success) < 5
    && dayOfWeek("PST") >= 1 && dayOfWeek("PST") <= 5
    && hourOfDay("PST") >= 9 && hourOfDay("PST") <= 17



viewingRules: <Viewing Rules and Alerts>
## Viewing Rules and Alerts

You view and work with rules and alerts on the Alerts page, as shown below.

[[[{type: "image", name: "newAlertsPage.png", maxWidth: 750}]]]

The three tabs represent different sets of the currently defined rules, with some overlap. The All tab shows the whole set, regardless of alert status. The Triggered tab shows the rules that have been triggered within the last minute and any rules that have been triggered within the last hour. The Muted tab shows rules that are in the muted state (see below).

Any rule that has triggered an alerts within the last hour will have a history graph to its right showing the alert activity for that rule over the past hour. Each colored bar represents one minute.

A red bar indicates that a trigger condition was in effect for some or all of that minute. For example, if the last 22 bars are red, the alarm was triggered at some point during each of those last 22 minutes. If the first ten bars are red, the alert was triggered at the beginning of the last hour but resolved fifty minutes ago. If red bars are scattered through the graph, the alert condition was triggering and resolving intermittently.

A green bar represents a minute when the rule was not generating an alert.


workingWithRules: <Working with Rules and Alerts>
## Working with Rules

Once rules are defined, there are only a few things you do with them.

### Muting and Unmuting
You can mute a rule so that it is temporarily disabled. To mute one or more rules, select the checkboxes in the first column, and click the Mute button in the actions bar above the list. When rules are muted, they are added to the list on the Muted tab, but also remain on the All tab and, if in the alert state, also on the Triggered tab.

To un-mute a muted rule, click the Un-mute icon on that row, or select it using checkboxes and click the Un-mute button.


### The Details Page

To view all the properties defining a rule, click on it in any of the three tabs to open the Details page:


[[[{type: "image", name: "newAlertDetails.png", maxWidth: 750}]]]
 

The Details page provides the following features:

- Description of the rule **(1)**, which also serves as the name.
- Trigger expression **(2)**, in the Scalyr query language. You can click the Change link **(3)** to open the rule editor and make changes.
- Time Series bar graph **(4)**. Each bar represents the default time interval, and the height of the bar indicates the number of trigger events. Hover your cursor over any bar to display the exact value and time it represents below the graph **(5)**. Click the Expand link **(6)** to display the graph on the Search page.
- Notification parameters **(7)**: email, grace period, reminder period, and resolution delay. Click the Change link **(8)** to open the rule editor and make changes.
- Buttons to MUTE, UN-MUTE, or DELETE a rule **(9)**.


### Editing and Deleting Rules

To edit a rule, hover over the row for that rule and open the editor by clicking the pencil icon that appears. When you are finished, click the Save button.

If a rule has values specified for the grace period, reminder period, or resolution delay, clearing the value will reset them to their defaults.

You can also open the rule editor from inside the details page for any rule, as mentioned above.

You can only edit rules one at a time; checkboxes are used only for muting and deleting.

To delete one or more rules, select them using the checkboxes and then click the Delete button in the actions bar.

**NOTE**: If you edit or delete a rule that was created using a template (details [below](#alertTemplates)), your actions will apply to all other rules based on that template.



alertsConfig: <Editing the Alerts Config File>
## Editing the Alerts Config File
Rules created through the UI are saved in the [/scalyr/alerts](/file?path=%2Fscalyr%2Falerts[[[emitAddlParamTeamTokenIfPhoenix]]]) 
configuration file. You generally don't need to edit this file directly, but there are a few advanced features, such as alert groups and templates, that can only be used by editing the config file manually. 

The file has the following structure:

    {
      alertAddress: "email@example.com",
     
      alerts: [
        // Alert if there are more than 10 log messages containing the word "error" in a single minute.
        {
          trigger: "count:1m(error) > 10",
          description: "Excessive error messages; "
                     + "see http://example.com/playbook/serverErrors"
        },
        // Alert if mean usermode CPU usage on server1 exceeds 0.5 cores over 10 minutes.
        {
          trigger: "mean:10m($source='tsdb' $serverHost='server1' metric='proc.stat.cpu_rate' type='user') > 50",
          description: "Server1 CPU high"
        }
      ]
    }

``alertAddress`` is the email address to which alerts are sent. If you do not specify an alertAddress, alerts will be
sent to the email address associated with your Scalyr account. ``alerts`` is a list of alert specifications.

The general form of an alert specification is:

      {
          trigger:                "...expr...",
          description:            "..."         // optional
          silenceUntil:           "...",        // optional
          silenceComment:         "...",        // optional
          gracePeriodMinutes:     nnn,          // optional
          renotifyPeriodMinutes:  nnn,          // optional
          resolutionDelayMinutes: nnn           // optional
      }

``description`` can contain any text (including links) and serves as the name of the rule. The "silence" parameters define mute conditions. Mutes, trigger expressions, grace periods, reminder periods, and resolution delays are discussed above.

alertTemplates: <Alert Templates>
## Alert Templates

If you are running multiple servers, you will probably want to create alerts for each server. To make it easy to define your alerts once and apply them to multiple servers, use Alert Templates. This advanced feature requires manually editing the config file to include a ``templateParameters`` section, containing a list of all hosts where you want to add a specified rule or rules.

Here is an example of an alert template that defines two rules, "high CPU usage" and "root disk almost full," and applies them to three servers:

    {
      alerts: [
        {
          templateParameters: [
            {host: "host1"},
            {host: "host2"},
            {host: "host3"}
          ],
          alerts: [
            {
              description: "#host#: high CPU usage",
              trigger: "mean:5m($source='tsdb' $serverHost='#host#' metric='proc.stat.cpu_rate' type='user') > 400.0"
            }, {
              description: "#host#: root disk almost full"
              trigger: "mean:10m($source='tsdb' metric='df.1kblocks.free' $serverHost == '#host#' mount=='/' ) < 500000"
            }
          ]
        }
      ]
    }

``templateParameters`` is a list of key/value pairs that will be applied to each alert in the ``alerts`` list, using variable
substitution. Within an alert's ``description``, ``trigger``, or ``alertAddress`` field, ``#host#`` will be replaced in turn
with each value of ``host`` from the template, resulting in three alerts.

You can use additional template parameters to customize your alerts. For instance, suppose your servers use different
processors and you want to alert at a different CPU threshold on each server. You could add a cpuLimit parameter:

    {
      alerts: [
        {
          templateParameters: [
            {host: "host1", cpuLimit: 240},
            {host: "host2", cpuLimit: 400},
            {host: "host3", cpuLimit: 300}
          ],
          alerts: [
            {
              description: "#host#: high CPU usage",
              trigger: "mean:5m($source='tsdb' $serverHost='#host#' metric='proc.stat.cpu_rate' type='user') > #cpuLimit#"
            }, {
              description: "#host#: root disk almost full"
              trigger: "mean:10m($source='tsdb' metric='df.1kblocks.free' $serverHost == '#host#' mount=='/' ) < 500000"
            }
          ]
        }
      ]
    }

When the Scalyr Agent uploads data from each of your servers, it sets ``$serverHost`` to the server
hostname. Use that field in a trigger's query expression to tie it to a particular host.
You can attach additional fields to each server, e.g. to work with groups of servers; see the
[Manage Groups of Servers](/solutions/manage-server-groups) solution page.


### Per-Server Alerts

Rather than explicitly listing parameter values for an alert template, you can configure a template to automatically
apply to all your servers. You can also configure it to apply to selected servers, e.g. all frontends or all database
servers.

Instead of a ``templateParameters`` clause, specify a ``byHosts`` clause. Here is the first example from
the previous section, rewritten using ``byHosts``:

    {
      alerts: [
        {
          byHosts: {
            filter: "",              // Blank means "all hosts"
            fields: ["serverHost"],  // Retrieve the "serverHost" (hostname) field for use in alert templates.
                                     // (You can specify "serverHost", "serverIP", and/or any server-level fields
                                     // defined in the Scalyr Agent configuration.)
            maxAgeHours: 4           // Ignore hosts which have not sent any data in the last 4 hours
          },
          alerts: [
            {
              description: "#serverHost#: high CPU usage",
              trigger: "mean:5m($source='tsdb' $serverHost='#serverHost#' metric='proc.stat.cpu_rate' type='user') > 400.0"
            }, {
              description: "#serverHost#: root disk almost full"
              trigger: "mean:10m($source='tsdb' metric='df.1kblocks.free' $serverHost == '#serverHost#' mount=='/' ) < 500000"
            }
          ]
        }
      ]
    }

A pair of alerts will be created for each server that has generated logs or metric data in the last four hours. 
When you add or remove a server, e.g. in an EC2 autoscaling group, the alert list will automatically adjust. Note
that alerts for a removed server will linger for several hours, based on the value of ``maxAgeHours``. When a server stops
sending data, Scalyr can't tell whether you've deliberately terminated it, or the server has crashed, lost power
or network, or experienced some other problem. ``maxAgeHours`` allows the server's alerts to persist so that you can
be warned of unplanned server termination.

All three fields of the ``byHosts`` clause are optional. If ``filter`` is absent or empty, the alerts apply to
every server. The ``fields`` list, if not specified, defaults to ``serverHost`` (hostname) and ``serverIP`` (IP address).
The default for ``maxAgeHours`` is 4 hours. Alerts may linger for an hour or so beyond the period specified in ``maxAgeHours``.

You can use the Scalyr [query language](/help/query-language) to filter servers.
The filter expression can reference ``serverHost`` (the server's hostname), ``serverIP`` (the server's IP address),
and any server-level fields defined in the Scalyr Agent configuration.

Example values for the ``filter`` field:

- All servers whose hostname contains "frontend": ``"serverHost contains 'frontend'"``
- All servers whose agent configuration includes a server-level field named "scope", with value "staging": "``scope == 'staging'"``
- All servers having logs tagged with parser name "xxx": ``"parser:xxx"``
- All servers where "xxx" appears anywhere in the file name or parser name of any log: ``"xxx"``

In addition, you can select servers based on log files and log parsers, using the text search syntax. When you use a text
search filter, each server is treated as having the following text listing each log file and any associated parsers:

    [parser:xxx] [parser:yyy] [log:aaa] [log:bbb] ...

### Managing Templated Alerts

To create an alert template, edit the [/scalyr/alerts](/file?path=%2Fscalyr%2Falerts[[[emitAddlParamTeamTokenIfPhoenix]]]) configuration
file. Templated alerts can be managed like any other alerts on the Alerts page. If you edit or delete a templated alert, all rules based on that template will be affected.



messages: <Alert Messages>
## Alert Messages

When an alert triggers (the alert condition becomes true), an email message is sent to the address specified
in [/scalyr/alerts](/file?path=%2Fscalyr%2Falerts[[[emitAddlParamTeamTokenIfPhoenix]]]). The message identifies the alert
and contains a link to a graph of the data on which the alert is based.

When the alert condition ceases to be true, Scalyr waits a few minutes and then sends an "alert resolved"
message. The delay is to avoid a flurry of messages if a borderline alert repeatedly flips between red and green.
You can always see the latest alert status at [[[publicAppUrl(alerts)]]].

To protect your inbox, Scalyr imposes a limit on the number of email messages sent per hour. If
the limit is exceeded, alert messages will be delayed for a few minutes and then sent in a batch (several alerts
in one email).

If you would prefer to receive a separate message for each alert, use the prefix "unbatched:" when specifying your
email address. For instance:

    alertAddress: "unbatched:frontend-team@example.com"


silencing: <Muting Alerts>
### Muting Alerts

Muting adds a silencing condition for an alert in the [/scalyr/alerts](/file?path=%2Fscalyr%2Falerts[[[emitAddlParamTeamTokenIfPhoenix]]]) file. Alert fields
beginning with "silence" are related to muting:

    {
      trigger: "count:1m(error) > 10",
      description: "Excessive error messages",
      ***silenceUntil: "Feb. 10 2013",***
      ***silenceComment: "Spurious errors, will be fixed in next server push"***
    },

The silenceUntil field causes the alert to be ignored until the specified time is reached. You can use any standard date/time formats, except for relative formats (such as "4 hours").

The silenceComment field is optional. Use it to record a reminder of why you silenced the alert.



recipients: <Alert Recipients>
## Specifying Alert Recipients

Anywhere you specify an email address for alerts, you can specify multiple addresses separated by commas or semicolons. All of the addresses will receive the alert.

You can direct an individual alert to a different list of email addresses by adding an alertAddress field to the alert specification:

    {
      alerts: [
        {
          trigger: "count:1m(error) > 10 $tier='frontend'",
          alertAddress: "frontend-team@example.com"
        },
        {
          trigger: "count:1m(error) > 10 $tier='backend'",
          alertAddress: "backend-team@example.com, ops-team@example.com"
        }
      ]
    }

Any alert which does not specify an alertAddress will default to the address specified at the top of the file or the
login address for your account. You can also divide alerts up into separate groups, and give each group its own ``alertAddress``:

    {
      alerts: [
        // Frontend alerts
        {
          alertAddress: "frontend-team@example.com",
          alerts: [
            {
              trigger: "count:1m(error) > 10 $tier='frontend'"
            },
            {
              ...more alerts...
            }
          ]
        },
        // Backend alerts
        {
          alertAddress: "backend-team@example.com",
          alerts: [
            {
              trigger: "count:1m(error) > 10 $tier='backend'"
            },
            {
              ...more alerts...
            }
          ]
        }
      ]
    }


pagerduty: <PagerDuty Integration>
## PagerDuty Integration

You can use PagerDuty to deliver Scalyr alert notices. Simply create a "Generic API" service in PagerDuty. In your Scalyr
alert configuration, enter an ``alertAddress`` of the following form:

    pagerduty:XXXXX

XXXXX is the "Service API Key" for your Generic API service.

For detailed instructions on setting up PagerDuty integration, see [Alert Using PagerDuty](/solutions/pagerduty).


opsgenie: <OpsGenie Integration>
## OpsGenie Integration

You can use OpsGenie to deliver Scalyr alert notices. Create a Scalyr integration at
https://www.opsgenie.com/integration, and use the resulting API key in the ``alertAddress``:

    opsgenie:XXXXX

XXXXX is the API key generated on the OpsGenie integrations page.

For detailed instructions on setting up OpsGenie integration, see [Alert Using OpsGenie](/solutions/opsgenie).

victorops: <VictorOps Integration>
## VictorOps Integration

You can use VictorOps to deliver Scalyr alert notices. In your Scalyr alert configuration, enter an ``alertAddress`` of
the following form:

    alertAddress: "***victorops:webhookUrl=https://alert.victorops.com/integrations/generic/20131114/alert/$api_key/$routing_key***"

The URL is obtained by logging into

``VictorOps > Settings > Alert Behavior > Integrations > REST``. See [Alert Using VictorOps](/solutions/victorops) for details.

slack: <Slack Integration>
## Slack Integration

You can use Slack to deliver Scalyr alert notices. In your Scalyr alert configuration, enter an ``alertAddress`` of
the following form:

    alertAddress: "***slack:webhookUrl=https://hooks.slack.com/services/INTEGRATION_PATH***"

INTEGRATION_PATH is obtained in the Slack integration settings. See [Alert Using Slack](/solutions/slack) for details.


webhook: <Webhook Integration>
## Webhook Integration

You can deliver Scalyr alert notices to any third-party service that accepts notifications via a GET, PUT, or POST
HTTP request. In your Scalyr alert configuration, enter an ``alertAddress`` in one of the following forms:

    webhook-trigger:GET URL
    webhook-resolve:GET URL

    webhook-trigger:PUT URL[[BODY]]
    webhook-resolve:PUT URL[[BODY]]

    webhook-trigger:POST URL[[BODY]]
    webhook-resolve:POST URL[[BODY]]

URL is a complete address beginning with "http://" or "https://", and BODY is the body of the HTTP request. For
PUT and POST requests, you can optionally specify a Content-Type, as follows:

    webhook-trigger:PUT https://api.example.com/operation[[{"foo": true}]]&content-type=application/json

A webhook-trigger recipient will be notified whenever an alert triggers (i.e. when the alert condition becomes
true). A webhook-resolve recipient will be notified when an alert resolves (the alert condition becomes false). You
will generally want to specify both webhook-trigger and webhook-resolve recipients. A complete example:

    alertAddress:
        "webhook-trigger:GET https://api.example.com/notify-alert?message=alert%20#title#%20triggering"
      + ","
      + "webhook-resolve:GET https://api.example.com/notify-resolved?message=alert%20#title#%20resolved"

### Substitution Tokens

You can embed tokens in a webhook URL or body, which will be replaced by information about the alert. The following
tokens are supported:

|||  Token             |||   Replaced by
|||  ``#trigger#``     |||   The trigger expression that determines when the alert fires.
|||  ``#description#`` |||   The description you've specified for the alert. If absent, the trigger expression is used.
|||  ``#title#``       |||   The first line of the description.
|||  ``#link#``        |||   A link to the alert.
|||  ``#id#``          |||   A short token identifying the alert.

Any other use of # is left alone. In particular, if your webhook contains a sequence like ``#foo#``, it will be left unchanged.


logging: <Alert Logging>
## Alert Logging

Scalyr generates three kinds of log records which you can use to review your alert history:

**Alert state** records are generated every 60 seconds, and indicate whether the alert condition is met
([sample query](/events?filter=tag%3D%27alertState%27[[[emitAddlParamTeamTokenIfPhoenix]]])). Each
record has the following fields:

|||  Field            |||   Value
|||  ``tag``          |||   ``alertState``
|||  ``state``        |||   2 if the alert condition is met (i.e. the alert is triggered), 1 otherwise
|||  ``trigger``      |||   The alert's trigger condition
|||  ``description``  |||   The alert's description

An **alert notification** record ([sample query](/events?filter=tag%3D%27alertNotification%27[[[emitAddlParamTeamTokenIfPhoenix]]])) is generated whenever Scalyr
sends an "alert triggered" or "alert resolved" message:

|||  Field                  |||   Value 
|||  ``tag``                |||   ``alertNotification`` 
|||  ``newState``           |||   2 if the alert condition is met (i.e. the alert is triggered), \
                                  1 otherwise  
|||  ``trigger``            |||   The alert's trigger condition
|||  ``description``        |||   The alert's description 
|||  ``isRenotification``   |||   True for a repeated notification of an alert that has been triggered for a long time, false otherwise 

A **state change** record ([sample query](/events?filter=tag%3D%27alertStateChange%27[[[emitAddlParamTeamTokenIfPhoenix]]])) is generated when an alert's state
changes between "triggered" and "not triggered":

|||  Field             |||   Value
|||  ``tag``           |||   ``alertStateChange``
|||  ``newState``      |||   2 if the alert condition is met (i.e. the alert is triggered), 1 otherwise
|||  ``trigger``       |||   The alert's trigger condition
|||  ``description``   |||   The alert's description

``alertNotification`` and ``alertStateChange`` records are similar. An ``alertStateChange`` record is generated immediately when
the alert's state changes. If the alert has a grace period, then the ``alertNotification`` record may be delayed or
omitted. Each reminder generates an additional ``alertNotification`` record, but not an ``alertStateChange`` record.

If you're using [alert templates](#alertTemplates), then the template parameters will be included as additional fields in
each log record.
