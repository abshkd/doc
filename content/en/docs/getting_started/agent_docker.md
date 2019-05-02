---
title: "Docker Installation"
weight: 30
warning: "__Note:__ These instructions are for installing the Scalyr Agent in a Docker container.
<br><br>
To run the agent directly on Linux, Windows, or another container service, see the specific guides to the left.
"
beforetoc: "The Scalyr Agent is a [open source daemon](https://github.com/scalyr/scalyr-agent-2) that uploads logs and system metrics to Scalyr.
<br><br>For Docker, we find it works best if you run the agent in its own container on each host to collect logs and metrics from all other containers 
on the same host. "
---



We find it works best if you run the Scalyr Agent in its own Docker container on each host
running Docker in your system.  This Scalyr Agent container will collect logs and metrics from all other containers
running on the same host.  


We support two logging drivers: `syslog` and `json-file`. 

## Using the json-file Driver

To start the Scalyr Agent container with the json-file driver:

1.  Download the official Scalyr Agent Docker image from Docker Hub

    ```docker pull scalyr/scalyr-agent-docker-json```

    The default ``:latest`` tag will always point to the latest released agent version.

2.  Create a configuration file snippet to hold your api key.  In this example, we will create ``/tmp/api_key.json``:

    [[[apiTokenAndServerJsonInstructions]]]

3.  Launch the scalyr-agent container.  Be sure to substitute ``/var/run/docker.sock`` with the path to your Docker socket and ``/var/lib/docker/containers`` with the path to the Docker containers directory. 

    ```docker run -d --name scalyr-docker-agent -v /tmp/api_key.json:/etc/scalyr-agent-2/agent.d/api_key.json -v /var/run/docker.sock:/var/scalyr/docker.sock -v /var/lib/docker/containers:/var/lib/docker/containers scalyr/scalyr-agent-docker-json```

4.  Start your other containers. Below is a simple "Hello, World" example.

    ```docker run -d ubuntu /bin/sh -c 'while true; do echo Hello, World!; sleep 1; done'```

## Using the syslog Driver

To start the Scalyr Agent container with the syslog driver:

1.  Download the Scalyr Agent docker syslog image from Docker Hub

    ```docker pull scalyr/scalyr-agent-docker-syslog```

2.  Create a configuration file snippet to hold your api key[[[andScalyrServerIfNecessary]]].  In this example, we will create ``/tmp/api_key.json``:

    [[[apiTokenAndServerJsonInstructions]]]

3.  Launch the scalyr-agent container.  Be sure to substitute ``/var/run/docker.sock`` with the path to your Docker socket.

    ```docker run -d --name scalyr-docker-agent -v /tmp/api_key.json:/etc/scalyr-agent-2/agent.d/api_key.json -v /var/run/docker.sock:/var/scalyr/docker.sock -p 601:601 scalyr/scalyr-agent-docker-syslog```

4.  Configure other containers to send their logs to Scalyr via the Scalyr Agent container.  When you start a container, you must supply these additional options to direct their logs to the Scalyr Agent container: ``--log-driver=syslog --log-opt syslog-address=tcp://127.0.0.1:601``.

For example, to start a container running a "Hello World" example, you would execute:

    docker run  --log-driver=syslog --log-opt syslog-address=tcp://127.0.0.1:601 -d ubuntu /bin/sh -c 'while true; do echo Hello, World!; sleep 1; done'

## Setting Parsers, Sampling and Redaction Rules

By default, all logs sent to the Scalyr Agent container are configured to use the ``dockerSyslog`` parser.  You may
override this by providing additional configuration.

