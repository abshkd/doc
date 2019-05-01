---
title: "K8s via Helm"
weight: 20
---

install: <Install Scalyr Agent (Kubernetes via Helm)>
# Install Scalyr Agent (Kubernetes via Helm)

@class=bg-warning docInfoPanel: This document describes the recommended method for importing logs from a Kubernetes cluster to Scalyr.

@class=bg-warning docInfoPanel: These instructions are for installing the Scalyr Agent as a DaemonSet on your Kubernetes cluster. If you plan to run the Agent directly on Linux, see the [Linux installation page](/help/install-agent-linux). For Windows, see the [Windows installation page](/help/install-agent-windows), and for running the Agent separately in a Docker container, see the [Docker installation page](/help/install-agent-docker).

The Scalyr Agent is a daemon that uploads logs and system metrics to the Scalyr servers. This page provides streamlined instructions to get you up and running quickly in a Kubernetes environment.

In our recommended architecture, you will run the Scalyr Agent as a DaemonSet on your cluster. The DaemonSet runs a Scalyr Agent pod on each node in your cluster that will collect logs and metrics from all other pods running on the same node. Note that this will run the agent on the master node; if you do not want to run the agent on the master, comment the following in https://github.com/scalyr/scalyr-agent-2/blob/master/k8s/scalyr-agent-2.yaml:

To install the agent chart with the release name my-release via Helm: 

    helm install --name my-release  --set api.config.scalyr=YOUR-KEY-HERE stable/scalyragent

## That's It!

We hope that was easy. If you've had any trouble, please [let us know](support@scalyr.com). Otherwise, if this is your first time using Scalyr, this would be an excellent time to head on to the [Getting Started guide](/help/getting-started).

You should also check out the [Log Parsing](/help/parsing-logs) page to set up a parser for your logs. Scalyr becomes an even more powerful tool for analysis and visualization when your logs are properly parsed.

For complete documentation on agent configuration options, see the [agent reference](/help/scalyr-agent).
