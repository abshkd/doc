---
title: "Other Logs & Metrics"
weight: 21
notoc: true
---

These data sources are all available to Scalyr via Agent Plugins:


<div class="logo-cloud">
  <a href="/help/monitors/apache">
        <img src="/img/logo-apache.png"/><br/>
        <span>Apache</span>
    </a>
  <a href="/help/monitors/docker-monitor">
        <img src="/img/logo-docker.png"/><br/>
        <span>Docker</span>
    </a>
  <a href="/help/monitors/url">
        <img src="/img/logo-http.png"/><br/>
        <span>HTTP</span>
    </a>
  <a href="/help/monitors/linux-system-metrics">
        <img src="/img/logo-linux.png"/><br/>
        <span>Linux</span>
    </a>
  <a href="/help/monitors/mysql">
        <img src="/img/logo-mysql.png"/><br/>
        <span>MySQL</span>
    </a>
  <a href="/help/monitors/nginx">
        <img src="/img/logo-nginx.png"/><br/>
        <span>NGINX</span>
    </a>
  <a href="/help/monitors/postgres">
        <img src="/img/logo-postgres.png"/><br/>
        <span>Postgres</span>
    </a>
  <a href="/help/monitors/redis-monitor">
        <img src="/img/logo-redis.png"/><br/>
        <span>Redis</span>
    </a>
  <a href="/help/monitors/snmp">
        <img src="/img/logo-snmp.png"/><br/>
        <span>SNMP</span>
    </a>
  <a href="/help/monitors/windows-system-metrics">
        <img src="/img/logo-windows.png"/><br/>
        <span>Windows</span>
    </a>
</div>

## More Data Sources

<style>
thead>tr {display:none}
</style>

Besides plugins, there are a few other data sources that are configured differently:


|  |  |  |  |
|:---:|----|-------|-----------------|
| <img src="/img/logo-graphite.png" style="height: 24px" align="absmiddle"/>| Graphite | set up the agent to act as a Graphite server | [see below](#graphite) |
| <img src="/img/logo-heroku.png" style="height: 24px" align="absmiddle"/>| Heroku / AppHarbor | create a Heroku drain to import securely | [see below](#heroku-and-appharbor) |
| <img src="/img/logo-syslog.png" style="height: 24px" align="absmiddle"/>| Syslog | set up the agent to act as a Syslog server | [see below](#syslog) | 
| <img src="/img/logo-log4j.png" style="height: 24px" align="absmiddle"/>| log4j | use log4j to send logs directly to Scalyr | [Logback Appender](https://github.com/scalyr/scalyr-logback) |
| <img src="/img/logo-dotnet.png" style="height: 24px" align="absmiddle"/>| .NET | log structured data from .NET applications | [Serilog](https://serilog.net/),  [Scalyr sink](https://www.nuget.org/packages/Serilog.Sinks.Scalyr) | 
| <img src="/img/logo-s3-bucket.png" style="height: 24px" align="absmiddle"/>|   S3 bucket | use a monitor to pull in logs | [Import Logs via S3 Buckets](/docs/aws/s3_logs/) |

### Custom Integrations
Use the HTTP-based [Scalyr API](/help/api) or our [Java API](/help/java-api) 
  to build your own custom integrations.  

## Syslog

Due to the difficulties of securing Syslog across networks, Scalyr does not accept Syslog traffic directly.
Instead, we recommend running an instance of the Scalyr Agent to accept Syslog traffic within your local network.
The Scalyr Agent can be configured to act as a Syslog server, accepting connections from other hosts.  You may
either run an instance of the Scalyr Agent on each host (preferred) or one instance for all of your hosts.

To use the Scalyr Agent to collect your logs via Syslog, please:

- Follow the [agent installation](/docs/getting_started/agent_linux) instructions to install the Scalyr Agent on a host (or hosts) in your network.

- Configure the [Scalyr Agent as a Syslog server](/help/monitors/syslog-monitor).  Remember, if your Scalyr
Agent will be accepting Syslog traffic from other hosts, you must set ``accept_remote_connections`` to ``true``.

- Configure your servers to send logs to the Scalyr Agent via Syslog.  The exact configuration depends on your
particular Linux distribution.  For example, in Ubuntu, you need to edit the file in ``/etc/rsyslog.d/50-default.conf``
to include the following line:

    *.warn                         @<ip of agent>:514

Where, ``<ip of agent>`` is replaced with the IP address of the host running the Scalyr Agent.  This will forward
all messages of ``warning`` severity level or higher to the Scalyr Agent.  You will also need to execute
``sudo service rsyslog restart`` for the changes to take affect.


## Heroku and AppHarbor

Importing logs from a Heroku application is quick and easy. Simply type the following command on a system where
you have the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed:

    heroku drains:add 'https://[[[logsUploadHost]]]/api/logplex?host=APPNAME&token=[[[writeLogsToken]]]' -a APPNAME

For ``APPNAME``, use the name of your Heroku application. Note that APPNAME appears in two places in the command.

This creates a Heroku "log drain" telling Heroku to deliver log messages to Scalyr. You can list drains by typing
``heroku drains``. To remove a drain, enter the same command you used to add it, but with ``drains:add`` changed
to ``drains:remove``.

If you're using AppHarbor, configure it to send logs via LogPlex to this URL:

    https://[[[logsUploadHost]]]/api/logplex?token=[[[writeLogsToken]]]&host=AppHarbor&logfile=logplex&parser=AppHarbor

Your logs should begin appearing in Scalyr within seconds. Refresh the [Overview](/logStart[[[emitSoleParamTeamTokenIfPhoenix]]]) 
page, and look for a server named "heroku".

If you have multiple applications, you can include "host", "logfile", and/or "parser" parameters in the logplex URL.
The first two parameters specify the hostname and log file name under whch your logs will appear on Scalyr's
Overview page. The parser parameter identifies the log format; with Heroku, you can usually omit this parameter
and accept the default ("heroku-logplex").



## Graphite

Follow the [agent installation](/docs/getting_started/agent_linux) instructions 
to install the Scalyr Agent. It's generally best to install the agent on each server you want to monitor, so that it can 
provide system metrics and log files, and so that the Graphite data will automatically be tagged as having come from 
that server.

Then go to the [Graphite Monitor](/help/monitors/graphite) page for instructions on 
enabling Graphite support in the Scalyr Agent.


### Data Representation

The Scalyr Agent converts Graphite and OpenTSDB measurements into the Scalyr data model. Consider the
following Graphite value:

       requests.500.host1 1.03 123456789

This is converted into a Scalyr event with the following fields:

      path      = requests.500.host1
      value     = 1.03
      timestamp = 123456789
      path1     = requests
      path2     = 500
      path3     = host1

The first three fields are a direct representation of the Graphite data. The pathN fields break down the
path into components, enabling flexible queries and aggregation. For instance, the search ``path1='requests'
path3='host1'`` will match all requests on host1.

An OpenTSDB data point looks like this when sent over the network:

    put mysql.bytes_received 1287333217 327810227706 schema=foo host=db1

and is transformed to:

      metric    = mysql.bytes_received
      timestamp = 1287333217
      value     = 327810227706
      schema    = foo
      host      = db1
      path1     = mysql
      path2     = bytes_received


### Generating Graphs

Use the standard [graph page](/help/view#graph) to to view Graphite or OpenTSDB data. 
In the Expression box, enter a search query using the fields described above. Some examples for Graphite data:

``  $source='graphite' path = 'requests.500.host1'      ``(a single metric) ##
``  $source='graphite' path1 = 'requests' path2=500     ``(requests.500.*) ##
``  $source='graphite' path1 = 'requests' path3='host1' ``(requests.*.host1)

And examples for TSDB data:

      $source='tsdb' metric = 'mysql.bytes_received' host='db1'
      $source='tsdb' metric = 'mysql.bytes_received'

The Variable field must be set to one of the following:

- ``value`` graphs the mean reported value. 
- ``function(value)`` applies a function to the reported value. See the
[Graph Functions](/help/query-language#graphFunctions) reference for a full list of available functions.
- ``rate`` graphs the number of data values reported (the rate at which events are sent to
  the relay daemon). 