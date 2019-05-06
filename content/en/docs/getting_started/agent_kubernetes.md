---
title: "K8s Installation"
weight: 10
warning: "__Note:__ We recommend using [Helm](#) for importing logs from a Kubernetes cluster, as it's much simpler.
<br><br>
To run the agent directly on Linux, Windows, or another container service, see the specific guides to the left.
"
beforetoc: "The Scalyr Agent is a [open source daemon](https://github.com/scalyr/scalyr-agent-2) that uploads logs and system metrics to Scalyr.
<br><br>For Kubernetes, we find it works best if you set it up as a DaemonSet that runs a dedicated pod on each node in your cluster to collect logs and metrics from all other pods 
    running on the same node. "
---

## First Time Installation

1.  Create a Secret that contains your [Write Logs API key](/keys).

    ```kubectl create secret generic scalyr-api-key --from-literal=scalyr-api-key="write_logs_api_token"```

2.  Create a ConfigMap that defines your cluster name.

    ```kubectl create configmap scalyr-config --from-literal=k8s_cluster=<your_k8s_cluster_name> your_k8s_scalyr_server```

3.  Create a service account that gives the DaemonSet the required privileges to access the Kubernetes API.

    ```kubectl create -f https://raw.githubusercontent.com/scalyr/scalyr-agent-2/release/k8s/scalyr-service-account.yaml```

4.  Install the new Scalyr K8s DaemonSet.

    ```kubectl create -f https://raw.githubusercontent.com/scalyr/scalyr-agent-2/release/k8s/scalyr-agent-2.yaml```

