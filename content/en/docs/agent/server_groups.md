---
title: "Manage Groups of Servers"
---

This guide describes how to organize your servers into groups. Use server groups to aggregate logs
for searching, generate graphs or trigger alerts based on the behavior of multiple servers, and more.


## Before You Start

1. The Scalyr Agent should be installed on each server you want to monitor.

To verify:

- In the navigation bar, click {{menuRef:Overview}}.
- Find each server in the list at the bottom of the page.

If any server is not listed:

- If you have not installed the agent on that server, follow the [Agent Installation](/docs/getting_started/agent_linux) guide.
- If you have already installed the agent, consult the [Agent Troubleshooting](/help/scalyr-agent#troubleshooting) guide.


## Steps

1. Decide how you want to organize your servers. You might choose to group them by tier (e.g. frontend,
application server, database), data center, purpose (e.g. staging, production), or other criteria. You can
invent any groups you like, and a server can belong to any number of groups.

2. Choose a name for each type of category. These names should be simple identifiers (no spaces or
punctuation). For instance, "tier", "stage", and "datacenter".

3. On each server, open the Scalyr Agent configuration file (``[agent.json](/help/scalyr-agent#configuration)``) and
find the ``server_attributes`` section. Edit it to specify each category for this server. The result might
look something like this:

    server_attributes: {
      tier: "frontend",
      stage: "production",
      datacenter: "us-east-1c"
    },

Remember that you can define whatever fields you like; "tier", "stage", and "datacenter" are just examples.

By default, Scalyr will associate all log messages with the server's hostname. If you are running in an
environment where the hostname is not stable or meaningful, such as an auto-scaling or PaaS platform,
you can override the hostname by adding a "serverHost" field to the server attributes:

    server_attributes: {
      ***serverHost: "frontend-1",***
      tier: "frontend",
      stage: "production",
      datacenter: "us-east-1c"
    },

Whatever value you specify for ``serverHost`` will be used as the hostname.

4. To verify that your changes have taken effect, click {{menuRef:Overview}} in the navigation bar. For
each server, move the mouse over the server name and pause for a moment (without clicking). The fields for
that server should appear; verify that they are correct.

5. To use a server group in a search, add a term to the {{menuRef:Expression}} box in the search
form. For instance, the following expression will search for the phrase "deadline exceeded" in all logs from
all servers in the application tier:

    "deadline exceeded" $tier='appserver'

Make sure to remove any ``$serverHost`` term from the search expression, as that would restrict the
search to a single server.

**Note**: server fields apply only to logs recorded after you update the agent configuration. So when you
search based on a server field (group), you won't see logs from before you assigned the group to a given
server.

7. To graph data from a server group, first generate a graph against your entire data set, and then add a
term as in the previous step. For example, If you use the Paths dashboard to display a graph of all requests
for the URL "/home", you would wind up with the following expression:

    (dataset='accesslog') $uriPath="/getFile"

To restrict the graph to a particular server group, add a term such as this one:

    (dataset='accesslog') $uriPath="/getFile" ***$datacenter='us-east-1a'***

As in the previous step, make sure to remove any ``$serverHost`` term from the expression.

8. To use a server group in an alert, add a similar term to the alert expression. If you are creating an
alert using the {{menuRef:Save Search}} button on the search or graph page, make sure you've first edited the
search expression as in the previous steps. If you're editing the alerts configuration file directly,
include the appropriate term in the alert's ``trigger`` expression.


## Further Reading

Events, fields, and server fields are discussed in the [Getting Started](/help/getting-started) guide.
You can learn more about search expressions in the [Query Language](/help/query-language) reference.
