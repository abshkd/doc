---
title: "Configuration"
weight: 50
break: true
---

## Configuration Files

Many Scalyr features involve some level of customization. You can design your own dashboards, create
custom alert rules, and so forth.

Most of this customization is done via configuration files. You don't always have to edit configuration
files directly. For instance, you can create alerts using the Save Search -> As Alert option in the graph view,
and manage alerts from the alert overview page, without ever seeing a configuration file. But behind
the scenes, your customizations are represented in configuration files.

From time to time, you may want to edit configuration files directly. Some advanced features can
only be accessed this way. In other situations, the editing the configuration file may be a
matter of convenience; you can quickly change multiple settings, or even use copy and paste to
clone a dashboard or a set of alerts for tweaking. You may also want to back up your configuration,
something that is not possible using conventional web-based tools.

You can access configuration files via the Scalyr web site, as well as the [HTTP API](/help/api),
[Java API](/help/java-api), and [command line](/help/command-line). 
Many configuration files are linked from the pages they control. For instance, the alert overview page 
has an "Edit Alerts" link which leads to the alerts configuration file; dashboards have a similar 
"Edit Dashboard" link. To list all of your configuration files, open the Settings menu in the navigation 
bar, and choose "Configuration". Then click on any file name to view or edit that file.

You may see the following files listed:

