---
title: "Docker"
warning: "__Note:__ An *agent monitor plugin* is a component of the Scalyr Agent. 
           If you're using Docker, you don't need to configure this monitor yourself. The Scalyr Agent
           Docker container will automatically import logs from other containers.  See the
           [Scalyr Agent Docker installation instructions](/help/install-agent-docker) for more details."
beforetoc: "The Docker monitor automatically detects all Docker containers running on a given host, and streams stdout and stderr
            for each container to Scalyr."
---


## Sample Configuration

Here is a typical configuration fragment:

    monitors: [
        {   
            module: "scalyr_agent.builtin_monitors.docker_monitor",
            log_mode: "syslog"
        }, {
            module: "scalyr_agent.builtin_monitors.syslog_monitor",
            mode: "docker"
        }
    ]

This runs the Docker plugin configured to collect metrics from all containers running on the same host.  It will use
the recommended ``syslog`` mode to collect logs from the other containers.  Since it is using ``syslog`` to import
logs, you must also configure the ``syslog_monitor`` as well.

Note, in addition to use this configuration, you must also configure the other containers on the hosts to send
their logs to the Scalyr Agent container via the Docker syslog logging plugin. See the
[Scalyr Agent Docker installation instructions](/help/install-agent-docker) for more details.



## Configuration Reference

The Docker monitor has several additional configuration options you can use to change its behavior.

<!--- This is just to keep the table below from becoming unreadable -->
<style>
.td-content td > code {
  white-space: nowrap;
}
</style>


Option                      | Usage
---|---
``module``                  | Always ``scalyr_agent.builtin_monitors.docker_monitor``
``log_mode``                | Optional (defaults to ``docker_api``). Determine which method is used to gather logs from the local containers. If ``docker_api``, then this agent will use the docker API to contact the local containers and pull logs from them.  If ``syslog``, then this agent expects the other containers to push logs to this one using the syslog Docker log plugin.  Currently, ``syslog`` is the preferred method due to bugs/issues found with the docker API.  It is not the default to protect legacy behavior.
``container_name``          | Optional (defaults to None). Defines a regular expression that matches the name given to the container running the scalyr-agent. If this is None, the scalyr agent will look for a container running /usr/sbin/scalyr-agent-2 as the main process.
``container_check_interval``| Optional (defaults to 5). How often (in seconds) to check if containers have been                                       started or stopped.
``api_socket``              | Optional (defaults to /var/scalyr/docker.sock). Defines the unix socket used to                                       communicate with the docker API.   WARNING, if you have `mode` set to `syslog`,                                       you must also set the `docker_api_socket` configuration option in the syslog                                       monitor to this same value.                                       Note:  You need to map the host's ``/var/run/docker.sock`` to                                       the same value as specified here, using the ``-v`` parameter, e.g.                                       ``docker run -v /run/docker.sock:/var/scalyr/docker.sock`` ...
``docker_api_version``      | Optional (defaults to 'auto'). The version of the Docker API to use.  WARNING, if                                       you have `mode` set to `syslog`, you must also set the `docker_api_version`                                       configuration option in the syslog monitor to this same value
``docker_log_prefix``       | Optional (defaults to docker). Prefix added to the start of all docker logs.                                        This is only used if the ``log_mode`` is not ``docker_api``.
``max_previous_lines``      | Optional (defaults to 5000). The maximum number of lines to read backwards from                                       the end of the stdout/stderr logs when starting to log a containers                                        to find the last line that was sent to Scalyr  This is only used if the                                        ``log_mode`` is ``docker_api``.
``readback_buffer_size``    | Optional (defaults to 5k). The maximum number of bytes to read backwards from the                                       end of any log files on disk when starting to log a containers stdout/stderr.                                        This is used to find the most recent timestamp logged to file was sent to Scalyr.                                       This is only used if the``log_mode`` is ``docker_api``.
``metrics_only``            | Optional (defaults to False). If true, the docker monitor will only log docker                                       metrics.
``container_globs``         | Optional (defaults to None). If true, a list of glob patterns for container                                       names.  Only containers whose names match one of the glob patterns will be                                       monitored.  If ``log_mode`` is ``syslog``, this will only affect metric collection.                                       You will need to reconfigure your containers to turn off the syslog logging plugin                                       to stop log collection.
``report_container_metrics`` | Optional (defaults to True). If true, metrics will be collected from the                                        container and reported  to Scalyr.
``use_labels_for_log_config``| Optional (defaults to True). If true, the docker monitor will check each                                        container for any labels that begin with ``com.scalyr.config.*`` and use those                                        labels (minus the prefix) as fields in the containers log_config.  Keys that                                        contain hyphens will automatically be converted to underscores.
``labels_as_attributes``     | Optional (defaults to False). If true, the docker monitor will add any labels                                        found on the container as log attributes, after applying ``label_include_globs``                                        and ``label_exclude_globs``.
``label_include_globs``      | Optional (defaults to ['*']). If ``labels_as_attributes`` is True then this option                                        is a list of glob strings used to include labels that should be uploadeded as                                        log attributes.  The docker monitor first gets all container labels that match                                        any glob in this list and then filters out any labels that match any glob in                                        ``label_exclude_globs``, and the final list is then uploaded as log attributes. 
``label_exclude_globs``      | Optional (defaults to ['com.scalyr.config.*']). If ``labels_as_attributes`` is                                        True, then this is a list of glob strings used to exclude labels from being                                        uploaded as log attributes.  Any label whose key matches any glob on this list                                        will not be added as a log attribute.  Note: the globs in this list are applied                                        *after* ``label_include_globs``
``label_prefix``             | Optional (defaults to ""). If ``labels_as_attributes`` is true, then append this                                        prefix to the start of each label before adding it to the log attributes                       
## Container metrics.

