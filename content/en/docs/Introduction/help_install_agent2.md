---
title: "Install Agent (Linux)"
weight: 20
---

@class=bg-warning docInfoPanel: This page contains instructions for installing the Scalyr Agent on Linux. For Windows,
see the [Windows installation page](/help/install-agent-windows).
For Docker, see the [Docker installation page](/help/install-agent-docker).
For AWS EC2 Container Service (ECS), see the [ECS installation page](/help/install-agent-ecs).

The Scalyr Agent is a daemon to install on each of your servers. It uploads logs and system metrics
to the Scalyr servers. This page provides streamlined instructions to get you up and running quickly.
For other options, skip down to the [Further Reading](#furtherReading) section.

singleCommandInstall:
1. Install the scalyr-agent-2 package:

    [[[agent2Install]]]

This will configure your api key[[[andScalyrServerIfNecessary]]] and then launch the agent.

If the ``wget`` command fails, try running it again with the ``-q`` option removed to see additional error output.
If ``wget`` is not available on your system, try replacing ``wget -q`` with ``curl -sO``.

2. To configure log uploading, open ``/etc/scalyr-agent-2/agent.json`` and find the ``logs`` section.
Insert something like this:

    logs: [
      {
        path: "***/var/log/tomcat6/access_log***",
        attributes: {parser: "***accessLog***"}
      }
    ]

Substitute the path for your web server's access log. You can upload any number of log files, of any
type; give each file its own entry in the ``logs`` list. See the
[log file reference](/help/scalyr-agent#logUpload) for a list of supported parser
names. If your log isn't listed, choose a name that describes the type of data in the log (using
only letters, digits, spaces, underscores, and hyphens).

After you edit the configuration file, the agent will begin copying the specified logs within 30 seconds.

## That's It!

Hopefully, that was easy. If you've had any trouble, please [let us know](mailto:support@scalyr.com).
Otherwise, if this is your first time using Scalyr, this would be an excellent time to head on to the
[Getting Started guide](/help/getting-started).

If you're using any log formats other than ``accessLog``, you should first pop over to the
[Log Parsing](/help/parsing-logs) page to set up a parser.

For complete documentation, see the [agent reference](/help/scalyr-agent). Here you can learn
how to download the agent directly (instead of using our package repository), get tips for
installing via a tool like Chef or Puppet, find troubleshooting tips, and more.


furtherReading: <Further Reading>
## Further Reading

runNonRoot:
### Running under a non-root account
If you'd prefer not to run the agent as root, you can specify any user that has read access to your
logs. Execute this command, substituting the appropriate user name:

    sudo scalyr-agent-2-config --set-user ***username***

You will need to restart the agent to have the change take effect.

    sudo scalyr-agent-2 restart

### Changing reported hostname

By default, Scalyr will identify your server by its hostname. If your hostname is something unhelpful
like "ip-12-23-34-45", you can [specify a different name](/help/scalyr-agent#hostname).

### Installing without the script

If you are installing the Scalyr Agent automatically using a tool like Chef or Puppet, you may wish to bypass our one-step
installation script and invoke ``yum`` or ``apt-get`` directly.

installByYum:
For systems that use ``yum`` (except CentOS 5 or RHEL5), execute these instructions:

    wget -q https://www.scalyr.com/scalyr-repo/stable/latest/scalyr-repo-bootstrap-[[[repoVersion]]]-1.noarch.rpm
    sudo yum remove scalyr-repo scalyr-repo-bootstrap  # Remove any previous repository definitions, if any.
    sudo yum install --nogpgcheck scalyr-repo-bootstrap-[[[repoVersion]]]-1.noarch.rpm
    sudo yum install scalyr-repo 
    sudo yum install scalyr-agent-2

installByApt:
For systems that use ``apt-get``, execute these instructions:

    wget -q https://www.scalyr.com/scalyr-repo/stable/latest/scalyr-repo-bootstrap_[[[repoVersion]]]_all.deb
    sudo dpkg -r scalyr-repo scalyr-repo-bootstrap  # Remove any previous repository definitions, if any.
    sudo dpkg -i scalyr-repo-bootstrap_[[[repoVersion]]]_all.deb
    sudo apt-get update
    sudo apt-get install scalyr-repo
    sudo apt-get install scalyr-agent-2

For older distributions such as CentOS 5 or RHEL5, execute these instructions:

    wget -q https://www.scalyr.com/scalyr-repo/stable/latest/scalyr-repo-bootstrap-[[[repoVersion]]]-1.alt.noarch.rpm
    sudo yum remove scalyr-repo scalyr-repo-bootstrap  # Remove any previous repository definitions, if any.
    sudo yum install --nogpgcheck scalyr-repo-bootstrap-[[[repoVersion]]]-1.alt.noarch.rpm
    sudo yum install scalyr-repo 
    sudo yum install scalyr-agent-2

Now that you have installed the scalyr-agent-2 package, you need to configure it using your Write Logs API key[[[andScalyrServerIfNecessary]]].

    [[[agent2ConfigKeyAndServer]]]

Finally, you can start the agent:

    sudo scalyr-agent-2 start

Then follow the regular setup instructions to configure log uploading and other agent features.


tarball: <Tarball>
### Tarball Installation

If you'd prefer not to use a package manager, you can download and install the agent via a simple tarball:

    wget -q [[[agentDownloadUrl("tarball")]]]
    tar -zxf [[[agentPackageName("tarball")]]]
    mv scalyr-agent-[[[agent2Version]]] scalyr-agent-2
    export PATH=${PWD}/scalyr-agent-2/bin:$PATH

You should add the full path to the Scalyr Agent's bin directory to the ``$PATH`` variable in your ``.bash_profile``
(or the equivalent file for your particular shell).

Execute the following command to configure the agent to use your Write Logs API key[[[andScalyrServerIfNecessary]]]:

    [[[agent2ConfigKeyAndServerNoSudo]]]

Finally, you can start the agent by executing the following command:

    scalyr-agent-2 start

To configure your agent, you will need to edit the ``agent.json`` file in the
``scalyr-agent-[[[agent2Version]]]/config`` directory. Most documentation references ``/etc/scalyr-agent-2/agent.json``,
which is only applicable to package manager installations.

To configure log uploading, see step 2 of the instructions at the top of this page.

Please note, if you install using the tarball, the agent will not automatically launch when your system starts up.
You will need to configure this yourself, perhaps by listing the agent in ``/etc/init.d``.
