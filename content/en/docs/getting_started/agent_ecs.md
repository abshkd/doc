---
title: "Amazon ECS"
weight: 40
---

@class=bg-warning docInfoPanel: These instructions are for installing the Scalyr Agent in an [Amazon EC2 Container Service (ECS)](https://aws.amazon.com/ecs/{target=_blank}) container. 
The agent is deployed on EC2 instance(s) of the ECS container. Behind the scenes, a docker container will run on the EC2 instance(s) of the ECS container.
If you would like to run the Docker container yourself on an machine, see the [Docker installation page](/help/install-agent-docker{target=_blank}).
If you plan to run the Agent directly on Linux, see the [Linux installation page](/help/install-agent-linux{target=_blank}). For
Windows, see the [Windows installation page](/help/install-agent-windows{target=_blank}).


## Overview

Our recommended approach to ECS integration is to run the Scalyr Agent on every EC2 instance
and have the local containers transmit their logs to it using the Docker ``syslog`` driver.  To implement
this approach, you will need to create a task definition to run the Scalyr Agent in a container on each
of your EC2 instances, as well as modify existing task definitions to transmit their logs via
``syslog``. 

By default, this integration transmits your containers' ``stdout`` and ``stderr`` logs. 
If, for some reason, your other containers cannot send the logs to syslog, or you want logs other than 
``stderr`` and ``stdout``, please refer to [Mounting Log Volumes](#mounting-log-volumes) that tells you how to create mount points in your existing container so that the Scalyr Agent container can access it.

The steps are:

1. Create the Scalyr Agent [Task Definition](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html{target=_blank}).

2. Run the Scalyr Agent using that task definition on existing ECS instances.

3. Configure new EC2 instances with the "User Data" to automatically start the Scalyr Agent on start-up.


### Create the Scalyr Agent Task Definition

To launch the Scalyr Agent as a task, you will need to provide it a ``scalyr_api_key`` that both identifies and authenticates your account. 

Your ``scalyr_api_key`` is:

    [[[apiTokenAndServerJsonInstructions]]]

You can pass the ``scalyr_api_key`` as an Environment Variable in the Task Definition template (give below).

Use the following JSON for the task definition:


    {  
       "networkMode":"bridge",
       "taskRoleArn":null,
       "containerDefinitions":[  
          {  
             "memory":500,
             "extraHosts":null,
             "dnsServers":null,
             "disableNetworking":null,
             "dnsSearchDomains":null,
             "portMappings":[  
                {  
                   "hostPort":601,
                   "containerPort":601,
                   "protocol":"tcp"
                }
             ],
             "hostname":null,
             "essential":true,
             "entryPoint":null,
             "mountPoints":[  
                {  
                   "containerPath":"/var/scalyr/docker.sock",
                   "sourceVolume":"var_run_docker_sock",
                   "readOnly":null
                }
             ],
             "name":"scalyr-docker-agent",
             "ulimits":null,
             "dockerSecurityOptions":null,
             "environment":[  
                {
                  "name": "scalyr_api_key",
                  "value": <YOUR scalyr_api_key>
                }
    
             ],
             "links":null,
             "workingDirectory":null,
             "readonlyRootFilesystem":null,
             "image":"scalyr/scalyr-docker-agent", // or your own custom repo address  <aws account id>.dkr.ecr.us-east-1.amazonaws.com/custom-scalyr-cocker-agent:latest for custom ECR repo
             "command":null,
             "user":null,
             "dockerLabels":null,
             "logConfiguration":{  
                "logDriver":"syslog",
                "options":{  
                   "syslog-address":"tcp://127.0.0.1:601"
                }
             },
             "cpu":15,
             "privileged":null,
             "memoryReservation":null
          }
       ],
       "volumes":[  
          {  
             "host":{  
                "sourcePath":"/var/run/docker.sock"
             },
             "name":"var_run_docker_sock"
          }
       ],
       "family":"scalyr-agent"
    }


You may wish to change the ``agent.json`` (to specify parsers, create redaction rules etc), in which case, you may want to [create your own Docker Image and upload it to ECR](#creating-and-uploading-custom-image{target=_blank}).

## Run the Scalyr Agent Task on Existing Instances

Once the task definition is created, you can run the task by AWS Console by going to:

    ECS > Clusters > your cluster > Tasks > Run task > Scalyr Agent task

Or you can choose to use the [AWS CLI](http://docs.aws.amazon.com/cli/latest/reference/ecs/start-task.html{target=_blank})

To have all instances transmit their logs to Scalyr, choose the option to run "One task per instance" with the total number of tasks as the total number of EC2 instances in the cluster. This will guarantee one Scalyr Agent running on each EC2 instance in the cluster.

### Verify the Scalyr Agent is running:

Go to the AWS Console: 

    ECS > Clusters > your cluster > Tasks
 
 and verify the Scalyr Agent task is in the ``RUNNING`` state on all of your existing instances.

*Debugging information:*  If the Scalyr Agent task is not running, you can perform the following steps to investigate:

    1. docker ps -a
    2. Get the Scalyr Agent container ID
    3. docker exec -it <scalyr agent container id> /bin/bash (this should get you inside the agent container)
    4. Check out the `/var/log/scalyr-agent-2/agent.log` to see the debugging information.
	

## Running Scalyr Agent on EC2 Startup

Whenever you create an EC2 instance for the ECS cluster, you can configure it to start a Scalyr Task by adding a script to the ``User Data`` configuration.

### Choose ECS AMI
Go to AWS Console:

    EC2 > Launch Instance > Community AMIs   

and choose one of the [ECS supported EC2 instances.](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_container_instance.html{target=_blank})

Make sure the instance has the [updated ECS Agent](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/agent-update-ecs-ami.html{target=_blank})

### Verify the IAM Role

Select the IAM role you will normally use (default role ``ecsInstanceRole``). Make sure the IAM role's attached policy has ``ecs:StartTask`` allowed.

### Configure the User Data 

Expand the ``Advanced Details`` section and paste the following in the ``User Data`` section:

    #!/bin/bash
    cluster="<your_cluster_name>"
    echo ECS_CLUSTER=$cluster >> /etc/ecs/ecs.config
    start ecs
    yum install -y aws-cli jq
    instance_arn=$(curl -s http://localhost:51678/v1/metadata | jq -r '. | .ContainerInstanceArn' | awk -F/ '{print $NF}' )
    az=$(curl -s http://instance-data/latest/meta-data/placement/availability-zone)
    region=${az:0:${#az} - 1}
    task="scalyr-agent"
    echo "cluster=$cluster az=$az region=$region aws ecs start-task --cluster $cluster --task-definition $task --container-instances $instance_arn --region $region" >> /etc/rc.local

*Don't forget to replace the user data with your specific values.* This script will start the instance with the Scalyr Agent on start and reboot.

## Configure other containers to send logs to Scalyr

Configure other containers to send their logs to Scalyr via the Scalyr Agent container. For your existing containers, you need to make sure their task definitions have the ``logConfiguration`` option set to send the logs to ``syslog``

Update your existing containers' task definition with the following:


    {
      "logConfiguration": {
        "logDriver": "syslog",
        "options": {
          "syslog-address": "tcp://127.0.0.1:601"
        }
      }
    }


Restart the existing tasks. Your containers should be ending the logs to the Scalyr Agent Container.


## That's It!

We hope that was easy. If you've had any trouble, please [let us know](mailto:support@scalyr.com).
Otherwise, if this is your first time using Scalyr, this would be an excellent time to head on to the
[Getting Started guide](/help/getting-started{target=_blank}).

You should also check out the [Log Parsing](/help/parsing-logs) page to set up a parser for your logs. Scalyr becomes
an even more powerful tool for analysis and visualization when your logs are properly parsed.

For complete documentation on agent configuration options, see the [agent reference](/help/scalyr-agent).

For more details on [creating custom images with your configuration files](help/install-agent-docker#custom-images), [modifying the configuration
files in the agent](help/install-agent-docker#modify-config), [setting a server host name](help/install-agent-docker#setting-serverHost), [assigning parsers](help/install-agent-docker#setting-parsers), 
etc, read on...


furtherReading: <Further Reading>
## Further Reading


creating-and-uploading-custom-image: <Creating and Upload Custom Docker Image>
### Creating Custom Docker Image and upload it to ECR

You may wish to customize the Scalyr Agent Docker image by modifying the ``agent.json`` configuration file. You will need to modify the configuration file in order to specify parsers for your logs files, add redaction / sampling rules, and run custom plugins.

Information about creating custom Docker images can be found [here](/help/install-agent-docker#custom-images).

Once the image is created, you can distribute that image to either your Docker Hub, or AWS EC2 Constainer Registry (ECR). This will help you orchestrate the Scalyr Agent via ECS.

Update the Scalyr Agent task definition with the custom image eg:


    {
      "image": "aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/custom-scalyr-cocker-agent:latest"
    }


Once you have built a docker image, go to 

  AWS Console > ECS > Respositories

1. If you have don't have an existing repository where you would like to push this Docker Image, create one, and name it the same as the tag name ``customized-scalyr-docker-agent`` or anything you provided while building the image. 

2. Once the repository is created, click on the ``View Push Commands`` and a pop-up will appear with the CLI commands and instructions on how to push your image to the ECR repository.

mounting-log-volumes: <Mounting Log Volumes>

### Mounting Log Volumes

Imagine your ECS cluster has an [nginx](https://github.com/awslabs/ecs-nginx-reverse-proxy/tree/master/reverse-proxy{target=_blank}) task or service running. By default, Scalyr only updates the ``stdout`` and ``stderr`` logs from the container.  However, nginx
writes its access log to ``/var/log/nginx/host.access.log`` in its own container.  In order to have
Scalyr upload that log, you will have to perform some extra steps.

To send these logs to the Scalyr Agent container, you will need to make a logical volume in your container to have them accessible to the agent. This can be achieved by modifying the task definition of your running containers.

eg. your running nginx task writes the access logs to  ``/var/log/nginx/host.access.log`` and you would like to send these logs to the Scalyr Agent container, you will need to create data volumes in the nginx task definition.

1. In the task definition of the Scalyr Agent **and** your existing containers' ``volumes`` section, define a data volume with ``name`` and ``sourcePath`` values.

    {
      "volumes": [
        {
          "name": "nginx-log-vol",
          "host": {
            "sourcePath": "/var/log/nginx"
          }
        }
      ]
    }

2. In the ``containerDefinitions`` section, define a container with ``mountPoints`` that reference the name of the defined volume and ``containerPath`` value to mount the volume at on the container.

        
    "mountPoints": [
      {
          "sourceVolume": "nginx-log-vol",
          "containerPath": "/var/log/nginx"
      }
    ]
    
3. Update the ``agent.json`` to include the path to the log file:

    "logs": [
      {
        "path": "/var/log/nginx",
        "attributes": {"parser": "appLog"}
      }
     ]

4. [Create your own Docker Image and upload it to ECR](#creating-and-uploading-custom-image{target=_blank}).

5. Restart the Scalyr Agent task with the new logical volumes mounted.

6. Restart your existing container task(s) with the new logical volumes mounted.

You can verify the volume has been mounted by SSH'ing into the EC2 instance of the host and see the logs directory ``/var/log/nginx`` (or other volume you want to mount) mounted.
