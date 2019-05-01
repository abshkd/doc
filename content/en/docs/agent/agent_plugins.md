---
title: "Agent Plugins"
---

# Agent Plugins

An *agent monitor plugin* is a component of the Scalyr Agent. This page lists the plugins which are bundled with
the standard Scalyr Agent installation. You can use these plugins to gather data from your servers.

linux-system-metrics: <System Metrics>
[Linux System Metrics](/help/monitors/linux-system-metrics): records CPU consumption, 
memory usage, and other metrics for the server on which the agent is running.

linux-process-metrics: <Process Metrics>
[Linux Process Metrics](/help/monitors/linux-process-metrics): records CPU consumption, 
memory usage, and other metrics for a specified process. Use this plugin to record resource usage for a web server, 
database, or other application.

windows-system-metrics: <Windows System Metrics>
[Windows System Metrics](/help/monitors/windows-system-metrics): records CPU 
consumption, memory usage, and other metrics for the Windows server on which the agent is running.

windows-process-metrics: <Windows Process Metrics>
[Windows Process Metrics](/help/monitors/windows-process-metrics): records CPU 
consumption, memory usage, and other metrics for a specified process on a Windows host. Use this plugin to record 
resource usage for a web server, database, or other application.

windows-event-log: <Windows Event Log>
[Windows Event Log](/help/monitors/windows-event-log-monitor): uploads messages from 
the Windows Event Log.

apache: <Apache>
[Apache Monitor](/help/monitors/apache): records performance and usage data from an 
Apache server.

docker: <Docker>
[Docker Monitor](/help/monitors/docker-monitor): copies the stdout and stderr logs 
from other local containers to Scalyr.

graphite: <Graphite>
[Graphite](/help/monitors/graphite): acts as a Graphite server, allowing you to import 
data from Graphite-compatible tools into Scalyr.

journald: <Journald>
[Journald Monitor](/help/monitors/journald): collects logs from the local journald service and forwards them to Scalyr.

mysql: <MySQL>
[MySQL Monitor](/help/monitors/mysql): records performance and usage data from a MySQL 
server.

nginx: <Nginx>
[Nginx Monitor](/help/monitors/nginx): records performance and usage data from an 
nginx server.

postgres: <PostgreSQL>
[PostgreSQL Monitor](/help/monitors/postgres): records performance and usage data from 
a PostgreSQL server.

redis: <Redis Monitor>
[Redis Monitor](/help/monitors/redis-monitor): uploads messages from a Redis server's 
SLOWLOG.

shell-monitor:<Shell Monitor>
[Shell Monitor](/help/monitors/shell): periodically executes a specified shell command, 
and records the output. It can be used to monitor any information that can be retrieved via a shell command. Shell 
commands are run from the Scalyr Agent, and execute as the same user as the agent.

snmp-monitor: <SNMP Monitor>
[SNMP Monitor](/help/monitors/snmp): polls SNMP-enabled devices on the network and 
records specified values.

syslog-monitor:<Syslog Monitor>
[Syslog Monitor](/help/monitors/syslog-monitor): receives log messages sent via the 
syslog protocol on either local or remote network connections and inserts them into Scalyr.

url-monitor:<URL Monitor>
[URL Monitor](/help/monitors/url): periodically fetches specified HTTP or HTTPS URL, 
and records the response. The URL is retrieved from the agent process, so any host and port reachable from the machine 
on which the agent is running can be monitored.

You can create your own agent plugins. Plugins are written in Python, and can be as simple as a few lines of code.
See the [plugin authoring documentation](/help/creating-a-monitor-plugin) for details.
