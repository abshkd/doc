---
title: "Manage Users"
---

# Manage Users

Most organizations will have many people who need to access server data from time to time. In smaller
organizations, you can always share a single login; however, for larger organizaions, you might want 
to create a separate login for each user. (Multiple logins are also available during your free trial.)

Each Scalyr account has a master identity, tied to the e-mail address and password that were originally
used to create the account. You can associate additional users with an account. These additional users
can be added or removed at any time.

For each user, you can grant complete access, or restrict their access to specific servers, logs, or message
types. You can also organize users into groups for easier management.

To add or remove users from your team, go to the [User Accounts](/userAccounts[[[emitSoleParamTeamTokenIfPhoenix]]]) page.


permissions: <Permissions>
## Permissions

For each user, you can specify one of the following permission levels:

|||# Name              ||| Meaning
|||# full              ||| Complete access, except for a few administrative operations (such as billing changes).
|||# readLog           ||| Can view all data (dashboards, graphs, search, raw metrics and logs, etc.). Can't \
                           edit dashboards, alerts, or other configuration, and can't access API tokens.
|||# limited           ||| Access only to specific dashboards and log/metric data, as specified by the \
                           ``allowedDashboards`` and ``allowedSearch`` fields (see next section).

You specify a user's permissions when adding them to your team. Once you've added a user to your team, you can
change their permissions by editing the configuration file (see [Configuration File](#syntax), below).


dataAccess: <Restricted Data Access>
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


syntax: <Configuration File>
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


groups: <Groups>
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


audit: <Audit Trail>
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