To do so, you must create a log configuration stanza that matches the particular log file whose parser you wish to set.
For example, follow the [instructions above to export the Scalyr Agent's configuration](#modify-config) and then create the following ``agent.d/container_logs.json`` file:

    {
      "logs":[ { 
            "path": "/var/log/scalyr-agent-2/containers/*Frontend.log", 
            "attributes": {"parser": "frontendLog"} 
          }, { 
            "path": "/var/log/scalyr-agent-2/containers/*Backend.log", 
            "attributes": {"parser": "backendLog"}
          } ]
    }

After you finish your modifications, be sure to import them back to the running Scalyr Agent using the above instructions.

This would set ``frontendLog`` to be the parser for all logs uploaded by containers whose names end in ``Frontend``. It would set ``backendLog`` to be the parser for all logs with containers ending in ``Backend``.  As long as
your container name defines the type of logs it generates, you will be able to set appropriate parsers.

You can use this technique to also specify sampling and redaction rules.  See the [documentation on sampling and
redaction rules](/help/scalyr-agent#filter) for more information.


You can also use Docker labels to  control how Scalyr will import logs from your containers.  For example, you can 
set the parser Scalyr should use to parse that container's log or set the sampling rate for what percentage
of logs lines from the container should be sent to Scalyr.

The agent takes any label on a container that begins with ``com.scalyr.config.log.`` and maps it to the
corresponding option in the ``log_config`` stanza (minus the prefix).  For example, if you add the following
label to your container:
                                                                     
    com.scalyr.config.log.parser=accessLog

The Scalyr Agent will automatically use the following for that container's ``log_config``:

    { "parser": "accessLog" }

This feature is enabled by default, and by default any configuration labels are ignored by the
the ``labels_as_attributes`` option is turned on.  To turn off this feature entirely, you can set the 
``use_labels_for_log_config`` option to ``false`` in the docker monitor configuration, and the agent will not
process container labels for configuration options.

The following fields can be configured via container labels and behave as described in the 
[Scalyr help docs](/help/scalyr-agent#logUpload):

- parser
- attributes
- sampling_rules
- rename_logfile
- redaction_rules

Note: keys for docker labels cannot include underscores, so for all options that have an underscore in their name,
replace it with a hyphen, and the Scalyr agent will map this to the appropriate option name. e.g. the labels: 
``com.scalyr.config.log.rename-logfile`` would be mapped to ``rename_logfile``

See the [documentation on sampling and redaction rules](/help/scalyr-agent#filter) for more information on these
options work and see the next section for how their options map to label names.

## Mapping Configuration Options

The rules for mapping container labels to configuration are as follows:

Values separated by a period are mapped to object keys e.g. if a label on a given container 
was specified as:

    com.scalyr.config.log.attributes.tier=prod

Then this would be mapped to the following object, which would then be applied to the log config for
that container:

    { "attributes": { "tier": "prod" } }

Arrays can be specified by using one or more digits as the key, e.g. if the labels were

    com.scalyr.config.log.sampling-rules.0.match-expression=INFO
    com.scalyr.config.log.sampling-rules.0.sampling-rate=0.1
    com.scalyr.config.log.sampling-rules.1.match-expression=FINE
    com.scalyr.config.log.sampling-rules.1.sampling-rate=0

This will be mapped to the following structure:

    { 
      "sampling_rules":
      [
        { "match_expression": "INFO", "sampling_rate": 0.1 },
        { "match_expression": "FINE", "sampling_rate": 0 }
      ]
    }

Note: The Scalyr agent will automatically convert hyphens in the docker label keys to underscores.

Array keys are sorted by numeric order before processing and unique objects need to have different digits
as the array key. If a sub-key has an identical array key as a previously seen sub-key, then the previous value
of the sub-key is overwritten.  There is no guarantee about the order of processing for items with the same
numeric array key.

## Importing Docker Labels

You can optionally configure the Scalyr Agent to automatically add any Docker labels you have set on your container
to the log lines from that container.  For example, suppose you add a Docker label called ``tier=prod`` to all
of your production containers.  The Scalyr Agent can automatically retrieve this label and add it to all log lines
for those contains (as well as other similar labels such as ``tier=staging``.

This functionally is turned off by default, so you must turn it on by setting the ``labels_as_attributes`` configuration
option to ``true``.  You can specify other options to control what labels will automatically be added to the log
lines.  The full options related to this feature are:

- **labels_as_attributes** - When `true` upload labels that pass the include/exclude filters (see below) as log attributes for the logs generated by the container.  Defaults to `false`
- **label_include_globs** - A list of [glob strings](https://docs.python.org/2/library/fnmatch.html) used to include labels to be uploaded as log attributes.  Any label that matches any glob in this list will be included as an attribute, as long as it not excluded by `label_exclude_globs`.  Defaults to `[ '*' ]` (everything)
- **label_exclude_globs** - A list of glob strings used to exclude labels from being uploaded as log attributes.  Any label that matches any glob on this list will be excluded as an attribute.  Exclusion rules are applied *after* inclusion rules.  Defaults to `[ 'com.scalyr.config.*' ]`
- **label_prefix** - A string to add to the beginning of any label key before uploading it as a log attribute.  e.g. if the value for `label_prefix` is `docker_` then the container labels `app` and `tier` will be uploaded to Scalyr with attribute keys `docker_app` and `docker_tier`.  Defaults to ''

You can change these config options by editing the ``agent.d/docker.json`` file. Please 
[follow the instructions here](/docs/getting_started/agent_docker#modify-config) to export the configuration of your 
running Scalyr Agent.

A sample configuration that uploaded the attributes ``tier``, ``app`` and ``region``, with the prefix ``dl_`` would look like this:

    monitors: [
      {
        "module": "scalyr_agent.builtin_monitors.docker_monitor",
        ...
        labels_as_attributes: true,
        label_include_globs: ['tier', 'app', 'region' ],
        label_prefix: 'dl_'
      }
    ]

**Warning**: These attributes contribute towards your total log volume, so it is wise to limit the labels to a small set of
approved values, to avoid paying for attributes that you don't need.

## Creating Custom Docker Images

As you will see below, you can turn on several useful features in the Scalyr Agent by modifying its configuration
files.  Modifying these files on one container is relatively simple in Docker, but can become burdensome when
you wish to use the same configuration files on many Docker instances.  To ease this burden, we have
provided tools to allow you to easily create new Scalyr Agent Docker images that include your custom configuration
files.

You can create a custom Docker image based on a running Scalyr Agent by executing the following commands:

    mkdir /tmp/scalyr-docker-agent
    cd /tmp/scalyr-docker-agent
    docker exec -i scalyr-docker-agent scalyr-agent-2-config --docker-create-custom-dockerfile - | tar -xz
    docker build -t customized-scalyr-docker-agent . 

This will leave a new Docker image on your local Docker instance with the repository ``customized-scalyr-docker-agent``.  
You can change this using the ``docker tag`` command.  From there, you can use any of the standard methods for distributing
your Docker image to the rest of your servers.

You can launch a new Scalyr Agent container using this image by executing:

    docker run -d --name scalyr-docker-agent -v /var/run/docker.sock:/var/scalyr/docker.sock -p 601:601 customized-scalyr-docker-agent


## Modifying Configuration Files

We have also created a tool to help you modify multiple configuration files on a running Scalyr Agent container at one
time.  It handles reading the configuration files from the container and then writing them back.

To read the current configuration files from the running Scalyr Agent, execute the following commands:

    mkdir /tmp/scalyr-agent-config
    cd /tmp/scalyr-agent-config
    docker exec -i scalyr-docker-agent scalyr-agent-2-config --export-config - | tar -xz
  
After these commands finish, your current directory will have one file ``agent.json`` and a directory ``agent.d``.  The
``agent.json`` file is a copy of the running Scalyr Agent's ``/etc/scalyr-agent-2/agent.json`` configuration file.  Likewise,
the ``agent.d`` directory is a copy of the ``/etc/scalyr-agent-2/agent.d`` directory.

You can edit these files to make whatever changes you need.  To write the changes back once you are finished,
execute this command:

    tar -zc agent.json agent.d/* | docker exec -i scalyr-docker-agent scalyr-agent-2-config --import-config -

There is no need to restart the Scalyr Agent after writing the configuration files.  The running Scalyr Agent should
notice the new configuration files and read them within 30 seconds.

## Setting a Server Host Name

By default, the Scalyr Agent's container id is used as the server host name for all logs it uploads.  This is not ideal
since this id can change over time, such as when you upgrade to a new version of the Scalyr Agent.

To avoid this issue, you may manually set a server host name for the container.  To do this, follow the [instructions
above for modifying configuration files](#modify-config) and create a new file ``agent.d/server_host.json`` with the 
following contents: 

    {
      "server_attributes": {
        "serverHost": "my-docker-host-01"
      }
    }

Then, use the commands for writing the configuration back to the running Scalyr Agent, and your logs should begin
appearing under the new server host name within 30 seconds.

You may also use the [environment variable import feature](/help/scalyr-agent#varSubstitution) 
to avoid having to create a unique ``server_host.json`` file for each server host name.  This feature allows you to 
import variables from the environment and use them to define fields in a Scalyr configuration file.

For example, you could have defined your ``agent.d/server_host.json`` file with the following contents:

    {
      "import_vars": [ "DOCKER_HOST_NAME" ],
      
      "server_attributes": {
        "serverHost": "$DOCKER_HOST_NAME"
      }
    }
    
In this example, the environment variable ``DOCKER_HOST_NAME`` is used to define the server host name.  This is
particularly useful if you supply these environment variables using the ``-e`` Docker option when you launch the
container.  For example, you can follow the [instructions above for creating a custom image](#custom-images) with this
configuration and then execute this command:

    docker run -d -e DOCKER_HOST_NAME='my-host' --name scalyr-docker-agent -v /var/run/docker.sock:/var/scalyr/docker.sock -p 601:601 customized-scalyr-docker-agent

## Customizing Log File Names

By default, all logs sent to the Scalyr Agent container via ``syslog`` are uploaded with log files names like:

    /var/log/scalyr-agent-2/containers/MyContainerName.log

You may customizes this file path based on your needs.  To do this, you will need to edit the ``agent.d/docker.json``
 file.  Please follow the [instructions above to export the configuration](#modify-config) of your running Scalyr Agent.

You need to modify the ``agent.d/docker.json`` file to add in the line below that beings with ``docker_logfile_template``:

    {
      "monitors": [
        {
          "module": "scalyr_agent.builtin_monitors.syslog_monitor",
          "mode": "docker",
          "docker_logfile_template": "/var/mylogs/${CID}/${CNAME}.log"
        }, {
          "module": "scalyr_agent.builtin_monitors.docker_monitor",
          "log_mode": "syslog"
        }
      ]
    }

Be sure to save your configuration file changes back to the running Scalyr Agent using the above instructions.

As you can see, you may use the variables ``$CID`` and ``$CNAME`` to define your file path.  These are the id and
name of the container generating the log file.

Note, the agent will not create directories.  Make sure all directories in your path exist on the container.

## Starting the Container

As mentioned above, the typical command to start the Scalyr Agent command is below:

    docker run -d --name scalyr-docker-agent -v /tmp/api_key.json:/etc/scalyr-agent-2/agent.d/api_key.json -v /var/run/docker.sock:/var/scalyr/docker.sock -p 601:601 scalyr/scalyr-docker-agent

For reference, here is a description of the options:

- ``-d`` is to run in detached mode (needed when running a daemon process such as the scalyr-agent)
- ``--name scalyr-docker-agent`` names this container 'scalyr-docker-agent'.  It is useful to give a fixed name to the Scalyr Agent container.
- ``-v /tmp/api_key.json:/etc/scalyr-agent-2/agent.d/api_key.json`` maps ``/tmp/api_key.json`` on the host, to ``/etc/scalyr-agent-2/agent.d/api_key.json`` on the container.  This allows you to insert configuration snippets into the ``agent.d`` configuration directory to add in configuration read by the Scalyr Agent.  You can avoid having to include this option if you follow the [instructions to create a custom Docker image with your configuration files](#custom-images). 
- ``scalyr/scalyr-docker-agent:2.0.23`` specifies the image to run.
- ``-v /var/run/docker.sock:/var/scalyr/docker.sock`` maps the Docker API socket to a path in the container.  The Scalyr Agent requires access to the Docker API socket to collect metrics and determine container names.
- ``-p 601:601`` maps the host's port ``601`` to the container's port ``601``.  This is the default syslog port the Scalyr Agent listens on.



## Stopping the Container

Assuming you have a container named ``scalyr-docker-agent`` running, it can be stopped with the following command:

    docker stop scalyr-docker-agent

## Restarting the Container

Assuming you have previously stopped a container named ``scalyr-docker-agent``, you can restart it with the command

    docker start scalyr-docker-agent

## Checking the Status

To check the status of a currently running Scalyr Agent container, use the following command:

    docker exec scalyr-docker-agent scalyr-agent-2 status

or

    docker exec scalyr-docker-agent scalyr-agent-2 status -v

to get more verbose output.

## Logs from Other Containers

In order to gather log files from other containers, you must share volumes containing those log files with the Scalyr Agent 
container.  You can then configure the Scalyr Agent as normal to copy those files to the Scalyr servers.

There are numerous ways to share volumes from other containers.  See the Docker documentation on
[managing data in containers](https://docs.docker.com/userguide/dockervolumes/)

As a simple example, imagine you have an Apache container that was configured to log its access files 
to ``/var/log/httpd/access.log`` on the host.  When running the Scalyr Agent container you would simply map that file 
to a file in the container with the ``-v`` command line parameter: ``-v /var/log/httpd/access.log:/var/log/httpd/access.log``

The full command to run the container would be:

    docker run -d --name scalyr-docker-agent -p 601:601 -v /tmp/api_key.json:/etc/scalyr-agent-2/agent.d/api_key.json -v /var/log/httpd/access.log:/var/log/httpd/access.log -v /var/run/docker.sock:/var/scalyr/docker.sock  scalyr/scalyr-docker-agent

You would then [export your configuration files](#modify-config) and create a ``agent.d/more_logs.json`` file with the following content:

    {
      "logs": [
        {
          "path": "/var/log/httpd/access.log",
          "attributes": {parser: "accessLog"}
        }
      ]
    }

And Scalyr will automatically start tracking this file after you re-import the configuration to the running Scalyr Agent.

If you have multiple containers that each have files you wish to upload, you should probably consider creating a
[Data Volume Container](https://docs.docker.com/userguide/dockervolumes/#creating-and-mounting-a-data-volume-container)

This volume would be shared among all containers, with each container configured to output log data to a specific path.

e.g. assuming you had followed the instructions in the link above and created a data volume container called 'logdata'.
You could then run the scalyr-agent container with the following command:

    docker run -d --name scalyr-docker-agent -p 601:601 -v /tmp/api_key.json:/etc/scalyr-agent-2/agent.d/api_key.json --volumes-from logdata -v /var/run/docker.sock:/var/scalyr/docker.sock  scalyr/scalyr-docker-agent

And configure the Scalyr Agent to track any log files of interest that existed in logdata’s volumes.

## Troubleshooting Socket Issues

You may need to determine the path for the Docker API socket and the containers directory on your machine. These instructions assume that the socket is located at ``/var/run/docker.sock`` and the containers directory is at ``/var/lib/docker/containers``.

Typically, the socket is located at either ``/run/docker.sock`` or ``/var/run/docker.sock`` and the containers directory is at ``/var/lib/docker/containers`` For the Docker socket, be sure that you find the path to the true socket and not just a symlink to it.  Use ``ls -l`` to verify.  If both ``/run/docker.sock`` and ``/var/run/docker.sock`` are not symlinks, use ``/var/run/docker.sock``.  If neither file exists, try executing ``netstat --unix -l | grep docker.sock`` to locate the socket. Make sure your user has permission to access ``docker.sock``.

If you've had any trouble, please [let us know](mailto:support@scalyr.com).



