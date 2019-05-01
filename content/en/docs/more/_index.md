---
title: "More Data Sources"
weight: 22
---


<style>
div.logo-cloud img {
  filter: saturate(0.75);
  max-height:75px;
}

div.logo-cloud a {
  display: inline-block;
  text-align: center;
  text-decoration: none;
  padding: 8px !important;
  margin: 8px !important;
  padding-bottom: 16px;
  border: 1px solid #ddd !important;
  border-radius: 5px;
  height: 110px;
  width: 130px;
}

div.logo-cloud a span {
    font-weight: bold;
    font-size: 14px;
    color: #4a5176;  
  text-transform: uppercase;
}

div.logo-cloud {
    margin-bottom: 20px
}
</style>

<div class="logo-cloud">
  <a href="/help/monitors/apache">
        <img src="https://www.scalyr.com/s2/src/img/logo-apache.png"/><br/>
        <span>Apache</span>
    </a>
  <a href="/help/monitors/docker-monitor">
        <img src="https://www.scalyr.com/s2/src/img/logo-docker.png"/><br/>
        <span>Docker</span>
    </a>
  <a href="/help/data-sources#graphite">
        <img src="https://www.scalyr.com/s2/src/img/logo-graphite.png"/><br/>
        <span>Graphite</span>
    </a>
  <a href="/help/data-sources#heroku">
        <img src="https://www.scalyr.com/s2/src/img/logo-heroku.png"/><br/>
        <span>Heroku</span>
    </a>
  <a href="/help/monitors/url">
        <img src="https://www.scalyr.com/s2/src/img/logo-http.png"/><br/>
        <span>HTTP</span>
    </a>
  <a href="/help/monitors/linux-system-metrics">
        <img src="https://www.scalyr.com/s2/src/img/logo-linux.png"/><br/>
        <span>Linux</span>
    </a>
  <a href="/help/monitors/mysql">
        <img src="https://www.scalyr.com/s2/src/img/logo-mysql.png"/><br/>
        <span>MySQL</span>
    </a>
  <a href="/help/monitors/nginx">
        <img src="https://www.scalyr.com/s2/src/img/logo-nginx.png"/><br/>
        <span>NGINX</span>
    </a>
  <a href="/help/monitors/postgres">
        <img src="https://www.scalyr.com/s2/src/img/logo-postgres.png"/><br/>
        <span>Postgres</span>
    </a>
  <a href="/help/monitors/redis-monitor">
        <img src="https://www.scalyr.com/s2/src/img/logo-redis.png"/><br/>
        <span>Redis</span>
    </a>
  <a href="/help/monitors/snmp">
        <img src="https://www.scalyr.com/s2/src/img/logo-snmp.png"/><br/>
        <span>SNMP</span>
    </a>
  <a href="/help/monitors/syslog-monitor">
        <img src="https://www.scalyr.com/s2/src/img/logo-syslog.png"/><br/>
        <span>Syslog</span>
    </a>
  <a href="/help/monitors/windows-system-metrics">
        <img src="https://www.scalyr.com/s2/src/img/logo-windows.png"/><br/>
        <span>Windows</span>
    </a>
</div>

The Scalyr service is designed to let you work with all of your monitoring data -- not just logs or system metrics --
in one place. This page lists all of the ways in which you can get data into Scalyr. Note that all options
use secure encryption and realtime data streaming, so your data is always fresh and secure.

- **System metrics** are automatically uploaded when you install the [Scalyr Agent](/help/scalyr-agent).

- **Log files** are also covered in the Scalyr Agent installation instructions. You can upload web access logs,
  system logs, app server logs, and more.

- If you use **MySQL**, **PostgreSQL**, **Apache**, or **nginx**, install the corresponding [Scalyr Agent Plugin](/help/agent-plugins) to
  gather performance and usage data.

- The agent can also provide **Process metrics** (per-process resource usage). See the
  [Linux Process Metrics](/help/monitors/linux-process-metrics) page for instructions.