Configure your DaemonSet by following [these](#configuration) instructions below. 

## Upgrading

1.  Create a ConfigMap that defines your cluster name.

    ```kubectl create configmap scalyr-config --from-literal=k8s_cluster=<your k8s_cluster_name> your_k8s_scalyr_server```

2.  Create a service account that gives the DaemonSet the required privileges to access the Kubernetes API.

    ```kubectl create -f https://raw.githubusercontent.com/scalyr/scalyr-agent-2/release/k8s/scalyr-service-account.yaml```

3.  Delete your existing Scalyr k8s DaemonSet. Note: If you used a different yaml for deployment, use that.

    ```kubectl delete -f https://raw.githubusercontent.com/scalyr/scalyr-agent-2/master/k8s/scalyr-agent-2.yaml```

4.  Install the new Scalyr k8s DaemonSet.

    ```kubectl create -f https://raw.githubusercontent.com/scalyr/scalyr-agent-2/release/k8s/scalyr-agent-2.yaml```

Configure your DaemonSet by following [these](#configuration) instructions below.

## Checking the Agent Status

To check the status of a currently running Scalyr Agent container, first use kubectl to find the name of the pod in which you are interested:

    kubectl get pods

And once you have the name of the pod that is running the Scalyr Agent use the following command:

    kubectl exec <pod_name> -- scalyr-agent-2 status [-v for verbose]


## Stopping the Agent

If you wish to stop running the Scalyr Agent DaemonSet entirely, then (assuming you are using the default configuration and your DaemonSet's name is 'scalyr-agent-2') run:

    kubectl delete daemonset scalyr-agent-2

There is currently no convenient way to temporarily stop the Scalyr Agent already running on a specific node. If you wish to avoid running the Scalyr Agent on a specific node in your cluster, then see the section on [Running the DaemonSet on only some nodes](#running-only-on-some-nodes).

## Events

By default, the Scalyr Agent will collect pod logs, container metrics, and K8S events for all nodes. For more details and otions, see the [Kubernetes Events monitor](/help/monitors/kubernetes-events) documentation.


## Don't Run on Master Node

In our recommended setup, a DaemonSet runs a Scalyr Agent pod on each node in your cluster that will collect logs and metrics from all other 
pods running on the same node. Note that this will run the agent on the master node; if you do not want to run the agent on the master, comment out
the following in https://github.com/scalyr/scalyr-agent-2/blob/master/k8s/scalyr-agent-2.yaml:

    tolerations:
      - key: "node-role.kubernetes.io/master"
        operator: "Exists"
        effect: "NoSchedule"

## Running on Select Nodes

If you would like to run the Scalyr Agent only on certain nodes of your cluster, you can do so by adding a *nodeSelector* or a *nodeAffinity* section to your config file.  For example, if the nodes that you wanted to run the Scalyr Agent on had a label 'logging=scalyr' then you could add the following nodeSelector to your configuration file:

    spec:
      nodeSelector:
        logging: scalyr

or if you wanted to use nodeAffinity:

    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: logging
                operator: In
                values: ["scalyr"]

You can read more about specifying node selectors and affinity [here](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/).


## Configuration

You can configure the K8s agent via [Annotations](#annotations) and [Configmaps](#configmaps). From a high-level, Configmaps are used to configure the Kubernetes Agent, and Annotations are used to configure other pods in the cluster.

## Annotations 

Starting in the 2.0.36 release of the Scalyr Agent, you can now use k8s pod annotations to control how the Scalyr Agent will import your Kubernetes logs. This greatly simplifies performing common tasks such as assigning parser names to a pod's logs as well as turning on sampling and redaction rules. Annotations are our recommended method of configuration for resources on the configuration of resources outside the Scalyr Agent

The Scalyr Agent automatically reads any pod annotation that begins with the prefix:

    log.config.scalyr.com/

and maps it to the corresponding option in the log_config stanza for that pod's container (minus the prefix). These annotations can be added to a pod either via the kubectl annotate command or by modifying your Kubernetes YAML configuration files. See the [Kubernetes annotation documentation](https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/) for more information.

For example, if you add the following annotation to your pod:

    log.config.scalyr.com/attributes.parser: accessLog

The Scalyr Agent will automatically use the following for that pod's log_config stanza:

    { "attributes": { "parser": "accessLog" } }


## Specifying Parsers

You can add a custom parser to a pod in a Kubernetes cluster. You can read more about applying parsers to the Scalyr Agent [here](/help/scalyr-agent#logUpload).

{{% code-tabs %}}
   {{% code-tab "Annotation" %}}
    log.config.scalyr.com/attributes.parser: accessLog
   {{% /code-tab %}}
   {{% code-tab "CLI" %}}
    kubectl annotate pod <pod-name> --overwrite log.config.scalyr.com/attributes.parser=custom-parser
   {{% /code-tab %}}
   {{% code-tab "YAML" %}}
    metadata:
        annotations:
          "log.config.scalyr.com/attributes.parser": "custom-parser"
   {{% /code-tab %}}
{{% /code-tabs %}}


## Excluding Logs

If you would like to prevent a pod from streaming logs to Scalyr, you can specifically exclude (or include) them.

{{% code-tabs %}}
   {{% code-tab "Annotation" %}}
    log.config.scalyr.com/include:  false
    log.config.scalyr.com/exclude:  true
   {{% /code-tab %}}
   {{% code-tab "CLI" %}}
&nbsp;&nbsp;*Command line configuration of log exclusion is not supported.*
   {{% /code-tab %}}
   {{% code-tab "YAML" %}}
    metadata:
       annotations:
          "log.config.scalyr.com/exclude": "true/false"
   {{% /code-tab %}}
{{% /code-tabs %}}



## Sampling High Volume Logs

You can read more about log sampling [here](/help/scalyr-agent#filter).

{{% code-tabs %}}
   {{% code-tab "Annotation" %}}
    log.config.scalyr.com/sampling_rules.0.match_expression: INFO
    log.config.scalyr.com/sampling_rules.0.sampling_rate: 0.1
    log.config.scalyr.com/sampling_rules.1.match_expression: FINE
    log.config.scalyr.com/sampling_rules.1.sampling_rate: 0
   {{% /code-tab %}}
   {{% code-tab "CLI" %}}
    kubectl annotate pod <pod name> --overwrite log.config.scalyr.com/sampling_rules.0.match_expression=INFO
    kubectl annotate pod <pod name> --overwrite log.config.scalyr.com/sampling_rules.0.sampling_rate=0.1
    kubectl annotate pod <pod name> --overwrite log.config.scalyr.com/sampling_rules.1.match_expression=FINE
    kubectl annotate pod <pod name> --overwrite log.config.scalyr.com/sampling_rules.1.sampling_rate=0
   {{% /code-tab %}}
   {{% code-tab "YAML" %}}
    metadata:
       annotations:
          "log.config.scalyr.com/sampling_rules.0.match_expression": "INFO",
          "log.config.scalyr.com/sampling_rules.0.sampling_rate": "0.1",
          "log.config.scalyr.com/sampling_rules.1.match_expression": "FINE",
          "log.config.scalyr.com/sampling_rules.1.sampling_rate": "0"
   {{% /code-tab %}}
{{% /code-tabs %}}

## Attributes

You can specify additional fields in attributes. This allows you to distinguish between different pods. For instance, you might give the pod a field like service: "database" to identify the service that generates this log; you could then add $service = "database" to any query to search only your database logs.

{{% code-tabs %}}
   {{% code-tab "Annotation" %}}
    log.config.scalyr.com/attributes.key: value
   {{% /code-tab %}}
   {{% code-tab "CLI" %}}
    kubectl annotate pod <pod name> --overwrite log.config.scalyr.com/attributes.key=value
   {{% /code-tab %}}
   {{% code-tab "YAML" %}}
    metadata:
       annotations:
          "log.config.scalyr.com/attributes.key": "value"
   {{% /code-tab %}}
{{% /code-tabs %}}

## Redaction/Scrubbing Rules

{{% code-tabs %}}
   {{% code-tab "Annotation" %}}
    "log.config.scalyr.com/redaction_rules.match_expression": "password=[^& ]*"
    "log.config.scalyr.com/redaction_rules.replacement": "userInfo=\\1"
   {{% /code-tab %}}
   {{% code-tab "CLI" %}}
    kubectl annotate pod <pod name> --overwrite log.config.scalyr.com/redaction_rules.0.match_expression=password=[^& ]*
    kubectl annotate pod <pod name> --overwrite log.config.scalyr.com/redaction_rules.0.replacement=userInfo=\\1
   {{% /code-tab %}}
   {{% code-tab "YAML" %}}
    metadata:
       annotations:
          "log.config.scalyr.com/redaction_rules.0.match_expression": "password=[^& ]*"
          "log.config.scalyr.com/redaction_rules.0.replacement": "userInfo=\\1"
   {{% /code-tab %}}
{{% /code-tabs %}}

More on [log redaction](/help/scalyr-agent#filter).

## Renaming

You can rename your log file(s) before they are uploaded to the Scalyr servers (more on [renaming log files](/scalyr-agent#logFileRenaming)).

{{% code-tabs %}}
   {{% code-tab "Annotation" %}}
    log.config.scalyr.com/path=/from_path/from_name.log
    log.config.scalyr.com/rename_logfile=/to_path/to_name.log
   {{% /code-tab %}}
   {{% code-tab "CLI" %}}
    kubectl annotate pod <pod-name> --overwrite log.config.scalyr.com/path=/from_path/from_name.log
    kubectl annotate pod <pod-name> --overwrite log.config.scalyr.com/rename_logfile=/to_path/to_name.log
   {{% /code-tab %}}
   {{% code-tab "YAML" %}}
    metadata:
       annotations:
           "log.config.scalyr.com/path": "/from_path/from_name.log"
           "log.config.scalyr.com/rename_logfile": "/to_path/to_name.log"
   {{% /code-tab %}}
{{% /code-tabs %}}
           

## Not Supported

The following are not currently supported or have limited support in the Kubernetes Agent:

- lineGroupers
- path
- server_attributes

## Mapping Configuration Options

The Kubernetes monitor takes the string value of each annotation that begins with prefix ``log.config.scalyr.com/`` and
maps it according to the following format:

Values separated by a period are mapped to dict keys.  For example, if one annotation on a given pod was
specified as:

      log.config.scalyr.com/server_attributes.tier: prod

Then this would be mapped to the following dict, which would then be applied to the log config
for all containers in that pod:

    { "server_attributes": { "tier": "prod" } }

Arrays can be specified by using one or more digits as the key. For example, if the annotations were:

      log.config.scalyr.com/sampling_rules.0.match_expression: INFO
      log.config.scalyr.com/sampling_rules.0.sampling_rate: 0.1
      log.config.scalyr.com/sampling_rules.1.match_expression: FINE
      log.config.scalyr.com/sampling_rules.1.sampling_rate: 0

This will be mapped to the following structure:

    { "sampling_rules":
      [
        { "match_expression": "INFO", "sampling_rate": 0.1 },
        { "match_expression": "FINE", "sampling_rate": 0 }
      ]
    }

Array keys are sorted by numeric order before processing and unique objects need to have
different digits as the array key. If a sub-key has an identical array key as a previously seen
sub-key, then the previous value of the sub-key is overwritten.

There is no guarantee about the order of processing for items with the same numeric array key,
so if the config was specified as:

      log.config.scalyr.com/sampling_rules.0.match_expression: INFO
      log.config.scalyr.com/sampling_rules.0.match_expression: FINE

It is not defined or guaranteed what the actual value will be (INFO or FINE).

## Specific Containers in a Pod

If a pod has multiple containers and you only want to apply log configuration options to a
specific container, you can do so by prefixing the option with the container name. For example, if you
had a pod with two containers ``nginx`` and ``helper1`` and you wanted to exclude ``helper1`` logs, you
could specify the following annotation:

    log.config.scalyr.com/helper1.exclude: true

Config items specified without a container name are applied to all containers in the pod, but
container specific settings will override pod-level options. In this example:

    log.config.scalyr.com/exclude: true
    log.config.scalyr.com/nginx.include: true

All containers in the pod would be excluded *except* for the nginx container, which is included.

This technique is applicable for all log config options, not just include/exclude.  For
example, you could set the line sampling rules for all containers in a pod, but use a different set
of line sampling rules for one specific container in the pod if needed.

## Dynamic Updates

Currently all annotation config options except ``exclude: true`/`include: false`` can be
dynamically updated using the ``kubectl annotate`` command.

For ``exclude: true`/`include: false`` once a pod/container has started being logged, then while the
container is still running, there is currently no way to dynamically start/stop logging of that
container using annotations without updating the config yaml, and applying the updated config to the
cluster.


## Using ConfigMaps

As detailed below, modifying the configuration of the Scalyr Agent on the fly can be done using a [ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#create-configmaps-from-directories):

1.  [Export your Configuration Files](#export-config)

2.  Make your changes...

3.  [Test your Configuration](#test-config)

4.  [Create your ConfigMap](#create-config)

5.  [Modify your DaemonSet](#modify-daemonset)


## Exporting Configuration Files

You can create a ConfigMap based on an existing Scalyr Agent's configuration.  For example, if you had a test container called ``scalyr-k8s-agent`` running on Docker as a standalone container, you can run the following commands to export its configuration files:

    mkdir /tmp/scalyr-agent-config
    cd /tmp/scalyr-agent-config
    docker exec -i scalyr-k8s-agent scalyr-agent-2-config --export-config - | tar -xz

After these commands finish, your current directory will have one file ``agent.json`` and a directory ``agent.d``. The ``agent.json`` file is a copy of the running Scalyr Agent's ``/etc/scalyr-agent-2/agent.json`` configuration file. Likewise, the ``agent.d`` directory is a copy of the ``/etc/scalyr-agent-2/agent.d`` directory.

**Note:** It's important to run this command on a container based off the scalyr ``/scalyr-k8s-agent`` rather than ``scalyr/scalyr-docker-agent`` in order to have the correct default configuration.

## Testing your Configuration

You can then edit those files to make whatever changes you need and write the changes back to the container for further testing, with this command:

    tar -zc agent.json agent.d/* | docker exec -i scalyr-k8s-agent scalyr-agent-2-config --import-config -

There is no need to restart the Scalyr Agent after writing the configuration files. The running Scalyr Agent should notice the new configuration files and read them within 30 seconds.

## Creating a ConfigMap

After you have configured the Agent and confirmed the configuration changes are working as expected, export the configuration files to your ConfigMap. Changes to this ConfigMap will reflect the global configuration of the DaemonSet pods. You will make most of your changes in the ``agent.d`` directory. To modify the ``agent.json`` configuration file, you can follow the steps provided [here](#agent-json). Since Kubernetes does not yet support recursive ConfigMaps, you will create one ConfigMap for each directory you want to map. 

1.  Start off in the ``/agent.d`` directory. (created when you [exported your configuration](#export-config)) 

    cd /tmp/scalyr-agent-config/agent.d
    
2.  Create the ``agent.d`` ConfigMap: 

    kubectl create configmap scalyr-config-agent-d $(for i in $(find . -type f); do echo "--from-file=\"$i\""; done) -o yaml

3.  View the ConfigMap to make sure your changes were rendered correctly:

    kubectl get configmap scalyr-config-agent-d -o yaml

**Example**: Your ``scaly-config-agent-d`` ConfigMap should look like this:

    data:
      api-key.json: |+
        {
          import_vars: [ "SCALYR_API_KEY" ],
          api_key: "$SCALYR_API_KEY"
        }

      docker.json: |+
        {
          // Whether or not to turn on v2 k8s support.  Note, you need to contact Scalyr to turn this on since
          // it requires also turning in a service-side setting.
          "import_vars": [ "SCALYR_K8S_V2", { "var": "SCALYR_DAEMONSETS_AS_DEPLOYMENTS", "default": "true"} ],

          "monitors":[
            {
              "module": "scalyr_agent.builtin_monitors.kubernetes_monitor",
              "include_deployment_info": "$SCALYR_K8S_V2",
              "report_k8s_metrics": "$SCALYR_K8S_V2",
              "k8s_use_v2_attributes": "$SCALYR_K8S_V2",
              "k8s_use_v1_and_v2_attributes": "$SCALYR_K8S_INCLUDE_V1",
              "include_daemonsets_as_deployments": "$SCALYR_DAEMONSETS_AS_DEPLOYMENTS"
            }
          ]
        }

      scalyr-server.json: |+
        {
          "import_vars": [ { "var": "SCALYR_SERVER", "default": "https://agent.scalyr.com" } ],
          "scalyr_server": "$SCALYR_SERVER"
        }

## Modifying DaemonSet Configurations 

Once you have created your ConfigMaps, it is important to add them to the DaemonSet's configuration.  This can be done as follows:

    spec:
      template:
        spec:
          containers:
            volumeMounts:
            - name: scalyr-config-agent-d
              mountPath: /etc/scalyr-agent-2/agent.d
          volumes:
            - name: scalyr-config-agent-d
              configMap:
                name: scalyr-config-agent-d    

This will write the contents of each of the files in the ``scalyr-config-agent-json`` and ``scalyr-config-agent-d`` ConfigMaps to the volume mounts located in the scalyr-agent-2 configuration directory.

**Note**: If you specify a ConfigMap as a volume mount in your DaemonSet configuration, but you have not yet created that ConfigMap, Kubernetes will not start any pods that require the ConfigMap until it has been created.


## Updating Your ConfigMap

Once you have configured the DaemonSet to use a ConfigMap, and you wish to update the configuration (assuming you are in a directory containing a the files you would like to modify). Scalyr Agent configuration, you can replace the contents of ConfigMap by executing:

    kubectl create configmap <ConfigMap-Name> $(for i in $(find . -type f); do echo "--from-file=\"$i\""; done) -o yaml --dry-run | kubectl replace -f -

The changes will manifest on all nodes running the DaemonSet that are configured to use the ConfigMap, and once the configuration files have changed the Scalyr Agent will automatically detect these changes and start using the new configuration.


## Updating agent.json

In some cases you may want to update your ``agent.json`` file. Since Kubernetes does not support recursive ConfigMaps, the process is to create a second ConfigMap and add it to your DaemonSet configuration.

Steps: 

1. [Export your Configuration files](#export-config)

2. Make your changes

3. [Test your Configuration](#test-config)

4.  Create another ConfigMap with the following command:

    kubectl create configmap scalyr-config-agent-json --from-file=/tmp/scalyr-agent-config/agent.json

5. Append the following to your DaemonSet configuration

    spec:
      template:
        spec:
          containers:
            volumeMounts:
            - name: scalyr-config-agent-json
              mountPath: /etc/scalyr-agent-2
          volumes:
            - name: scalyr-config-agent-json
              configMap:
                name: scalyr-config-agent-json  
                
6.  Verify.

    kubectl get configmap scalyr-config-agent-json -o yaml     
     
Your ``scaly-config-agent-json`` ConfigMap should look something like this:

    data:
    agent.json: |
      {
              // Note:  It is assumed that another file such as `agent.d/api-key.json`
              // will contain the api key for the user's Scalyr account.
              // No need for system and agent monitors.  The k8 plugin will gather
              // metrics on the container running the agent.
              implicit_metric_monitor: false,
              implicit_agent_process_metrics_monitor: false,
              "server_attributes": {
                "hello": "world"
              }
      }

**Note** Comments and other issues with syntax (like empty comments) will affect the way this ConfigMap is written. 

## Creating Custom Configurations

The default Kubernetes configuration file for the Scalyr Agent does the following:

- Creates a DaemonSet running the ``scalyr/scalyr-k8s-agent:latest`` container image (this image is available on Dockerhub).  This image differs from our standard docker container ``scalyr-docker-agent`` in that it has been configured to read the raw container logs from the Kubernetes node rather than relying on syslog or the Docker API.

- Maps ``/var/lib/docker/containers`` of the node to ``/var/lib/docker/containers`` on the ``scalyr-k8s-agent`` container.  This gives the container access to the raw logs from other pods and containers running on that node.

- Exposes your "Write Logs" Scalyr API key to the container in the environment variable ``SCALYR_API_KEY``.  This is required by the default scalyr configuration file of the ``scalyr-k8s-agent`` image.

You can see the full configuration file [here](https://raw.githubusercontent.com/scalyr/scalyr-agent-2/master/k8s/scalyr-agent-2.yaml).


## Creating Custom Docker Images

You can turn on several useful features in the Scalyr Agent by modifying its configuration files. As discussed above, it
is often easier to use the annotation-based configuration options.  However, sometimes you may wish to include your
configuration options by default in your own custom Docker image to ease deployment.  If you wish to take this approach,
 we have provided tools to allow you to easily create new Scalyr Agent Docker images that include your custom configuration files, which you can then run on your Kubernetes cluster.

You can create a test a configuration on a single Docker container and once it is working to your satisfaction, you can use these tools to export the configuration along with a Dockerfile that will build a custom image that uses your custom configuration.

Assuming you have created and tested your configuration changes on a standalone docker container called 'scalyr-agent' (based off the ``scalyr/scalyr-k8s-agent:latest`` image) you can create a custom Docker image based on that configuration by executing the following commands on the currently running container:

    mkdir /tmp/scalyr-agent
    cd /tmp/scalyr-agent
    docker exec -i scalyr-agent scalyr-agent-2-config --k8s-create-custom-dockerfile - | tar -xz
    docker build -t customized-scalyr-k8s-agent .

This will leave a new Docker image on your local Docker instance with the repository tag ``customized-scalyr-k8s-agent``. You can change the name using the docker tag command. From there, you can use any of the standard methods to make this container available to your Kubernetes cluster.

You can launch a DaemonSet that uses the new Scalyr Agent container by changing the ``image`` specified in your Kubernetes config file:

    spec:
      template:
          spec:
            containers:
            - name: scalyr-agent
              image: customized-scalyr-k8s-agent

and then launching the DaemonSet based on the new configuration file

    kubectl create -f my-custom-configuration.yaml


## Testing Custom Configurations Locally

Before deploying a custom Scalyr Agent image to your cluster, it's a good idea to test it locally to make sure there are no configuration errors or problems.

This can be done via Docker with the following command:

    docker run -ti -e SCALYR_API_KEY="$SCALYR_API_KEY" \
      --name scalyr-k8s-agent \
      -v /var/lib/docker/containers:/var/lib/docker/containers \
      -v /var/run/docker.sock:/var/scalyr/docker.sock \
      customized-scalyr-k8s-agent /bin/bash

Which will launch a single container based on your customized image and drop you in to a bash shell.

Make sure to replace ``$SCALYR_API_KEY`` with your scalyr api key (or export it to an environment variable called ``$SCALYR_API_KEY`` before running the above command in order to expose your api key to the container.

Then from the shell prompt you can manually launch the Scalyr agent by executing:

    scalyr-agent-2 start

If everything is configured correctly, you should see a message similar to 'Configuration and server connection verified, starting agent in background.'

Once you can confirm that the scalyr-agent runs correctly and is uploading logs to the Scalyr server, then you are ready to run that container on your Kubernetes cluster.