Below is a description of all metrics collected from the running containers by the Scalyr Agent.

All metrics will have a field called ``id`` which will contain the name of the container from which the metric
was collected.

### Network metrics
Metric                    | Description
---|---
---|---``docker.net.rx_bytes``   | Total received bytes on the network interface
``docker.net.rx_dropped`` | Total receive packets dropped on the network interface
``docker.net.rx_errors``  | Total receive errors on the network interface
``docker.net.rx_packets`` | Total received packets on the network interface
``docker.net.tx_bytes``   | Total transmitted bytes on the network interface
``docker.net.tx_dropped`` | Total transmitted packets dropped on the network interface
``docker.net.tx_errors``  | Total transmission errors on the network interface
``docker.net.tx_packets`` | Total packets transmitted on the network interface

### Memory metrics
Metric                                        | Description
---|---
``docker.mem.stat.active_anon``               | The number of bytes of active memory backed by anonymous pages,                                                         excluding sub-cgroups.
``docker.mem.stat.active_file``               | The number of bytes of active memory backed by files, excluding                                                         sub-cgroups.
``docker.mem.stat.cache``                     | The number of bytes used for the cache, excluding sub-cgroups.
``docker.mem.stat.hierarchical_memory_limit`` | The memory limit in bytes for the container.
``docker.mem.stat.inactive_anon``             | The number of bytes of inactive memory in anonymous pages,                                                         excluding sub-cgroups.
``docker.mem.stat.inactive_file``             | The number of bytes of inactive memory in file pages, excluding                                                         sub-cgroups.
``docker.mem.stat.mapped_file``               | The number of bytes of mapped files, excluding sub-groups
``docker.mem.stat.pgfault``                   | The total number of page faults, excluding sub-cgroups.
``docker.mem.stat.pgmajfault``                | The number of major page faults, excluding sub-cgroups
``docker.mem.stat.pgpgin``                    | The number of charging events, excluding sub-cgroups
``docker.mem.stat.pgpgout``                   | The number of uncharging events, excluding sub-groups
``docker.mem.stat.rss``                       | The number of bytes of anonymous and swap cache memory (includes                                                         transparent hugepages), excluding sub-cgroups
``docker.mem.stat.rss_huge``                  | The number of bytes of anonymous transparent hugepages, excluding                                                         sub-cgroups
``docker.mem.stat.unevictable``               | The number of bytes of memory that cannot be reclaimed (mlocked                                                         etc), excluding sub-cgroups
``docker.mem.stat.writeback``                 | The number of bytes being written back to disk, excluding                                                         sub-cgroups
``docker.mem.stat.total_active_anon``         | The number of bytes of active memory backed by anonymous pages,                                                         including sub-cgroups.
``docker.mem.stat.total_active_file``         | The number of bytes of active memory backed by files, including                                                         sub-cgroups.
``docker.mem.stat.total_cache``               | The number of bytes used for the cache, including sub-cgroups.
``docker.mem.stat.total_inactive_anon``       | The number of bytes of inactive memory in anonymous pages,                                                         including sub-cgroups.
``docker.mem.stat.total_inactive_file``       | The number of bytes of inactive memory in file pages, including                                                         sub-cgroups.
``docker.mem.stat.total_mapped_file``         | The number of bytes of mapped files, including sub-groups
``docker.mem.stat.total_pgfault``             | The total number of page faults, including sub-cgroups.
``docker.mem.stat.total_pgmajfault``          | The number of major page faults, including sub-cgroups
``docker.mem.stat.total_pgpgin``              | The number of charging events, including sub-cgroups
``docker.mem.stat.total_pgpgout``             | The number of uncharging events, including sub-groups
``docker.mem.stat.total_rss``                 | The number of bytes of anonymous and swap cache memory (includes                                                         transparent hugepages), including sub-cgroups
``docker.mem.stat.total_rss_huge``            | The number of bytes of anonymous transparent hugepages, including                                                         sub-cgroups
``docker.mem.stat.total_unevictable``         | The number of bytes of memory that cannot be reclaimed (mlocked                                                         etc), including sub-cgroups
``docker.mem.stat.total_writeback``           | The number of bytes being written back to disk, including                                                         sub-cgroups
``docker.mem.max_usage``                      | The max amount of memory used by container in bytes.
``docker.mem.usage``                          | The current number of bytes used for memory including cache.
``docker.mem.fail_cnt``                       | The number of times the container hit its memory limit
``docker.mem.limit``                          | The memory limit for the container in bytes.

### CPU metrics
Metric                                      | Description
---|---
``docker.cpu.usage``                        | Total CPU consumed by container in nanoseconds
``docker.cpu.system_cpu_usage``             | Total CPU consumed by container in kernel mode in nanoseconds
``docker.cpu.usage_in_usermode``            | Total CPU consumed by tasks of the cgroup in user mode in nanoseconds
``docker.cpu.total_usage``                  | Total CPU consumed by tasks of the cgroup in nanoseconds
``docker.cpu.usage_in_kernelmode``          | Total CPU consumed by tasks of the cgroup in kernel mode in                                                       nanoseconds
``docker.cpu.throttling.periods``           | The number of of periods with throttling active.
``docker.cpu.throttling.throttled_periods`` | The number of periods where the container hit its throttling limit
``docker.cpu.throttling.throttled_time``    | The aggregate amount of time the container was throttled in                                                       nanoseconds