Name                         | Use
---|---
/dashboards/Foo              | Defines the "Foo" dashboard. There may be any number of dashboard files. Note that some dashboards, like System, are built in to the                                       Scalyr service and won't be listed here. If you customize a built-in                                       dashboard, your customized version will appear in the list.
/example                     | A simple example file, created automatically when you create your account.
/logParsers/foo              | Rules for parsing log files tagged with ``parser: foo``. There may be any                                       number of parser files. Note that some parsers, like webAccess, are built                                       in to the Sclyr service and won't be listed here. If you customize a                                       built-in parser, your customized version will appear in the list.
/datatables/foo              | A data table for use with the ``lookup`` command in a PowerQuery.                                       See [Lookup Command](/help/power-queries#lookup).
/scalyr/alerts               | Lists all [alerting rules](/help/alerts).
/scalyr/searches             | Lists all [shared searches](/help/saved-searches#shared).
/scalyr/logs                 | Can be used to give additional users permission to access                                       your account (see [Multiple Users](/help/users)), or to set up linking                                       from search results (see [View Logs](/help/view)).
/scalyr/monitors             | Lists all [HTTP monitors](/help/monitors).
/foo_example.com/searches   | Lists all personal [saved searches](/help/saved-searches).


## Scalyr JSON 

Scalyr configuration files are all expressed in JSON. For convenience and readability, we support
several extensions to the standard JSON format. Most of these extensions are part of standard
JavaScript, and were omitted from the JSON standard only to simplify parsing. The only Scalyr
extension that is not part of standard JavaScript is comma inference.

Scalyr JSON is supported in configuration files (including the Scalyr Agent's configuration file,
which resides on the server where the agent is installed). It is not guaranteed to be supported in
other uses of JSON at Scalyr, such as API request bodies. Scalyr API responses are standard JSON;
you can use a standard JSON parser for working with Scalyr APIs.

Scalyr's JSON extensions for configuration files are as follows:

- **Comments**. Both // and /*...*/ comments are supported. 
- **Optional quoting on field names**. In an object literal, the double-quotes around field
  names can be omitted (if the field name is a valid JavaScript identifier).  
- **String concatenation**. String constants can be split into several sections, joined by
  the + operator. 
- **Trailing commas**. An object or array may end with a trailing comma. 
- **Comma inference**. If you omit a comma in an object or array, the comma will be inferred,
  so long as a line break is present.

### Example

All of these extensions are illustrated in the following example, except comma inference
(which is covered in the next example):

    {
      /* Default time span to display for this dashboard. This can be overridden
       * on the fly using fields on the dashboard page.
       */
      // duration: "4h",
      
      // One entry per graph to display in this dashboard.
      graphs: [
        // Show free disk space on host1.
        {
          label: "Free disk space",
          facet: "value",
          filter: "source='tcollector' metric='df.1kblocks.free'" +
                    " host='host1'",
        },
        
        // Show CPU usage, broken down into user, system, and iowait time.
        {
          label: "CPU Usage",
          facet: "value",
          plots: [
            {
              label: "user",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='user'"
            }, {
              label: "system",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='system'"
            }, {
              label: "I/O",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='iowait'"
            }
          ]
        }
      ]
    }

### Comma Inference Examples

Standard JSON:

    {"x": 1, "y": 2}  // has comma
    [1, 2]            // has comma

Nonstandard JSON, but accepted in Scalyr configuration files:

    {
      "x": 1  // comma inferred at line break
      "y": 2
    }
     
    [1  // comma inferred at line break
    2]

Incorrect JSON, not accepted in Scalyr configuration files:

    {
      "x": 1 "y": 2  // missing comma, no line break
    }                
     
    [1 2]            // missing comma, no line break

## Managing Users

Most organizations will have many people who need to access server data from time to time. In smaller
organizations, you can always share a single login; however, for larger organizaions, you might want 
to create a separate login for each user. (Multiple logins are also available during your free trial.)

Each Scalyr account has a master identity, tied to the e-mail address and password that were originally
used to create the account. You can associate additional users with an account. These additional users
can be added or removed at any time.

For each user, you can grant complete access, or restrict their access to specific servers, logs, or message
types. You can also organize users into groups for easier management.

To add or remove users from your team, go to the [User Accounts](/userAccounts[[[emitSoleParamTeamTokenIfPhoenix]]]) page.


## User Permissions

For each user, you can specify one of the following permission levels:

Name              | Meaning
---|---
full              | Complete access, except for a few administrative operations (such as billing changes).
readLog           | Can view all data (dashboards, graphs, search, raw metrics and logs, etc.). Can't edit dashboards, alerts, or other configuration, and can't access API tokens.
limited           | Access only to specific dashboards and log/metric data, as specified by the ``allowedDashboards`` and ``allowedSearch`` fields (see next section).

You specify a user's permissions when adding them to your team. Once you've added a user to your team, you can
change their permissions by editing the configuration file (see [Configuration File](#syntax), below).


## Restricted Data Access

You can use the ``limited`` permission to limit a user to accessing data from specific servers, logs, and message
types. A user with ``limited`` permission can only access data in two ways:

1. They can view any dashboards listed in the ``allowedDashboards`` field of their user record.

2. They can search for any data that matches the filter specified in the ``allowedSearch`` field of their user
record. Here are some examples.

    allowedSearch: "$serverHost contains 'backend'"

The user will be able to view all log and metrics data from servers whose hostname contains the substring "backend".

    allowedSearch: "$logfile = '/var/log/access_log' || $logfile = '/var/log/error_log'"

The user will be able to view ``/var/log/access_log`` and ``/var/log/error_log`` from any server.

    allowedSearch: "severity >= 4"

The user will be able to view log messages with severity WARNING and higher.

    allowedSearch: "($serverHost contains 'backend') && unicorn"

The user will be able to view log messages that contain the word "unicorn", but only from servers whose hostname
contains the substring "backend".

You can use the full [Scalyr query language](/help/query-language) to specify which 
events a user can view. In particular, you can use parenthesis, &&, and || operators.

In the allowedSearch field, if your search expression involves a Windows pathname with backslashes, you'll need to
write each backslash twice times (when using the User Accounts page) or four times (when directly editing the
configuration file). Here's an example showing each backslash written four times:

    allowedSearch: "$serverHost='HOST1' AND $logfile='C:\\\\ProgramData\\\\Some Application\\\\log.txt'"

The configuration file parser removes one level of backslashes, and then the search expression parser removes another
level, turning four backslashes into one.


## Configuration File

User accounts and permissions are listed in the [/scalyr/logs](/file?path=/scalyr/logs[[[emitAddlParamTeamTokenIfPhoenix]]]) 
configuration file. You can use the [User Accounts](/userAccounts[[[emitSoleParamTeamTokenIfPhoenix]]]) page to add or 
remove users without ever touching the configuration file. To
change a user's permissions, or use group permissions, you'll edit the file directly.

The configuration file contains a ``users`` section, which looks something like this:

    {
      ...
      
      users: [
        { email: "user1@example.com", permissions: "full"},
        { email: "user2@example.com", permissions: "readLog"},
        { email: "user3@example.com", permissions: "readLog"},
        {
          email: "user4@example.com",
          permissions: "limited",
          allowedDashboards: ["System", "WebServer"],
          allowedSearch: "$serverHost='server1.example.com'"
        }
      ]
    }


## Groups

If you have multiple users who need access to the same data, you can use a group to avoid spelling out the data access
over and over again. A group has access to a specified set of data, and each user can belong to any number of
groups. Here is a sample configuration file using groups:

    {
      ...

      users: [
        { email: "user1@example.com", permissions: "full"},
        { email: "user2@example.com", permissions: "readLog"},
        { email: "user3@example.com", permissions: "readLog"},
        {
          email: "user4@example.com",
          permissions: "limited",
          groups: ["Customer Service"]
        },
        {
          email: "user4@example.com",
          permissions: "limited",
          allowedDashboards: ["Database Health"],
          allowedSearch: "$serverHost='staging-db.example.com'",
          groups: ["Unicorn Team"]
        }
      ],

      groups: [
        {
          name: "Unicorn Team",
          permissions: "limited", // optional, defaults to "limited"
          allowedDashboards: ["System", "WebServer", "Unicorn Frontend", "Unicorn Backend"],
          allowedSearch: "$serverHost contains 'unicorn'"
        },

        {
          name: "Customer Service",
          allowedDashboards: ["WebServer"],
          allowedSearch: "$logfile = '/var/log/access_log' $serverHost contains 'frontend'"
        }
      ]
    }

A user can access all events or dashboards specified in their user record, as well as all events or dashboards
associated with the groups they belong to.



## Audit Trail

For security, Scalyr provides an [[[auditTrailLink]]] recording all activity in your account. Click the
link to see all page views, configuration changes, and other activity. The audit trail shows what page was
viewed or action taken, which user performed the action, the source IP address, and other data

All of Scalyr's standard log management tools apply to the audit trail, so you can search, filter by user or action,
or even build alerts and dashboard graphs around audit trail data. For instance, to view actions by a particular user,
click the "Refine search by" button, choose "user" from the dropdown list, and click the e-mail address of the user.
(If only one user has accessed the site during the time period you're looking at, the user field won't be listed.
Edit the Start and End fields to view a larger time range.)

The audit trail provides detailed information regarding each action, but the specific format is subject to change, and
currently is not easy to read. As in all matters, we welcome your feedback.

Note that the audit trail is visible to all users on your account, including users with read-only access. 