- If you use **Amazon Web Services**, you can import [CloudWatch metrics](/solutions/import-cloudwatch),
  [CloudTrail logs](/solutions/import-cloudtrail), 
  [CloudFront logs](/solutions/import-cloudfront),
  [CloudWatch logs](https://github.com/scalyr/cloudwatch2scalyr),
  [ELB access logs](/solutions/import-elb-access-logs), 
  [S3 bucket access logs](/solutions/import-s3-bucket-logs),
  [Redshift audit logs](/solutions/import-redshift-logs), 
  [EC2 spot instance data feeds](/solutions/import-spot-instance-data),
  [other log files in S3](/solutions/import-logs-from-s3), and 
  [RDS database logs](/solutions/import-rds-logs) (e.g. slow query logs).

- **Heroku** and **AppHarbor** users can import logs securely using a [Logplex drain](#heroku).

- For **Graphite** based tools, the Scalyr Agent can masquerade as a Graphite server. See the [Graphite Relay](#graphite)
  section for instructions.

- For applications or devices that use **Syslog** to transmit logs, the [Scalyr Agent can act as a Syslog server](#syslog).

- Use the HTTP-based [Scalyr API](/help/api) or our [Java API](/help/java-api) 
  to build your own custom integrations.  From Java, we also provide a [logback](http://logback.qos.ch/) appender, 
  allowing any log4j or logback-based code to send logs directly to Scalyr. See https://github.com/scalyr/scalyr-logback 
  for instructions.

- To log structured data directly from .NET applications, you can also use [Serilog](https://serilog.net/) in
  conjunction with the [Scalyr sink](https://www.nuget.org/packages/Serilog.Sinks.Scalyr).

syslog: <Syslog>
### Syslog

Due to the difficulties of securing Syslog across networks, Scalyr does not accept Syslog directly from customers.
Instead, we recommend running an instance of the Scalyr Agent to accept Syslog traffic within your local network.
The Scalyr Agent can be configured to act as a Syslog server, accepting connections from other hosts.  You may
either run an instance of the Scalyr Agent on each host (preferred) or one instance for all of your hosts.

To use the Scalyr Agent to collect your logs via Syslog, please:

- Follow the [agent installation](/help/install-agent-linux) instructions to install the Scalyr Agent on a host (or hosts) in your network.

- Configure the [Scalyr Agent as a Syslog server](/help/monitors/syslog-monitor).  Remember, if your Scalyr
Agent will be accepting Syslog traffic from other hosts, you must set ``accept_remote_connections`` to ``true``.

- Configure your servers to send logs to the Scalyr Agent via Syslog.  The exact configuration depends on your
particular Linux distribution.  For example, in Ubuntu, you need to edit the file in ``/etc/rsyslog.d/50-default.conf``
to include the following line:

    *.warn                         @<ip of agent>:514

Where, ``<ip of agent>`` is replaced with the IP address of the host running the Scalyr Agent.  This will forward
all messages of ``warning`` severity level or higher to the Scalyr Agent.  You will also need to execute
``sudo service rsyslog restart`` for the changes to take affect.

heroku: <Heroku and AppHarbor>
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

### Multiple applications

If you have multiple applications, you can include "host", "logfile", and/or "parser" parameters in the logplex URL.
The first two parameters specify the hostname and log file name under whch your logs will appear on Scalyr's
Overview page. The parser parameter identifies the log format; with Heroku, you can usually omit this parameter
and accept the default ("heroku-logplex").


graphite: <Graphite>
## Graphite Relay

Graphite is an open-source system for storing and graphing timeseries data. The Scalyr Agent can masquerade as a Graphite
server, acting as a relay to the Scalyr service. This allows you to use Scalyr with any tool that reports metrics using the
Graphite network protocol.

To begin with, follow the [agent installation](/help/install-agent-linux) instructions 
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