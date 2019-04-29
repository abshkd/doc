---
title: "Install Agent (Deprecated)"
---
 
@class=bg-warning docInfoPanel: This page describes the "classic" Scalyr Agent. For new installations, we strongly encourage
use of the current Scalyr Agent; see [Install Scalyr Agent](/help/install-agent-linux). 
If you are currently using the classic agent, we encourage you to upgrade to the current agent; see 
[Migrating from Scalyr Agent Classic](/scalyr-agent-migration.pdf).


The Scalyr Agent is a daemon to install on each server. It uploads logs and system metrics to the
Scalyr servers. This page provides streamlined instructions to get you up and running quickly.
For other options, skip down to the [Further Reading](#furtherReading) section.

1. Verify that you have a Java runtime environment (Java 6 or higher) installed:

    java -version

2. Add our repository to your package manager:

    wget https://www.scalyr.com/scalyr-repo/stable/latest/installScalyrRepo.sh
    sudo bash ./installScalyrRepo.sh

3. Install the agent package. Execute **one** of the following commands, depending on whether
your system uses yum or apt-get (the previous command will tell you which):

    sudo yum install scalyr-agent
    sudo apt-get install scalyr-agent

4. Configure the agent:

    sudo scalyr-agent-config --run_as root --write_logs_key -

When prompted, enter your "Write Logs" API key:

    [[[writeLogsToken]]]

5. To configure log uploading, open ``/etc/scalyrAgent/agentConfig.json`` and find the ``logcopier_config``
section, and within that, the ``directories`` clause. Remove the example text and insert something
like this:  

    directories: [
      {
        path: "***/var/log/tomcat6/access_log***",
        file_attributes: {parser: "***accessLog***"}
      }
    ]

Substitute the path for your web server's access log. You can upload any number of log files, of any
type; give each file its own entry in the ``directories`` list. Specify ``parser: "accessLog"`` for
standard web access logs; for other log types, choose a name that describes the type of data in the
log, using only letters, digits, spaces, underscores, and hyphens.

6. Launch the agent:

    sudo scalyr-agent start

If everything is set up correctly, you should see a message like this: "Congratulations! The
Scalyr monitor has started successfully and is relaying system metrics to Scalyr."


## That's It!

Hopefully, that was easy. If you've had any trouble, please [let us know](mailto:support@scalyr.com).
Otherwise, if this is your first time using Scalyr, this would be an excellent time to head on to the
[Getting Started guide](/help/getting-started).

If you're using any log formats other than ``accessLog``, you should first pop over to the
[Log Parsing](/help/parsing-logs) page to set up a parser.


furtherReading: <Further Reading>
## Further Reading

If you'd prefer not to run the agent as root, you can specify any user that has read access to your
logs. In step 4, just substitute the appropriate user name:

    sudo scalyr-agent-config --run_as ***username*** --write_logs_key -

If you've already launched the agent, it's not too late; you can change users as follows:

    sudo scalyr-agent stop
    sudo scalyr-agent-config --run_as ***new-username***
    sudo scalyr-agent start

By default, Scalyr will identify your server by its hostname. If your hostname is something unhelpful
like "ip-12-23-34-45", you can [specify a different name](/help/scalyr-agent-1#hostname).

For complete documentation, see the [agent reference](/help/scalyr-agent-1). Here you 
can learn how to download the agent directly (rather than using our package repository), get tips for
installing via a tool like Chef or Puppet, find troubleshooting tips, and more.
