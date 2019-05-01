---
title: "Java API"
---

# Java API

The raw [Scalyr API](/help/api) allows you to send and retrieve log data directly 
from Scalyr servers, query log events, and manage configuration files. Our Java library provides convenient access to 
all of these capabilities, as well as several higher-level services:

- Log structured events, with automatic batching
- Issue queries to retrieve logs and numeric data
- Record JVM statistics
- Scalyr Knobs -- use Scalyr configuration files to manage your own services

For other languages, use the raw (HTTP) API or our [command-line tool](/help/command-line).

For logging from Java, we also provide a [logback](http://logback.qos.ch/) appender. This allows any log4j or
logback-based code to send logs directly to Scalyr. See https://github.com/scalyr/scalyr-logback for instructions.

Complete method documentation can be found in the [JavaDoc](https://www.scalyr.com/javadoc/index.html?overview-summary.html).


setup: <Project Setup>
## Project Setup

Download the Java client library, and add it to your project. Source code and README can be found at: 
https://github.com/scalyr/Scalyr-Java-Client

Next, insert code to initialize the library:

    import com.scalyr.api.logs.*;
    
    ...
    
    int maxBufferRam = 4 * 1024 * 1024;
    Events.init("[[[writeLogsToken]]]", maxBufferRam);

This code should be executed as early as possible in your startup flow. maxBufferRam specifies
a limit to the amount of memory that will be used by the Scalyr library for events awaiting
upload to the server. If this value is too small compared to the rate at which you generate
events, events may occasionally be discarded.

By default, Scalyr will associate all log messages with the server's hostname. If you are running in an
environment where the hostname is not stable or meaningful, such as an auto-scaling or PaaS platform,
you can override the hostname by adding an extra parameter for Events.init:

    Events.init("[[[writeLogsToken]]]", maxBufferRam, null,
         new EventAttributes("serverHost", "frontend-1")
    );

Whatever value you specify after "serverHost" will be used as the hostname.


logging: <Logging Events>
## Logging Events

Logging events through the API is simple. Here are some examples:

      Events.info(new EventAttributes("message", "Hello, world!"));
    
      Events.warn(new EventAttributes(
          "tag", "loginFailed",
          "sourceIp", "...",
          "username", "..."));
      Span span = Events.startInfo(new EventAttributes(
          "tag", "displayImage",
          "imageId", "..."));
      ...
      Events.fine(new EventAttributes("imageSize", ...);
      ...
      Events.end(span);

Events are uploaded to the Scalyr servers after a short buffering delay, on the order of 5 seconds.
If your program is short-lived (e.g. a command-line tool or unit test), you may wish to call

``Events.flush()`` before termination, to ensure that all events are uploaded.


queryLogs: <Querying Logs>
## Querying Logs

To query log data, use the QueryService class: https://www.scalyr.com/javadoc/com/scalyr/api/query/QueryService.html.

Here is a simple example that will print all log messages in the last 24 hours that contain the text 'img/png'
(up to a limit of 1000 messages):

    QueryService queryService = new QueryService("[[[readLogsToken]]]");
    LogQueryResult result = queryService.logQuery("'image/png'", "24h", null,
        1000, PageMode.head, null, null);
    System.out.println(result.toString());


numericQuery: <Numeric Queries>
## Numeric Queries

Use numeric queries to retrieve numeric data, e.g. for graphing. You can count the rate of events matching
some criterion (e.g. error rate), or retrieve a numeric field (e.g. response size).
Numeric queries use the QueryService class: https://www.scalyr.com/javadoc/com/scalyr/api/query/QueryService.html.

Here is a simple example that will print the average rate per second, over the last 24 hours, of
log messages that contain the text 'img/png':

    QueryService queryService = new QueryService("[[[readLogsToken]]]");
    NumericQueryResult result = queryService.numericQuery("'image/png'", "rate",
        "24h", null, 1);
    System.out.println(result.values.get(0));

If you will be executing a query frequently, you should define a timeseries for it. Note that this operation
requires a "Write Configuration" API token, stronger than the "Read Logs" token rqeuired for queries:

    QueryService queryService = new QueryService("[[[configWriteToken]]]");
    CreateTimeseriesResult result = queryService.createTimeseries("'image/png'", "rate");
    System.out.println("Timeseries ID: " + result.timeseriesId);

You can then issue the same query more efficiently using the timeseries:

    QueryService queryService = new QueryService("[[[readLogsToken]]]");
    
    TimeseriesQuerySpec querySpec = new TimeseriesQuerySpec();
    querySpec.timeseriesId = "...timeseries ID from createTimeseries call...";
    querySpec.startTime = "24h";
    querySpec.endTime = null;
    querySpec.buckets = 1;
    
    TimeseriesQueryResult result = queryService.timeseriesQuery(new TimeseriesQuerySpec[]{querySpec});
    System.out.println(result.values.get(0).values.get(0));


facetQuery: <Facet Queries>
## Facet Queries

Use facet queries to retrieve the most common values for a field. For instance, you can find the most common URLs
accessed on your site, the most common user-agent strings, or the most common response codes returned. Facet queries
use the QueryService class: https://www.scalyr.com/javadoc/com/scalyr/api/query/QueryService.html.

Here is a simple example that will print all status codes in your web access logs for the last 24 hours:

    QueryService queryService = new QueryService("[[[readLogsToken]]]");
    FacetQueryResult result = queryService.facetQuery("$dataset='accesslog'", "status", null,
        "24h", null);

    for (ValueAndCount valueAndCount : result.values)
      System.out.println("status " + valueAndCount.value + ": " + valueAndCount.count + " instances");


jvmStats: <JVM Statistics>
## Logging JVM Statistics

The library can automatically track JVM statistics, such as heap usage and thread count. To enable
this, simply add the following line after the call to Events.init:

    StatReporter.registerAll();

Each timeseries is labelled with a "tag" field, and source="tsdb". So, for example, the
following link will show a graph of thread count:

[[[publicAppUrl(events?filter=tag%3D%27jvm.threads.threadCount%27&facet=value&mode=graph)]]]

If you have multiple servers, look in the "Refine search" box on the left side of the graph,
click on serverHost, and select a hostname to view the thread count for that server.

Here is a complete list of supported fields:

|||# Tag                                 ||| Meaning
|||# ``jvm.uptimeMs``                    ||| how long the JVM has been running, in milliseconds 
|||# ``jvm.threads.threadCount``         ||| the number of active threads 
|||# ``jvm.threads.daemonThreadCount``   ||| how many of the active threads are daemon threads 
|||# ``jvm.heap.used``                   ||| total space used in the Java heap (bytes) 
|||# ``jvm.heap.free``                   ||| total space available in the Java heap (bytes) 
|||# ``jvm.nonHeap.used``                ||| total space used for memory outside the Java heap (bytes) 
|||# ``jvm.nonHeap.free``                ||| total space available for memory outside the Java heap (bytes) 
|||# ``jvm.pool.$POOL$.used``            ||| total space used in the specified memory pool (reported for each pool) 
|||# ``jvm.pool.$POOL$.free``            ||| free space in the specified memory pool (reported for each poo) 
|||# ``jvm.collector.$COLLECTOR$.count`` ||| number of times this garbage collector has been invoked (reported for each collector) 
|||# ``jvm.collector.$COLLECTOR.timeMs`` ||| total time spent in this garbage collector, in milliseconds (reported for each collector) 

rawFiles: <Raw Configuration Files>
## Raw Configuration Files 

The class com.scalyr.api.knobs.KnobService provides direct access to configuration files, allowing you to retrieve,
create/update, and list files. See the [JavaDoc](https://www.scalyr.com/javadoc/com/scalyr/api/knobs/KnobService.html)
for details.

configurationfile: <ConfigurationFile>
## ConfigurationFile

the class com.scalyr.api.knobs.ConfigurationFile provides a high-level interface for reading configuration files.
You can get access to a file using the static method KnobService.createFactory(). For example:

      KnobService service = new KnobService(
          "[your Read Config or Write Config token]");
      ConfigurationFileFactory factory =
          service.createFactory(new java.io.File("configCache"));

      ConfigurationFile file = factory.getFile("/serverConfig.txt");

The primary operations on a ConfigurationFile are to retrieve its content, and to listen for
changes. See the [JavaDoc](https://www.scalyr.com/javadoc/com/scalyr/api/knobs/ConfigurationFile.html) for details.

You can also create a ConfigurationFile instance representing a file in the local filesystem of your application,
independent of the Scalyr service. This can be useful for development and testing. To access local files, use
ConfigurationFile.makeLocalFileFactory:

      java.io.File rootDir = new java.io.File(...);
      ConfigurationFileFactory factory =
          ConfigurationFile.makeLocalFileFactory(rootDir, 10000);

      ConfigurationFile file = factory.getFile("/serverConfig.txt");

knob: <Knob>
## Knob

[Knob](https://www.scalyr.com/javadoc/com/scalyr/api/knobs/Knob.html) provides a convenient way to access individual
JSON values from a configuration file. Use this if you want to use Scalyr configuration files to manage your own
services. A Knob corresponds to a particular JSON field. For instance, given a file with the following content:

    {
      "foo": 37,
      "bar": "hello, world!"
    }

You could write the following code:

      ConfigurationFile file = ...;
      Knob.Integer knobFoo = new Knob.Integer("foo", 0, file);
      Knob.String knobBar = new Knob.String("bar", null, file);

      System.out.println(knobFoo.get()); // prints 37
      System.out.println(knobBar.get()); // prints "hello, world!"

Knob has variants for Boolean, Integer, Long, Double, and String values. You can also use static
methods to fetch a value without creating a Knob instance; for instance:

      String bar = Knob.getString("bar", null, file);

You can register a callback method with a Knob to be notified when a value changes.

#### Layering

You can use a Knob to "layer" multiple configuration files together. This is useful when you
run multiple server configurations -- say, staging and production, or primary and alternate
data centers. You can define a base file that contains settings shared by all servers, and
overlay files that contain settings unique to a particular configuration. The code might look
like this:

      ConfigurationFile baseFile    = factory.getFile("/baseConfig.txt");
      ConfigurationFile overlayFile = factory.getFile("/stagingConfig.txt");

      // Returns the value from overlayFile if "foo" appears there.
      // Otherwise returns the value from baseFile. If neither file
      // defines "foo", returns -1.
      int foo = Knob.getInt("foo", -1, overlayFile, baseFile);
