---
title: "Creating a Scalyr Agent Plugin"
---

# Creating an Agent Plugin

intro: <Introduction>
## Introduction

The Scalyr Agent can be extended with plugin modules, called agent plugins. A plugin is a Python module that
executes within the Scalyr Agent process, and gathers information to be uploaded to the Scalyr servers.

In this document, we will describe how you can write and run your own agent plugin. A plugin can be as simple as
a few lines of code.

@class=bg-warning docInfoPanel: Creating your own agent plugins is not yet supported on Windows.  Please
e-mail support@scalyr.com for more information and expected completion date.

setting-up: <Setting up your environment>
## Setting up your environment:

To develop an agent plugin, we strongly recommend you work on a machine that does not already have the Scalyr Agent
installed. This avoids any possible confusion as to which version of the agent code you are working with. You can use
``pip`` and ``virtualenv`` to set up your development environment.

If you would prefer to either use ``git`` to clone the Scalyr Agent source code, or develop against the Scalyr Agent
package already installed on your machine, please see the [Alternate Setup Instructions](#alternate-setup) at the bottom
of this page.

If you do not have ``pip`` and ``virtualenv`` installed on your machine, please see the
[pip install instructions](http://pip.readthedocs.org/en/latest/installing.html)
and the [virtualenv install instructions](http://virtualenv.readthedocs.org/en/latest/virtualenv.html#installation).

First, create a directory to hold your new agent plugin (for now):

    mkdir ~/my-plugin
    cd ~/my-plugin

Next, use ``virtualenv`` to create a development environment where you can install the Scalyr Agent Python package
locally:

    virtualenv ENV
    source ENV/bin/activate
    
Install the Scalyr Agent Python package:

    pip install scalyr-agent-2
    
You may optionally test that your environment is set up by running a test plugin:

    python -m scalyr_agent.run_monitor scalyr_agent.builtin_monitors.test_monitor

If everything has been set up correctly, you should see lines being written to stdout containing the results of picking
numbers from uniform and gaussian distributions.

defining-plugin: <Defining the agent plugin>
## Defining the agent plugin
Next, you need to actually create your plugin.  You can use ``test_monitor.py`` as a starting point.  This file should 
be located in the ``builtin_monitors`` directory in the ``scalyr_agent`` package installed in your local environment.
  Generally, this is ``ENV/lib/python*/site-packages/scalyr_agent/builtin_monitors``.

There are a few important considerations when creating your plugin:

- Each Python module can only contain one Scalyr agent plugin
- Your plugin must be implemented as a class that derives from ScalyrMonitor
- An instance of your class is created for each reference to your plugin in the config.
- Each agent plugin instance will run in its own thread.
- All output must be recorded using the provided Logger instance, not stdout or stderr.
- All metrics values reported by your agent plugin will be written to a metric log filed shared by all instances of
  your agent plugin.
- All diagnostic and error messages reported by your agent plugin will be written to the main agent log file.
- The instance will be used until the config changes (by the user editing it).

To better illustrate how a plugin is written, let’s give an example of a fully working plugin and then go into details
about the ``ScalyrMonitor`` class and its interface down below.  For this example, we will create a file
``~/my-plugin/random_coin_monitor.py`` with the following contents:


    import random

    from scalyr_agent import ScalyrMonitor

    class RandomCoinMonitor(ScalyrMonitor):
        def _initialize(self):
            self.__counter = 0
            # Read two optional config fields.  You may also create a required
            # configuration  field by supplying the argument
            # ‘require_field=True’.  Then, if the user does not supply the
            # field in the monitor’s configuration, an exception will be raised.
            self.__gauss_mean = self._config.get('gauss_mean', 
                                                 default=0.5,
                                                 convert_to=float,
                                                 min_value=0,
                                                 max_value=10)
            self.__gauss_stddev = self._config.get('gauss_stddev',
                                                   default=0.25,
                                                   convert_to=float,
                                                   min_value=0,
                                                   max_value=5)


        def gather_sample(self):
            self.__counter += 1
            self._logger.emit_value('uniform', random.random(),
                                    extra_fields={'count': self.__counter})
            self._logger.emit_value('gauss', random.gauss(self.__gauss_mean,
                                                          self.__gauss_stddev),
                                    extra_fields={'count': self.__counter})

This plugin, when run, will record two metrics every sample interval, one based a uniform coin flip between 0 and 1,
and another based on a gaussian distribution with an expected mean of 0.5.  It will also keep a count of how many
samples it has recorded, including that count in the reported metrics.

### The ScalyrMonitor class

As you can probably guess, the ``ScalyrMonitor`` class is responsible for invoking the ``gather_sample`` method once per
sample interval.  It also provides several important instance variables that derived classes can use.

You can read the full documentation for ``ScalyrMonitor`` in the 
``ENV/lib/python*/site-packages/scalyr_agent/scalyr_monitor.py`` file, but let’s go over a few of the important methods
here.

Important ScalyrMonitor methods:

||| Method            ||| Description |||
||| ``_initialize``   ||| Invoked during instance initialization.  Derived classes may optionally override this method \
                          to initialize instance variables.  Additionally, derived classes may verify the configuration \
                          parameters for  the plugin as read from the config file is valid (stored in \
                          ``self._config``).  This method should throw an Exception if the config is not valid. \
                          Overriding this method is suggested as an alternative to overriding the base  ``__init__`` \
                          method. |||
||| ``run``           ||| Invoked to run the plugin.  The default implementation will invoke ``self.gather_sample`` \
                          once every sample interval. Most plugins will not need to override this method, but they may \
                          do so.  This method is invoked on a separate thread for each agent plugin instance. |||
||| ``gather_sample`` ||| The default implementation of ``self.run`` will invoke this method once every sample \ 
                          interval.  The derived classes are expected to override this method and perform any metric \
                          reporting required by the plugin. |||

As the example above illustrated, your plugin implementation will heavily rely on the instance variables defined by the
``ScalyrMonitor`` class.

Listed below are important ``ScalyrMonitor`` instance variables that can be used by derived classes:

||| Instance variable         ||| Description |||
||| ``_config``               ||| A ``MonitorConfig`` instance containing the entry for this agent plugin instance \
                                  in the “monitors" section of the configuration.  This object works much like a \
                                  ``dict`` but has extra functionality to help Monitor developers validate \
                                  configuration options.  See documentation for the ``MonitorConfig.get`` method in \
                                  ``scalyr_monitor.py`` for more details or see the example above. \
                                  The standard configuration fields for each monitor instance are “module” and “id”, \
                                  but you may use any other field to allow users to provide configuration options \ 
                                  specific to your plugin.  Generally, ``_config`` should be read during \
                                  initialization and if it is invalid, throw an Exception explaining the error.  The \
                                  ``get`` method can perform validation and will throw an appropriate Exception if \
                                  needed. |||
||| ``_logger``               ||| The ``logging.Logger`` instance to use to report errors and, more importantly, \
                                  metrics to Scalyr.  All records created with INFO or higher will be sent to Scalyr. \
                                  This ``_logger`` is specific to this agent plugin instance and should be used only \
                                  for the metrics and messages  generated by it. |||
||| ``_sample_interval_secs`` ||| The number of seconds between calls to ``gather_sample``.  This may be overridden by \
                                  the derived class during initialization.  This defaults to 30 seconds, but when run \
                                  by the ``run_monitor`` script (for testing) it is set to 5 seconds. |||
||| ``log_config``            ||| A ``dict`` containing the entry that determines how the metric log generated by this \
                                  agent plugin instance will be copied to Scalyr.  This has the same fields as the \
                                  entries in the “logs” section in the configuration.  This may be modified by the \
                                  derived class during initialization to change the configuration. \
                                  For example, this can be used to add in additional ``attributes`` to every metric \
                                  line copied to Scalyr, such as the parser to use.  You may also use this to change \
                                  the path of where the metric log will be written if the default does not suit your \
                                  needs. |||
||| ``disabled``              ||| Whether or not the plugin should be run.  This can be modified during initialization \
                                  by the derived class to disable plugins that should not be run. |||


### The AgentLogger class
We have defined our own logging class derived from ``logging.Logger`` named ``AgentLogger``.  This class has several
important features that you should be aware of as developer.  First, it provides an additional method for reporting
metric values.  You should use this method if possible because it will emit your metric in a standard format that can
be parsed by the Scalyr servers.  Otherwise, you will have to define your own parser on the Scalyr servers.

The method for reporting metrics is ``emit_value`` and has the following arguments:

||| Method argument          ||| Description |||
||| ``metric_name``          ||| The name of the metric to report.  It must start with a letter and can only contain \
                                  alphanumeric characters, periods, and underscores.  |||
||| ``metric_value``         ||| The value for the metric.  Only int, long, float, boolean, str, and unicode are \
                                 allowed. |||
||| ``extra_fields``         ||| An optional ``dict`` that if specified, will be included as extra fields on the \
                                 logged line.  These fields can be used in future searches/graphs expressions to \
                                 restrict which specific instances of the metric are matched/aggregated together. \
                                 The keys for the ``dict`` must be str and the only allowed value types are int, long, \
                                 float, str, bool, and unicode. |||
||| ``monitor``              ||| The monitor instance reporting the metric.  This defaults to the monitor the logger \
                                 belongs to, so you typically will not need to supply it yourself. |||


## Testing the agent plugin
You must use the ``run_monitor.py`` tool to run your agent plugin by itself for testing and debugging purposes.  It
creates and initializes the plugin instance in the same way Scalyr Agent will, and sends all output (both metric and
diagnostic) to stdout rather than to a log file.  To speed up testing, it changes the sample interval time from 30 secs
to 5 secs.  It also has options to control the configuration to pass into the plugin instance as well as control the
sample interval.

Here’s how we would use it to test our plugin:

    python -m scalyr_agent.run_monitor random_coin_monitor
    
The output will look something like this:

    2014-07-29 20:22:06.789Z INFO [monitor:random_coin_monitor()] [scalyr_monitor.py:158] Starting monitor
    2014-07-29 20:22:06.789Z [random_coin_monitor()] uniform 0.982530747431 count=1
    2014-07-29 20:22:06.789Z [random_coin_monitor()] gauss 1.07020127799 count=1
    2014-07-29 20:22:11.790Z [random_coin_monitor()] uniform 0.730115799546 count=2
    2014-07-29 20:22:11.790Z [random_coin_monitor()] gauss 0.340942612923 count=2

You can use Control-C to stop the process.

If you wish to change the Monitor configuration passed to your instance, you may supply a string containing a JSON 
object with the desired configuration.  Here’s an example where we set the monitor’s id and supply a custom ``foo``
option:

    python -m scalyr_agent.run_monitor -c "{ gauss_mean:8.5 }" random_coin_monitor
    
There also are options to change the sampling interval as well as the Python path use to locate plugins.  
Run ``python -m scalyr_agent.run_monitor -h`` for more details.

deploying: <Deploying your plugin>
## Deploying your plugin
To deploy your agent plugin, you simply have to install it into a location where Scalyr Agent will look for it and
then add appropriate entries to the “monitors” section of your configuration file.

You may place your module in ``/usr/share/scalyr-agent-2/local/monitors``.  This path is always included in the Python
search path when locating plugins.

Alternatively, you may make your own directory to hold your custom plugins, and then include the path to your directory
in the ``additional_monitor_module_paths`` in your configuration file.  This is a string that specifies additional paths 
to search for modules beyond the default locations.  It defaults to empty string.     It can contain multiple paths, 
separated by the system specific path separator (colon for Unix, semi-colon for Windows).  Note, the ``PYTHONPATH``,
the Scalyr Agent package, the local monitor path, and the contrib monitor path are always searched.

Be sure to set the permissions on your files such that they can be read by the user running the Scalyr Agent process.

To actually run the agent plugin, you simply have to add a new entry to the “monitors” section in your config.  In our
example, we would add the following:

    {
    …
       monitors: [ { 
           module: "random_coin_test",
           gauss_mean: 8.5,
           gauss_stddev: 5.0
       }]
    …
    }
    
You should not have to restart the agent to have the new agent to begin running.  The change should be noticed in 30
seconds.  However, if you have changed the contents of your Python module, you may wish to restart the agent to ensure
the changes the Python files are picked up.

suggestions: <Suggestiongs for writing plugins>
## Suggestions for writing agent plugins

Here are are a few tips on writing high quality plugins that can be easily reused by other Scalyr customers.

- Minimize your dependencies on non-standard libraries.  Scalyr customers should not need to use 'pip' to install
  other Python packages to run your plugin.  If you require a pure Python library, see if it can be included in the
  third-party directory in the Scalyr Agent package.
- Make sure your plugin can run using Python 2.4 or greater.  Many Scalyr customers monitor older systems that only
  support 2.4.  Of course, if your plugin is monitoring something that would not be one these older systems, you
  may chose to not follow this rule.
- Perform as much verification as you can during the ``_initialize`` method.  This is the only
  plugin method that will be run before the daemon process is forked in the background (when starting the agent
  from the commandline).  If you need to communicate an error message, this is the best time to do it since it will
  be shown to the user on stdout and it will prevent the agent from starting.  Typically, you should be checking for
  errors that will not correct themselves without the user modifying the configuration file, such as an invalid
  configuration option or that your plugin cannot run on the current platform.  Errors that may correct over time
  (such as a server being temporarily unavailable) do not need to be reported.
- Anticipate common error scenarios and report clear error messages that also suggest what the user may
  do to fix the problem.  For example, if your plugin is connecting to a local server to fetch pages and
  it returns a permission denied message, your error message should recommend that the user needs to change
  their server configuration to allow access to that page.

design: <Import design considerations>
## Important design considerations

Here are some items you should consider as you design and implement your agent plugin.

### Security

All plugins are run in the Scalyr Agent process, which means that, by default, the plugin code will be executing
commands as ``root``.  Care should be taken to only run plugins that you trust.  Since you must explicitly reference a
plugin in your config to run it (except for a few Scalyr-provided builtin in plugins), you should have clear visibility
as to what you are trusting.

### Log volume

Every log line and metric generated by your plugin will be sent to the Scalyr servers.  You should take care to not
log excessive, unimportant information since it does consume your allowed log volume.  The ``AgentLogger`` class does have
a rate limiter built into it to prevent excessive log, especially in the case of improperly behaving monitors.

### Agent stability

Since the agent plugins are running in the same process as Scalyr Agent, any problems with the monitors that cause
the entire Python process to crash or exit will stop your agent from working.  Scalyr Agent does not to isolate the
effects of monitors from one another by executing them in their own threads and catching thrown exceptions, but it
cannot isolate all things.

alternate-setup: <Alternate Setup Instructions>
## Alternate Setup Instructions

### Using git

If you plan on submitting your plugin to Scalyr for other customers to use or plan on building your own Scalyr Agent
RPM or Debian packages, you may wish to develop directly out of the Scalyr Agent source code.  You can do this by
cloning the public ``scalyr-agent-2`` repository and adding your own plugin source code.

First, clone the ``scalyr-agent-2`` repository:

    cd ~/
    git clone https://github.com/scalyr/scalyr-agent-2.git --branch release
    
Next, add the source tree to your ``PYTHONPATH``.  The instructions to do this will be platform and shell dependent,
but for Linux running bash, you just need to execute:

    export PYTHONPATH=$PYTHONPATH:~/scalyr-agent-2/
 
You can then add your plugin to either the ``~/scalyr-agent-2/monitors/contrib`` or ``~/scalyr-agent-2/monitors/local``
directory.  The ``contrib`` directory should be used for plugins you plan on submitting to Scalyr.  The ``local``
directory should be used if the plugin is just for your own use.  If you use the ``build_package.py`` script, any
plugin you place in the ``local`` directory will be included in your built RPM or Debian package.

You may follow the rest of the instructions on how to build your plugin from above, just substituting the ``contrib``
or ``local`` directory for ``~/my-plugin`` in the instructions.

### Using already installed Scalyr Agent package

If you are developing on a machine that has the Scalyr Agent package already installed on it (because you installed
the RPM or Debian packages) then you can directly use that package instead of installing it again.  

You simply have to set the ``PYTHONPATH`` to include the ``scalyr-agent-2/py`` directory, where ever that is installed
on your machine.

For packages installed using RPM or Debian, it will be located in ``/usr/share/scalyr-agent-2/py``:

    export PYTHONPATH=$PYTHONPATH:/usr/share/scalyr-agent-2/py

For packages installed using the tarball method, it will be located in ``~/scalyr-agent-2/py``:

    export PYTHONPATH=$PYTHONPATH:~/scalyr-agent-2/py
    
You may follow the rest of the instructions from above, including creating a ``~/my-plugin`` directory to hold
your plugin.


  
