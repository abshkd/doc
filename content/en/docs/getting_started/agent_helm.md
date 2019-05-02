---
title: "K8s Installation via Helm"
weight: 20
notoc: true
warning: "__Note:__ These instructions are for installing the Scalyr Agent chart as a DaemonSet on your Kubernetes cluster. 
<br><br>
To run the agent directly on Linux, Windows, or another container service, see the specific guides to the left.
"
beforetoc: "The Scalyr Agent is a [open source daemon](https://github.com/scalyr/scalyr-agent-2) that uploads logs and system metrics to Scalyr.
"
---

For Kubernetes, we find it works best if you set it up as a DaemonSet that runs a dedicated pod on each node in your cluster to collect logs and metrics from all other pods 
running on the same node. 


To install the Scalyr Agent chart with the release name ```my-release``` via Helm: 

    helm install --name my-release  --set api.config.scalyr=YOUR-KEY-HERE stable/scalyragent


Note that this will run the agent on the master node. To change this, 
comment out the following in https://github.com/scalyr/scalyr-agent-2/blob/master/k8s/scalyr-agent-2.yaml:

```
# comment out this section if you do not want to run on the master
      tolerations:
      - key: "node-role.kubernetes.io/master"
        operator: "Exists"
        effect: "NoSchedule"
```

