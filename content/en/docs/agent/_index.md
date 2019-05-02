---
title: "Scalyr Agent"
weight: 60
beforetoc: "The Scalyr Agent is a daemon you can install on each of your servers to upload logs and system metrics to Scalyr. It requires Python 2.4+, which is present on most servers. In our internal installations, the agent generally uses less than 15 MB RAM and 2% of CPU."
---
 
{{% capture overview %}}

{{% /capture %}}

## Installation 

For standard installation instructions, go to the [Agent Installation](/docs/getting_started/agent_linux) 
page.
 

configuration: <Configuration>
## Configuration 

To configure the Linux agent, edit the following file:

    /etc/scalyr-agent-2/agent.json
    
For Windows, edit this file:

    C:\Program Files (x86)\Scalyr\config\agent.json
    
The agent will notice the new configuration within 30 seconds. There is no need to restart the agent.


hostname: <Customize Host Name>
## Customize Host Name

By default, Scalyr will identify your server by its hostname. If your hostname is something unhelpful
like "ip-12-23-34-45", you can specify a different name by adding a ``serverHost`` field to the
``server_attributes`` section of ``[agent.json](#configuration)``:

    "server_attributes": {
      ***serverHost: "app-server-3",***
      ...
    },

The agent should begin using this new name within 30 seconds. All subsequent events from this server will be listed
under the new name. Older data will still be listed under the old hostname; the old name will disappear from the
Overview page after 24 hours or so.


logUpload: <Uploading Log Files>
## Uploading Log Files 

To upload log files, edit the "logs" section of ``[agent.json](#configuration)``. This section lists
each log file to upload.

    logs: [
       {
         path: "/var/log/httpd/access.log",
         attributes: {parser: "accessLog"}
       },
       {
         path: "/var/log/messages",
         attributes: {parser: "systemLog"}
       }
     ]

This will upload the files ``/var/log/httpd/access.log`` and ``/var/log/httpd/messages``, specifying a parser
for each file. Choose a name that describes the log format, using letters, digits, spaces, hyphens, and underscores.
Later you'll be able to tell Scalyr how to parse the log.

standardParsers:
Scalyr includes a suite of standard log parsers. If your log matches one of the following formats, use the corresponding
parser name and your logs will be parsed automatically.

|||# Parser                    ||| Log format
|||# ``accessLog``             ||| Standard web access logs ("extended" Apache format)
|||# ``mysqlGeneralQueryLog``  ||| MySQL "general" query log
|||# ``mysqlSlowQueryLog``     ||| MySQL slow query log
|||# ``postgresLog``           ||| Postgres log
|||# ``json``                  ||| Logs where each line is a JSON object
|||# ``keyValue``              ||| Logs containing fields in the form key=value or key="value"
|||# ``systemLog``             ||| Supports several common system or error log formats
|||# ``leveldbLog``            ||| LevelDB LOG files

You can specify additional fields in ``attributes``. This allows you to distinguish between different log files
from the same server. For instance, you might give the file a field like ``service: "memcache"`` to identify
the service that generates this log; you could then add ``$service = "memcache"`` to any query to search only your
memcache logs.

You can use standard glob syntax to match multiple log files. ``*`` matches any text within a file or directory name,
and ``?`` matches a single character.  For example, the following
configuration uploads all log files ending with ".log" in the "app" directory:

    logs: [
       {
         path: "/var/log/app/*.log",
         attributes: {parser: "appLog"}
       }
     ]

***Note for Windows***:  For Windows systems, you must escape all backslashes present in any path value.  For example,
to monitor a log file at ``C:\WebServer\logs\access.log``:

    logs: [
       {
         path: "C:\\WebServer\\logs\\access.log",
         attributes: {parser: "appLog"}
       }
     ]

compressing: <Compressing Logs>
## Compressing Logs

To reduce network traffic, potentially saving costs if you're charged for oubtound traffic, you can compress logs that the agent is sending to Scalyr.

To do this, add the following lines to agent.json:

    compressionType: <type>
    
Where <type> is "bz2" or "deflate". (Be sure to use quotes around the value.) We recommend using "bz2".

filter: <Sampling and Redaction>
## Sampling High-Volume Logs

Sometimes, you might not want to upload all messages in a log. For instance, the log might
be cluttered with noisy debugging messages. You can specify sampling rules in the agent configuration
to either subsample certain messages (uploading only a random sample), or exclude them entirely. Each
sampling rule contains a ``match_expression`` field, which is a regular expression, and a ``sampling_rate``
field, which is a fraction between 0 and 1. The agent finds the first match_expression that matches any
portion of the log line, and uses the sampling_rate to decide whether to upload that message.

The following configuration will upload 10% of all messages containing the word "INFO", no messages
containing the word "FINE", and (by default) all messages that don't contain either word:

    logs: [
       {
         path: "/var/log/app/*.log",
         attributes: {parser: "appLog"},
         ***sampling_rules: [***
           ***{ match_expression: "INFO", sampling_rate: 0.1 },***
           ***{ match_expression: "FINE", sampling_rate: 0 }***
         ***]***
       }
     ]

Sampling occurs before the log leaves your server; the lines not included in the samples are not sent to Scalyr.

In a match_expression, if your regular expression requires backslashes, you'll need to write them twice. For example,
the regular expression ``\d{2}`` matches a two-digit number; in a match_expression, you would write ``\\d{2}``. This
is because the configuration file parser removes one level of backslashes.


multiline: <Sampling Multi-line Messages>
## Sampling Multi-line Messages

Sometimes a single logical message will appear as multiple lines of text in the log. For instance,
Java applications often emit multi-line stack traces:

    java.lang.Exception
        at com.foo.bar(bar.java:123)
        at com.foo.baz(baz.java:456)

You can group these multi-line messages into a single message. This allows sampling and redaction rules to apply
to the entire multi-line unit. (Note that it's also possible to group multi-line messages using a
[parsing rule in the Scalyr server](/help/parsing-logs#multiline), but this occurs 
after the agent has performed sampling and redaction.) To group multi-line messages, add a ``lineGroupers`` field to 
the log definition. For example:

    {
      path:"/var/log/tomcat6/catalina.out",
      lineGroupers: [
        {
          start: "^[^\\s]",
          continueThrough: "^[\\s]+at"
        }
      ]
    },

This rule creates a group whenever it sees a line that does not begin with whitespace (the ``start`` expression),
and continuing through any line that begins with whitespace and the word "at" (the ``continueThrough`` expression).
It will match Java stack traces in the format shown earlier.

In general, each lineGrouper has a *_start_* pattern and a *_continuation_* pattern. Whenever a log message containing
the start pattern is observed, subsequent lines are then grouped together with that line according to the continuation
rule.

If you have multiple lineGroupers, they are evaluated in order. The first rule whose start
pattern matches a message, is applied to that message. The continuation pattern is then applied
to subsequent messages from the same log.

Four different types of continuation pattern are supported. Each grouping rule should specify
a start pattern, plus exactly one of the four continuation patterns:

**continueThrough**: all consecutive lines matching this pattern are included in the group.
The first line (the line that matched the start pattern) does not need to match the continueThrough
pattern. This is useful in cases such as a Java stack trace, where some indicator in the line
(such as leading whitespace) indicates that it is an extension of the preceeding line.

**continuePast**: all consecutive lines matching this pattern, plus one additional line, are
included in the group. This is useful in cases where a log message ends with a continuation
marker, such as a backslash, indicating that the following line is part of the same message.

**haltBefore**: all consecutive lines *_not_* matching this pattern are included in the group.
This is useful where a log line contains a marker indicating that it begins a new message.

**haltWith**: all consecutive lines, up to and including the first line matching this pattern,
are included in the group. This is useful where a log line ends with a termination marker,
such as a semicolon.

logExclusion: <Excluding Logs>
## Excluding Logs

Sometimes, a glob pattern alone is not expressive enough to capture the exact logs that should be uploaded to
Scalyr.  Often you are required to specify a more permissive glob pattern that matches more log file names than
desired.  To deal with such cases, you may specify a list of glob patterns in the ``exclude`` field.  Any file that 
matches any exclude pattern from the list will not be sent to Scalyr.

For example, this configuration will copy all log files contained in the directory ``/var/logs/foo``, but not 
any ending in a period and a series of digits (such as ``.1``, ``.2``, typical extensions for rotated logs):

    logs: [
       {
         path: "/var/log/foo/*",
         ***exclude: ["*.[0-9]*"]***
       }
     ]

You may specify more than one exclude glob pattern.


logFileRenaming: <Renaming Log Files>

## Renaming Log Files

You may also wish to rename your log file(s) before they are uploaded to the Scalyr servers.
For example, your server might have a log file in the location ``/var/somespecificdirectoryname/irrelevantdirectory/mylog.log``, 
but you might want to give it a more meaningful name for searching in Scalyr eg. ``/scalyr/access.log`` 

You can accomplish this using the ``rename_logfile`` option. The ``rename_logfile`` can be a string (text), or a JSON object. It specifies the new name to use for the log file when uploading it to Scalyr. You can set this name using predefined variables described below.

### Example: rename_logfile as string

    logs: [
      {
        path: "/var/somespecificdirectoryname/irrelevantdirectory/mylog.log",
        rename_logfile: "/scalyr/access.log"
      }
    ]
      
      
You can use predefined variables that can be used to specify the log file name.

    logs: [
      {
        // To use the same filename but different path, use the $BASENAME variable
        path: "/var/log/somedirectory/bar.log",
        rename_logfile: "/scalyr/$BASENAME"
      }
    ]
    
Or keep the same file name without the file extension:

    logs: [
      {
        // To include the file extension use the BASENAME_NO_EXT variable
        // this will rename the file to /scalyr/bar
        path: "/var/log/somedirectory/bar.log",
        rename_logfile: "/scalyr/$BASENAME_NO_EXT"
      }
    ]
             
You can specify multiple files with wildcards:

    logs: [
      {
        // You can use wildcards too
        path: "/var/log/somedirectory/*.log",
        rename_logfile: "/scalyr/$BASENAME"
      }
    ]
    

A full list of these directives:

||| Variables              ||| Meaning                                                                ||| Example
||| $BASENAME              ||| The file name portion of the log file including the file extension    ||| /scalyr/$BASENAME will upload the file /var/log/foo.log as /scalyr/foo.log   
||| $BASENAME_NO_EXT       ||| The file name portion of the log file excluding the file extension    ||| /scalyr/$BASENAME_NO_EXT will upload the file /var/log/foo.log as /scalyr/foo
||| $PATH[n]               ||| The 'n'th section of the file path                            ||| /scalyr/$PATH1/$BASENAME will upload the file /var/log/foo.log as /scalyr/log/foo.log
                                     

### rename_logfile as JSON object:

This can be used if you want to match a regular expression to file name(s) and replace with a replacement pattern. 
To use this feature, add a JSON object (dictionary) to the ``rename_logfile`` section that has two attributes: ``match`` that 
should match the log file name, and ``replacement`` that should be the replacement pattern.


eg. the following will match all files like ``/var/log/access123.log``, ``/var/log/access9.log`` etc. and upload them as
``/scalyr/access.log``. 

    {
        rename_logfile: {
            match: "/var/log/access([0-9]+).log",
            replacement: "/scalyr/access.log"
        }
    }  
    
or the following will match all files like ``/var/log/access12_httpd.log`` and upload as ``/scalyr/access_httpd.log`` and
match all files like ``/var/log/access5_info.log`` and upload as ``/scalyr/access_info.log`` 

    {
        rename_logfile: {
            match: "/var/log/access([0-9]+)_([a-z]+).log",
            replacement: "/scalyr/access\\1.log"
        }
    }





redaction: <Log Redaction>
## Log Redaction
You can instruct the agent to rewrite or delete certain portions of a log line. This can be
used to redact passwords or other sensitive information. Redaction occurs before the log leaves
your server; redacted text is not sent to Scalyr.

To use this feature, add a "redaction_rules" section. For example:

    logs: [
       {
         path: "/var/log/app/*.log",
         attributes: {parser: "appLog"},
         ***redaction_rules: [***
           ***// Delete all instances of password=...***
           ***{ match_expression: "password=[^& ]*" },***
           
           ***// Replace terms like "userInfo=username password" with "userInfo=username"***
           ***{***
             ***match_expression: "userInfo=([^ ]+) [^ ]+",***
             ***replacement: "userInfo=\\1"***
           ***}***
         ***]***
       }
     ]

In a match_expression, if your regular expression requires backslashes, you'll need to write them twice. For example,
the regular expression ``\d{2}`` matches a two-digit number; in a match_expression, you would write ``\\d{2}``. This
is because the configuration file parser removes one level of backslashes.

**Hashing**:  If you want to substitute the matched expression with its hashed value, you can prefix the ``replacement`` group with ``H`` i.e. in the previous example, change the ``replacement`` to ``userInfo=\\H2``. This will replace the matched expression with the hash of the second matched group i.e. hash of the password. You can optionally set the salt to include with the cryptographic hash. It will look like:


    ***// Replace terms like "userInfo=username password" with "userInfo=md5(password + optional salt E1F53135E559C253)"***
    ***{***
       ***match_expression: "userInfo=([^ ]+) [^ ]+",***
       ***replacement: "userInfo=\\H2",***
       ***hash_salt: "E1F53135E559C253"***
    ***}***

*We currently only support MD5 hashing algorithm.*



varSubstitution: <Variable Substitution>
## Variable substitution in configuration

You can use system environment variables in your configuration file. For example, if you keep your configuration
files in a source code control system and would rather not place your API key directly in the configuration file,
you can instead keep it in an environment variable.

To use variable substitution, you must first list all of the variables you wish to import in a field named
``import_vars``. Then use those variable names, prefixed by ``$``, in string field values. For example:

    {
        import_vars: [ "SCALYR_API_KEY" ],
        
        api_key: "$SCALYR_API_KEY",
        
        ...
    }


plugins: <Agent Plugins>
## Agent Monitor Plugins

The agent provides additional data gathering tools, packaged as "plugins". There are a wide variety of plugins, for
gathering process metrics, performance data from popular software packages such as MySQL, importing data from Graphite-
compatible tools, and many more. See the [Agent Plugins](/help/agent-plugins) page for 
a complete list.

To use an agent plugin, add a clause to the ``monitors`` section of ``[agent.json](#configuration)``. For example,
the following configuration will record process metrics for Tomcat, and will periodically log the Linux kernel version:

    monitors: [
      {
        module:          "scalyr_agent.builtin_monitors.linux_process_metrics",
        id:              "tomcat",
        commandline:     "java.*tomcat6"
      }, {
        module:          "scalyr_agent.builtin_monitors.shell_monitor",
        id:              "kernel-version",
        command:         "uname -r",
        sample_interval: 60
      }
    ]

You can use the same plugin more than once. For instance, you could use two instances of the linux_process_metrics
plugin to record metrics for two different processes.

``sample_interval`` indicates how often data will be collected from that module (the number of seconds between
 collections). It defaults to 30. Note that built-in modules that collect rate information, such as linux_process_metrics,
 may yield odd results if a different sample interval is used.

You can create your own agent plugins. Plugins are written in Python, and can be as simple as a few lines of code.
See the [plugin authoring documentation](/help/creating-a-monitor-plugin) for details.

On Linux systems, two plugins are enabled by default: the linux_system_metrics plugin (to gather basic system
utilization data), and an instance of the linux_process_metrics module to gather resource usage statistics for
the Scalyr Agent itself. If you don't want this data for some reason, you can disable these plugins by setting the
following flags in the agent configuration:

    implicit_metric_monitor: false,
    implicit_agent_process_metrics_monitor: false,

You can also add a flag to turn off the automatic collection of the agent's diagnostic log (``agent.log``):

    implicit_agent_log_collection: false,

This log is low volume, so normally we recommend that you allow it to be collected.

httpProxies: <HTTP proxies>
## HTTP Proxies

The Scalyr Agent can be configured to use an HTTPS proxy if one is required to reach the Scalyr servers from your
infrastructure.  To use a proxy, please add the following to your ``agent.json`` configuration file, replacing the
``https_proxy`` URL with correct one for your infrastructure:

    "use_requests_lib": true,
    "https_proxy": "https://myinteralproxy.awesomecustomer.com:8888"

Note, you only need to configure a proxy for the HTTPS traffic, since all communication between the Scalyr Agent and 
Scalyr is done via HTTPS.  However, if needed for other plugins, you may also configure an HTTP proxy using the
`http_proxy` configuration option similar to `https_proxy` above.

modularConfig: <Modular Configuration>
## Modular Configuration

You can spread your agent configuration across multiple files. This is often convenient when you are using automated
tools to manage your servers. For instance, you could write a script that installs a software package, and also
installs a Scalyr Agent configuration file to monitor that package and gather its logs.

Modular configuration files are stored in a special directory: ``/etc/scalyr-agent-2/agent.d`` on Linux, or
``C:\Program Files (x86)\Scalyr\config\agent.d\`` on Windows. All files in this directory whose names end with ``.json``
will be read.

These additional files can only contain ``monitors``, ``logs``, and ``server_attributes`` sections.
All other options must be specified in the main ``agent.json`` configuration file.

The agent will automatically detect new, modified, or deleted files in ``agent.d``; you don't need to restart it.


agentStatus: <Agent Status>
## Agent Status

The agent can report detailed status information about itself.  This is useful for troubleshooting, e.g. if a log is
not showing up on the Scalyr web site.

On Linux, execute the following command.  Note, you must be running as the same user as the agent (often root):

    sudo scalyr-agent-2 status -v
    
On Windows, execute this command.  You must be running as a user in the Administrators group
and you may be asked to provide credentials:

    scalyr-agent-2.exe status -v

If the agent is running, you should see a detailed report written to stdout. The report will include information about
the agent process, configuration file(s), logs being copied, and monitor plugins. Note that some of the information
applies only to the time period since the agent was last restarted or the agent's configuration was last updated.


agentLogs: <Agent Logs>
## Agent Logs 

For diagnostic purposes, you may sometimes need to look at the agent's own log output.  On Linux systems, the
agent's logs are in this directory:

    /var/log/scalyr-agent-2/logs
    
On Windows systems, the logs directory is:

    C:\Program Files (x86)\Scalyr\logs
   
Most information of interest is in the file ``agent.log``. This log file contains all errors generated by the agent.
This directory also contains log files used for the metrics recorded by the agent as well as any plugins.

upgrades: <Upgrading>
## Upgrading

The latest agent release is [[[agent2Version]]]. To determine which version you're running:

    scalyr-agent-2 version

To upgrade the agent to the latest version, follow the appropriate instructions, according to the method you used
to install the agent.

#### If you installed using yum

    sudo yum update scalyr-agent-2

#### If you installed using apt-get

    sudo apt-get install scalyr-agent-2

#### If you downloaded the RPM or Debian package directly

Get the latest build (see [Package Download](#package-download)) and run one of the following commands:

    sudo rpm -U scalyr-agent-2-[[[agent2Version]]]-1.noarch.rpm      # RPM
    sudo rpm -U scalyr-agent-2-[[[agent2Version]]]-1.alt.noarch.rpm  # RPM for older sytems (CentOS 5, RHEL5)
    sudo dpkg -i scalyr-agent-2_[[[agent2Version]]]_all.deb          # Debian package

#### If you installed by downloading the agent tarball

    wget -q https://www.scalyr.com/scalyr-repo/stable/latest/scalyr-agent-[[[agent2Version]]].tar.gz
    scalyr-agent-2-config --upgrade-tarball scalyr-agent-[[[agent2Version]]].tar.gz

#### On a Windows system

The following command will upgrade to the latest version of the agent. If the agent is already running, it will
restart when the upgrade is complete.

    scalyr-agent-2-config --upgrade-windows


uninstall: <Uninstalling>
## Uninstalling the Agent

To remove the Scalyr Agent from a server, follow the appropriate instructions for your system.

#### If you installed using yum

    sudo yum remove scalyr-agent-2
    sudo yum remove scalyr-repo

#### If you installed using apt-get

    sudo apt-get remove scalyr-agent-2
    sudo apt-get remove scalyr-repo

#### If you installed by downloading the agent tarball

    sudo scalyr-agent-2 stop

and then delete the directory where you unpacked the agent tarball.

#### On a Windows system

Use the Windows control panel in the usual fashion to remove the Scalyr application.


troubleshooting: <Troubleshooting>
noDataFromHost:
## Troubleshooting: no data from host

If you are not seeing the data you expect on the Scalyr web site, the first step is to check whether the agent is
uploading any data at all. Click the Overview link in the navigation bar, find the host in question, and click on
the {{menuRef:System dashboard}} link for that host. If the host does not appear, or the dashboard does not show
any data, then the agent on that host is not running or is not successfully communicating with Scalyr.

To diagnose this, run the following command (Linux):

    sudo scalyr-agent-2 status -v

For Windows:

    scalyr-agent-2.exe status -v

This may tell you that the agent is not running. If so, try launching it (Linux):

    sudo scalyr-agent-2 start

For Windows:

    scalyr-agent-2.exe start

As a cross-check to verify whether the agent is running, you can execute ``ps aux | grep scalyr-agent``. The output
should include a command along the lines of ``python scalyr-agent-2``.

When you start the agent, you may see an error message indicating that you have an incorrect API token. In this
case, open ``[agent.json](#configuration)``, find the ``api_key`` line, and edit it so that it contains your key:
[[[writeLogsTokenInstructions2]]]

Make sure to include any trailing hyphen when copy/pasting the API key. Then launch the agent again.

If the agent is already running, the output of ``sudo scalyr-agent-2 status -v`` may contain information regarding
any problems. If the agent is successfully sending data to Scalyr, you should see a message like this:

    Last copy response status: 'success'

If it is having problems, you may instead see something like this:

    Last copy response status: 'error/client/badParam'
    Last copy response: '{   "message": "Couldn't decode API token ...xxxxx.",   "status": "error/client/badParam" }'

The error message should help you narrow down the problem. If the agent reports a network problem, you might
check to see whether your host can connect to Scalyr or other public servers:

    wget https://www.scalyr.com
    wget https://www.google.com

Always feel free to drop us a line at [support@scalyr.com](mailto:support@scalyr.com) for assistance.

logNotPresent:
## Troubleshooting: log not present 

If the agent is running, but is not uploading a particular log file, check the agent status (Linux):

    sudo scalyr-agent-2 status -v

For Windows:

    scalyr-agent-2.exe status -v

Look for a status message for the log path in question. It should look like this:

    Path /var/log/tomcat6/access_log: copied 19621786 bytes (178843 lines), 0 bytes pending, last checked Tue Aug 19 18:08:02 2014 UTC

If you don't see any such message, open ``[agent.json](#configuration)``, "logs" section, and verify that it
contains an appropriate entry for the log file. For instance:

    logs: [
      ...

      {
        path: "/var/log/tomcat6/access_log",
        attributes: {parser: "accessLog"}
      }
    ]

If the agent status does not contain a "Path" line in the status output but also contains text like "no matching readable file", 
then the log file may not exist, or its permissions may not allow reading by the user under which the agent is running.
Verify that the path you've specified in the agent configuration matches the absolute path of your log file, and the user under
which the agent is running has read access to the log and its parent directories. (To double-check the user under which the
agent is running, look for "Executing user" in the agent status output.)

To run the agent as a different user, execute

    sudo scalyr-agent-2-config --set-user XXXX

(where XXXX is the new username) and then restart the agent.

Note, only Linux can run the agent as a different user.  On Windows, the agent is always run as Administrator.

package-download: <Package Download>
## Package Download

If you wish to install the Scalyr Agent packages yourself, you may download them from the
following URLs.  You must select which package is appropriate for your system.

For systems that use yum (except CentOS 5 or RHEL5), download the RPM from:

    [[[agentDownloadUrl("rpm")]]]

For systems that use apt-get, download the Debian package from:

    [[[agentDownloadUrl("deb")]]]

For older distributions such as CentOS 5 or Redhat Enteprise Linux 5, download this RPM:

    [[[agentDownloadUrl("rhel5")]]]
    
For systems that do not use yum or apt-get, you may download a tarball from here:

    [[[agentDownloadUrl("tarball")]]]

For Windows system, you can download an installer from:

    [[[agentDownloadUrl("win32")]]]

building-own-packages: <Building Your Own Package>
## Building Your Own Package

You can build your own custom scalyr-agent-2. This can be helpful if you wish to deploy custom plugins with
your agent, or repackage the agent in some way that better fits your needs.  You can create custom RPM, Debian,
or tarball packages.

To learn how to create your own packages, please see the
[instructions](https://github.com/scalyr/scalyr-agent-2/blob/master/README.md#building-packages) 
hosted on the [agent code repository](https://github.com/scalyr/scalyr-agent-2/).


ssl: <SSL Requirements>
## SSL Requirements

All communication between the Scalyr Agent and Scalyr's servers is encrypted using SSL.

The agent is only able to verify SSL certificates if your system has the Python SSL package. Without the SSL package,
communication is still encrypted, but an adversary with the ability to intercept and modify packets on your network
could theoretically perform a [MiTM](http://en.wikipedia.org/wiki/Man-in-the-middle_attack) attack and view or modify
your log traffic.

To check whether a server has the SSL module installed, execute the following command:

    python -m ssl

If it gives no output, you're all set. If you get a message like:

    /usr/bin/python: No module named ssl

then you do not have the Python SSL module. The home page for this module is https://pypi.python.org/pypi/ssl/. If
your system supports pip, you can install it using:

    pip install ssl

Otherwise, if you'd like to install the SSL module, contact us at [support@scalyr.com](mailto:support@scalyr.com) for
help.


open-source: <Source Code>
## Source Code

The source code for the agent is [available on GitHub](https://github.com/scalyr/scalyr-agent-2/). Feel free to
look around! We welcome requests, feedback, and bug reports.


@class=bg-warning docInfoPanel: If you are using the "classic" Scalyr Agent (most installations prior to late September
2014), see [Scalyr Agent Classic](/help/scalyr-agent-1) for documentation. We 
encourage you to upgrade to the current agent; see [Migrating from Scalyr Agent Classic](/scalyr-agent-migration.pdf). 
If you're not sure which agent you're using: if ``ps aux | grep 'scalyr-agent-[2]'`` has any output, then you're 
running the current agent.