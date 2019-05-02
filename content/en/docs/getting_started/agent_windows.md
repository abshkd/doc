---
title: "Windows Installation"
weight: 60
notoc: true
warning: "__Note:__ These instructions are for installing the Scalyr Agent directly on Windows.
<br><br>
To run the agent on Linux or a container service, see the specific guides to the left.
"
beforetoc: "The Scalyr Agent is a [open source daemon](https://github.com/scalyr/scalyr-agent-2) that uploads logs and system metrics to Scalyr."
---


## Installation Steps


1.  Download the [[[agentDownloadLink("win32", "Windows Installer")]]]
and run it.  It will ask for Administrator privileges to install itself.

2.  Enter your API key[[[andScalyrServerIfNecessary]]] in the agent configuration file, which is automatically opened 
in Notepad at the end of installation.  You have to replace the line containing ``"REPLACE_THIS"``
with:

      "api_key": "[[[writeLogsToken]]]",

[[[hideIfDefaultScalyrServer]]]Additionally, you need to set the Scalyr server to which you send logs to the correct
one for your account.  To do this, add the following line right below the line you just updated:
[[[scalyrServerConfigIfNecessary]]]

3.  [Optional] You can also update the configuration file to upload logs of your choosing.  While the 
configuration file is still open in Notepad, find the ``logs`` section, and insert something like this:

    logs: [
      {
        path: "***C:\\WebServer\\logs\\access.log***",
        attributes: {parser: "***accessLog***"}
      }
    ]

Substitute the path for your web server's access log. Note, you must double any backslashes in the file path, as
in the example above.

You can upload any number of log files, of any
type; give each file its own entry in the ``logs`` list. Specify ``parser: "accessLog"`` for standard
web access logs; for other log types, choose a name that describes the type of data in the log (using
only letters, digits, spaces, underscores, and hyphens).

Note, you can modify the configuration file later on to add more log entries after the agent has been started.
The agent will notice any configuration file changes within 30 seconds without the need for a restart.

4. Save the configuration file.

5. Start the agent, by clicking on the ``Start the Scalyr Agent`` shortcut in the Windows Start menu under Scalyr.

This will open a console window with the message ``"The agent has started"`` if the agent has been
successfully started.  You may close the console window at any time; it does not stop the agent.

## Changing reported hostname

By default, Scalyr will identify your server by its hostname. If your hostname is something unhelpful
like "ip-12-23-34-45", you can [specify a different name](/help/scalyr-agent#hostname).

## That's It!

Hopefully, that was easy. If you've had any trouble, please [let us know](mailto:support@scalyr.com).
Otherwise, if this is your first time using Scalyr, this would be an excellent time to head on to the
[Getting Started guide](/help/getting-started).

If you're using any log formats other than ``accessLog``, you should first pop over to the
[Log Parsing](/help/parsing-logs) page to set up a parser.

For complete documentation, see the [agent reference](/help/scalyr-agent). Here you can learn
how to download the agent directly (instead of using our package repository), get tips for
installing via a tool like Chef or Puppet, find troubleshooting tips, and more.

