---
title: "Linux Installation"
warning: "__Note:__ These instructions are for installing the Scalyr Agent directly on Linux.
<br><br>
To run the agent on Windows or a container service, see the specific guides to the left.
"
beforetoc: "The Scalyr Agent is a [open source daemon](https://github.com/scalyr/scalyr-agent-2) that uploads logs and system metrics to Scalyr."
weight: 50
---

## Installing the Agent

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

## Installing Other Ways

If you are installing the Scalyr Agent automatically using a tool like Chef or Puppet, you may wish to bypass our one-step
installation script and invoke ``yum`` or ``apt-get`` directly.

{{% code-tabs %}}

   {{% code-tab "yum" %}}
    wget -q https://www.scalyr.com/scalyr-repo/stable/latest/scalyr-repo-bootstrap-[[[repoVersion]]]-1.noarch.rpm
    sudo yum remove scalyr-repo scalyr-repo-bootstrap  # Remove any previous repository definitions, if any.
    sudo yum install --nogpgcheck scalyr-repo-bootstrap-[[[repoVersion]]]-1.noarch.rpm
    sudo yum install scalyr-repo 
    sudo yum install scalyr-agent-2
   {{% /code-tab %}}

   {{% code-tab "apt-get" %}}
    wget -q https://www.scalyr.com/scalyr-repo/stable/latest/scalyr-repo-bootstrap_[[[repoVersion]]]_all.deb
    sudo dpkg -r scalyr-repo scalyr-repo-bootstrap  # Remove any previous repository definitions, if any.
    sudo dpkg -i scalyr-repo-bootstrap_[[[repoVersion]]]_all.deb
    sudo apt-get update
    sudo apt-get install scalyr-repo
    sudo apt-get install scalyr-agent-2
   {{% /code-tab %}}

   {{% code-tab "CentOS 5 / RHEL5" %}}
    wget -q https://www.scalyr.com/scalyr-repo/stable/latest/scalyr-repo-bootstrap-[[[repoVersion]]]-1.alt.noarch.rpm
    sudo yum remove scalyr-repo scalyr-repo-bootstrap  # Remove any previous repository definitions, if any.
    sudo yum install --nogpgcheck scalyr-repo-bootstrap-[[[repoVersion]]]-1.alt.noarch.rpm
    sudo yum install scalyr-repo 
    sudo yum install scalyr-agent-2
   {{% /code-tab %}}

{{% /code-tabs %}}


Now that you have installed the scalyr-agent-2 package, you need to configure it using your Write Logs API key[[[andScalyrServerIfNecessary]]].

    [[[agent2ConfigKeyAndServer]]]

Finally, you can start the agent:

    sudo scalyr-agent-2 start

Then follow the regular setup instructions to configure log uploading and other agent features.


## Tarball Installation

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
