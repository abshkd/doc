---
title: "Using Dashboards"
weight: 41
---


A *dashboard* is a page containing one or more graphs. Dashboards are used to group
together and saving useful information for viewing at a glance. For instance, you might create a dashboard
that shows high-level health information for all of your servers, and an additional dashboard
per subsystem showing additional details.

## Creating Dashboards

To create a dashboard, the easiest approach is to first use the Search page to display a graph that
you'd like to include in the dashboard. Then click the {{menuRef:Save Search}} button and choose {{menuRef:In Dashboard}}. In the
resulting dialog, click the {{menuRef:Dashboard}} dropdown and select {{menuRef:New Dashboard...}}.

You can add additional graphs to your dashboard using the same button. Just click Use Existing Dashboard, then select your dashboard from the dropdown list.

To view a dashboard, use the {{menuRef:Dashboards}} dropdown in the navigation bar.

## Adding Graphs

There are several ways to add a graph to a dashboard. The easiest way is from the Search page, 
but you can also add a graph from the Dashboard page.  

To add a graph from the Dashboard page,

N. Click the Add button on the right side of the actions bar. 
N. Choose the graph type: Standard or Breakdown.
N. Add a title for the graph and, optionally, change the graph type. Graph type can be line, area, or bar.  If you choose bar, you'll be able to set the time interval for the bars so that you can see data at intervals of, for example, a minute or an hour.
N. *For standard graphs only:* Click the Plot button to add a plot to the new graph. This will bring up a dialog where you can configure the new plot. This dialog has two tabs: Basic Function and JSON. These are described below.
N. *For breakdown graphs only:* Specify the field by which you want the graph to break down.
N. When you are finished, click the Add This Graph button. 

{{< figure src="/img/newDashAddGraph.png" width="650">}}

 
### Basic Function Plots

A plot created using a basic function will transform data by applying a selected function to the selected variable.  You can use the filter input to then further narrow the data being plotted.

{{< figure src="/img/newDashAddPlot.png" width="700">}}

- Label: The graph title.
- Field: The name of the event field to be graphed. See the [Graph View - Field List](/help/graphs#fieldList) reference for details.
- Function: A transformation you can apply to the data being plotted. Refer to [Graph - Functions](/help/graph-reference#functions) for specific function 
details, or click through the functions in the dialog and refer to the note on the right hand side.
- Filter: Specifies which events are to be graphed, expressed in Scalyr Query Language. For details, click [here](/help/query-language).
- Color: Assigns a color to the plot. 

### JSON Plots

The second tab, JSON, displays open fields where you can use a complex expression to create a custom filter expression, using a combination of Scalyr 
functions, arithmetic operators, etc. This lets you define more involved queries. For example, the following filter expression makes 
use of a Scalyr function to apply a data transformation to a custom filter. For details, refer to the [Complex Expressions](/help/query-language#complexExpressions) reference.
 
    count($logfile contains 'access' status >= 500) / count($logfile contains 'access') * 100

For details on the Scalyr query language in general, click [here](/help/query-language).


## Editing Dashboards

Dashboards are simply containers for one or more graphs, PowerQueries, or reports, and you don't edit them per se. There are only a few things you do with dashboards in the UI: create and delete them, add and remove graphs, PowerQueries, or reports to them, and rename them.

To **rename a dashboard**, open it and click Settings > Dashboard Settings, provide the new name, and save your change.

To **delete a dashboard**, open it and click Settings > Dashboard Settings, and click the Delete Dashboard link in the lower left of the Settings editor.

### Editing Graphs in Dashboards

Though you do not edit dashboards themselves (except to rename them), you can change several of the display properties of the individual graphs within them. To do this, click the hamburger button in the upper right of the tiled graph, and select Edit Graph. This opens the Edit Graph window with the fields described below. (Note that they differ depending on graph type.)

|  Field/Control   |   Function
|  Title   |   Allows you to rename the graph
|  Type   |    Line, Stacked, or Bar Interval
|  Time Interval   |   For bar interval style, specifies the time interval on the X-axis
|  Plot List   |   List of the color-coded plots the graph contains. You use this list to delete plots from the graph, or edit them with the Plot Editor (see below). Does not display for Breakdown graphs.
|  Add Plot button   |   Lets you define more plots in the graph. Does not display for Breakdown graphs.
|  Field   |   Displays the field used for breakdown. Displays only for Breakdown graphs.
|  Remove Graph   |   Click this to delete the graph from the dashboard. 

The Plot Editor lets you define the following properties:

- The name of the field you want to plot (required)
- The graphing function you want to perform on the field values: count, mean, min, max, sumPerSec, and 10th, 50th, or 90th percentile (required) 
- Any filter you want to apply (optional)
- Label that displays in the graph key (required)
- Color picker for assigning a color to the plot line or bar

Note that this editor is not available for Breakdown graphs.

## Editing Dashboards in JSON

A dashboard is specified by a simple configuration file in an augmented JSON format. This topic
describes the configuration syntax. For more information on Scalyr configuration files, refer to  [Configuration Files](/help/config[[[emitSoleParamTeamTokenIfPhoenix]]]).

To edit a dashboard, first use the {{menuRef:Dashboards}} dropdown in the navigation bar to view that
dashboard. Then click the {{menuRef:Edit Dashboard}} link near the top of the page.

To delete a dashboard, click the {{menuRef:Settings}} dropdown in the navigation bar and choose
"Configuration". Find your dashboard in the list of configuration files, move the mouse over the
dashboard name, and click {{menuRef:Delete}}.


## Built-in Dashboards

Scalyr comes with a few built-in dashboards:

[System Dashboard](/dash?page=system[[[emitAddlParamTeamTokenIfPhoenix]]]) -- displays metrics for an individual host, 
such as CPU and RAM usage, free disk space, and network bandwidth. This dashboard will contain data for
each host on which you've installed the [Scalyr Agent](/help/scalyr-agent[[[emitSoleParamTeamTokenIfPhoenix]]]).

[Web server dashboard](/dash?page=webServer[[[emitAddlParamTeamTokenIfPhoenix]]]) -- displays metrics for a web (HTTP) 
server, such as request rate, status codes, and response times and sizes. To use this dashboard, you must configure the 
Scalyr Agent to upload your web access logs (see the [Analyze Access Logs](/solutions/analyze-access-logs[[[emitSoleParamTeamTokenIfPhoenix]]]) 
solution page).

The web server dashboard can provide more information if your server logs response times. Many
servers do not log response times by default, but this is easily fixed by adjusting the log
pattern. For Apache, use a log format of ``"%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"
%D".`` For Tomcat, edit the AccessLogValve directive in the server.xml configuration file --
it should look something like this:

        <Valve className="org.apache.catalina.valves.AccessLogValve"
               directory="logs" prefix="access" suffix=".log"
               ***pattern='%h %l %u %t "%r" %s %b "%{Referer}i" "%{User-Agent}i" %D'***
               resolveHosts="false" />

After updating the server configuration, you will usually need to restart your web server.

[Paths dashboard](/dash?page=paths[[[emitAddlParamTeamTokenIfPhoenix]]]) -- shows an overview of all traffic to your web 
servers, organized by request page. To use this dashboard, you must configure the Scalyr Agent to upload
your web access logs (see the [Analyze Access Logs](/solutions/analyze-access-logs[[[emitSoleParamTeamTokenIfPhoenix]]]) 
solution page, which also provides additional details of this dashboard).

[Servers Dashboard](/dash?page=servers[[[emitAddlParamTeamTokenIfPhoenix]]]) -- lists all servers on which you have 
installed the Scalyr Agent, with some basic system metrics for each.

[Monitors Dashboard](/dash?page=monitors[[[emitAddlParamTeamTokenIfPhoenix]]]) -- lists all of your HTTP Monitors. See the
[Monitors](/help/monitors[[[emitSoleParamTeamTokenIfPhoenix]]]) reference for details.

[Linux Process Metrics](/help/monitors/linux-process-metrics[[[emitSoleParamTeamTokenIfPhoenix]]]) -- displays metrics for 
an individual process or application. To enable this, you must configure the Scalyr Agent to upload metrics for the 
process you're interested in. Click the link for setup instructions.

[LevelDB dashboard](/leveldbdashboard[[[emitSoleParamTeamTokenIfPhoenix]]]) -- displays metrics taken from a LevelDB log file. Click
the link for setup instructions.

## Dashboard Syntax

Here is an example of a dashboard configuration file:

    {
      duration: "4h",
      graphWidth: 470,
      graphHeight: 328,
      
      graphs: [
        {
          label: "Free disk space",
          facet: "value",
          filter: "source='tcollector' metric='df.1kblocks.free' host='host1'"
        }, {
          label: "CPU Usage",
          facet: "value",
          plots: [
            {
              label: "user",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='user'"
            }, {
              label: "system",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='system'"
            }, {
              label: "I/O",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='iowait'"
            }
          ]
        }
      ]
    }

The ``duration`` field specifies the time range displayed in the dashboard. You can express
the time range in minutes, hours, days, or weeks, with or without abbreviation: "30m", "30
minutes", "4 hours", "1 day", "2 w", etc. Note that this is only a default -- while viewing
a dashboard, you can navigate to any time period you like.

The ``graphWidth`` and ``graphHeight`` fields allow you to specify the size of graphs in your
dashboard. The default is currently 470 by 328 pixels. Adjust the size to see more detail or to
fit more graphs onto a page. Note that a minimum size is enforced (currently 300 by 200 pixels),
and labels may not render correctly in very small graphs.

The ``graphs`` field contains a JSON object for each graph. These objects, in turn, have
the following fields:

- label -- the graph title. 
- facet -- the name of the event field to be graphed. See the [Graph View](/help/view[[[emitSoleParamTeamTokenIfPhoenix]]]#graph)
  reference for details. 
- filter -- specifies which events are to be graphed. See the [Query Language](/help/query-language[[[emitSoleParamTeamTokenIfPhoenix]]])
  reference for details. 
- ymin (optional) -- minimum value for the Y axis. Specify ``"ymin": 0`` for a zero-based graph.
  
- ymax (optional) -- maximum value for the Y axis. 
- graphStyle (optional) -- specify "stacked" to display an area graph rather than a
  line graph, or stacked_bar to display a bar chart.
- barWidth (optional) -- if you set the graphStyle to display a bar chart then you can specify the time interval of each bar eg: "1 minute" or "1 hour".
- autoPercentiles (optional) -- specify "false" to disable Scalyr's default behavior of automatically adding
  median and percentile plots to a graph of that displays the mean value of a log field.

A single graph can display multiple plots (values). In this case, the filter field is replaced
by a plots field, containing a series of JSON objects each having the following fields:

- label -- label for this plot 
- filter -- specifies which events are to be graphed for this plot. 
- color (optional) -- color for this plot, in standard ``#RRGGBB`` hex syntax (e.g. ``#FF0000``
  for bright red). 
- facet -- the name of the event field to be graphed. Overrides any facet specified in
  the enclosing graph object. See the discussion of the Variable box in the [graph view](/help/view[[[emitSoleParamTeamTokenIfPhoenix]]]#graph)
  reference for details. 

To add a graph to a dashboard, it is not necessary to type a JSON object by hand. Simply construct
your graph in the [graph view](/help/view[[[emitSoleParamTeamTokenIfPhoenix]]]#graph)), click the {{menuRef:Save Search}} 
button and choose {{menuRef:In Dashboard}}.  This generates JSON code which you can simply paste into the dashboard editor.


## Area Graphs

Dashboard graphs normally use line plots, but when displaying multiple values, a stacked area
graph is sometimes easier to look at. To create an area graph, add graphStyle: "stacked"
to the graph's JSON specification. The built-in [system dashboard](/dash?page=system) 
contains some examples of area graphs.

## Bar Graphs

Use a bar graph to display your graph data broken up into specific time intervals. To change an existing graph into a bar 
graph you can edit the graph from the dashboard page [Edit Graph](/help/new-dashboards#editing), or edit the dashboard 
JSON by adding graphStyle: "stacked_bar" to the graph's JSON specification.  To add a new bar chart to a dashboard you 
can create a graph via the [Add Graph](/help/new-dashboards#addgraph) dialog on the dashboard page. 


## Viewing Dashboards

The Dashboards menu in the navigation bar provides access to all of your dashboards. 

When you first bring up a dashboard, it will display data over a range specified in the dashboard
file (the "duration" field, or whatever your [default search time span](/help/tips#defaultSearchTimeSpan) is - 4 
hours if unspecified). However, you can navigate to any time range you like, using
the time menu drop down in the upper right corner. 

To enlarge a graph, simply click on it. You will be taken to the graph editor page for that
graph, where the graph will be displayed full size. This also allows you to make changes to
the graph, e.g. by altering the search expression. If you want to update the dashboard to reflect
your changes, you must go to the dashboard editor and paste in the new search expression.


## Dashboard Parameters

Sometimes you may want to use the same dashboard to view different sets of data. For instance,
you might build a dashboard that shows information for a specific server or data center, and
then want to use it for other servers or data centers. *Dashboard Parameters* are a simple
mechanism for applying a dashboard to multiple data sets.

To use dashboard parameters, add a "parameters" section to the dashboard definition file, and
reference those parameters in your graphs. For example:

    {
      parameters: [
        { name: "region", values: ["westCoast", "eastCoast"] },
        { name: "host", defaultValue: "host1" }
      ],
      
      graphs: [
        {
          label: "Free disk space on #region# / #host#",
          facet: "value",
          filter: "source='tcollector' metric='df.1kblocks.free' region='#region#' $serverHost='#host#'"
        }, {
          label: "CPU Usage on #region# / #host#",
          facet: "value",
          plots: [
            {
              label: "user",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='user' region='#region#' $serverHost='#host#'"
            }, {
              label: "system",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='system' region='#region#' $serverHost='#host#'"
            }, {
              label: "I/O",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='iowait' region='#region#' $serverHost='#host#'"
            }
          ]
        }
      ]
    }

In this dashboard, we have defined two parameters, "region" and "host".  Those parameters are
then substituted into graph titles and filter expressions using the syntax ``#parameter#``,
e.g. ``#region#``. You can use parameters in a graph label, plot label, and filter expression.

When viewing this dashboard, there will be "region" and "host" fields to fill out. The "region" field,
since it defines a ``values`` list, will have a ``select`` form element which can be used to select one of the
specified values.  It will default to the first value specified in the configuration file ("eastCoast"
in this example).  The "host" field, since it has a ``defaultValue`` field, will have a free form text input element.
It will be set to the value in ``defaultValue`` ("host1" in this example)
unless another value is typed into the input field.

Sometimes you may want to give a parameter option a label that is different than the internal value used in
queries. You can do this by turning each option into a dictionary with "label" and "value" fields:

      parameters: [
        { name: "region", values:
            [
              { label: "East Coast", value: "us-east-1"},
              { label: "West Coast", value: "us-west-1"}
            ]
        }
      ],

#### Defining parameters using data tables

You can place a list of parameter values in a separate file, called a "data table". This allows you to use the same
list in multiple dashboards.

To create a data table:

N. Go to the {{menuRef:Settings}} menu and choose {{menuRef:Configuration}}.
N. Click {{menuRef:Create New File}}.
N. Name the file /datatables/TABLENAME. For the table name, choose a simple identifier (no spaces or punctuation).
N. Type or paste the table content (see below).
N. Click {{menuRef:Update File}}.

The file should look something like this:

    {
      values: [
        { label: "value 1", value: "value for label 1" },
        { label: "value 2", value: "value for label 2" },
        { label: "value 3", value: "value for label 3" }
      ]
    }

As a shortcut, if the name and value are the same, you can just enter a string:

    {
      values: [
        "value 1",
        "value 2",
        { label: "value 3", value: "value for label 3" }
      ]
    }

You can use this parameter list in a dashboard as follows:

    parameters: [
      { name: "Parameter 1", values: ["__datatable(TABLENAME)"] }
    ],

The table name here should match the name you used when creating the file.


#### Per-server dashboards

You can make a dashboard to show data from any selected server. To do this, define a dashboard parameter with
the special value ``__serverHosts``. This will automatically be replaced by a list of all servers which have sent
logs in the last 24 hours. For example:

    {
      parameters: [
        {
          name: "serverHost",
          ***values: ["__serverHosts"]***
        }
      ],

      graphs: [
        {
          facet: "value",
          label: "CPU load average",
          plots: [
            {
              filter: "$source='tsdb' $serverHost='#serverHost#' metric='proc.loadavg.1min'",
              label: "1 min avg"
            }
          ]
        }
      ]
    }

If your dashboard is only applicable to certain servers, use a filter expression to restrict the
servers listed in that dashboard. Some examples:

        // List all servers whose hostname contains "frontend"
        values: ["__serverHosts[serverHost contains 'frontend']"]

        // List all servers whose agent configuration includes a server-level field
        // named "scope", with value "staging".
        values: ["__serverHosts[scope == 'staging']"]

        // List all servers having logs tagged with parser name "xxx".
        values: ["__serverHosts['parser:xxx']"]

        // List all servers where "xxx" appears anywhere in the file name
        // or parser name of any log.
        values: ["__serverHosts['xxx']"]

You can use the full Scalyr [query language](/help/query-language[[[emitSoleParamTeamTokenIfPhoenix]]]) to select servers. 
Your filter expression can reference ``serverHost`` (the server's hostname), ``serverIP`` (the server's IP address), 
and any server-level fields defined in the Scalyr Agent configuration. In addition, you can select based on log files 
and log parsers, using the text search syntax. When you use a text search filter, each server is treated as having the 
following text:

    [parser:xxx] [parser:yyy] [log:aaa] [log:bbb] ...

listing each log file for that server, and any parsers associated with those log files in the Scalyr Agent
configuration.

You can replace ``__serverHosts`` with ``__serverHostsQ`` to wrap the server names in single quotes. This makes it
syntactically possible to write a dashboard that can show data from any selected server, but can also aggregate data
across servers:

    {
      parameters: [
        {
          name: "serverHost",
          ***values: [***
            ***{ label: "Average (all servers)", value: "*"},***
            ***"__serverHostsQ"***
          ***]***
        }
      ],

      graphs: [
        {
          facet: "value",
          label: "CPU load average",
          plots: [
            {
              filter: "$source='tsdb' $serverHost=#serverHost# metric='proc.loadavg.1min'",
              label: "1 min avg"
            }
          ]
        }
      ]
    }


## PowerQueries

You can include the output of a [PowerQuery](/help/power-queries) in a dashboard. To do this:

1. Open the dashboard, or create a new dashboard.

2. From the Settings menu, click Dashboard JSON.

3. Inside the ``graphs`` list, create an entry with ``title`` and ``query`` fields. The ``query`` field contains your query.
You can use the ``+`` operator to split the query across multiple lines. For example:

    {
      graphs: [
        {
         title: "Top 5 Paths by Error Count",
          query: "$logfile contains 'access' " +
                 "| group total = count(), errors = count(status >= 500 && status <= 599) by uriPath " +
                 "| sort -total " +
                 "| limit 5"
        }
      ]
    }


## Reports

In addition to graphs, a dashboard page can also include reports. Reports allow you to summarize
data about a collection of entities and present it in a table. The entities can be anything that
is mentioned in a log - servers, URLs, error messages, IP addresses, etc. 

Reports can use embedded parameters just like any other part of a dashboard. This allows you to define
a single report, and use it to view data from different servers, data centers, or other choices. See the
[Dashboard Parameters](#parameters) section for details. 

To create a report, follow these steps: 

1. Make a new dashboard. (From the Dashboards menu, select New Dashboard, and enter a name.) 

2. Create a report specification in the dashboard. Here is a simple example: 

    {
      graphs: [
        {
         title: "HTTP requests, by path",
          keys: [
            { label: "Path", attribute: "uriPath" }
          ],
          columns: [
            {
              label: "Count",
              filter: "dataset='accesslog'",
              function: "count"
            }, {
              label: "Average Size",
              filter: "dataset='accesslog'",
              attribute: "bytes",
              function: "mean"
            }, {
              label: "Total Size",
              filter: "dataset='accesslog'",
              attribute: "bytes",
              function: "sum"
            }
          ],
          sort: [ "-Count" ]
        }
      ]
    }

3. To view the report, click the "View Dashboard" link in the dashboard editor. 

The sample report summarizes all unique URLs served by a web site. For each URL, it shows the number
of requests, the average response size, and the total size of all responses. It assumes that you are
importing web access logs and using our standard access log parser. For further examples, look at the
[Servers Dashboard](/dash?page=servers[[[emitAddlParamTeamTokenIfPhoenix]]]) or [Paths Dashboard](/dash?page=paths[[[emitAddlParamTeamTokenIfPhoenix]]]), 
and click the Edit Dashboard link to view the source code. 

The ``keys`` clause indicates how the report data should be grouped and organized - similar to the GROUP
BY clause in an SQL query. In this example, there is a single key. It is labeled "Path" in the report
view, and comes from a parsed field named "uriPath" in the logs. You can specify more than one key;
for instance, servers could be grouped by data center and hostname.

The report will display up to 1000 distinct rows. If you would like to reduce the number of rows (for instance,
to make room for other elements in your dashboard), specify a ``maxRows`` setting. For instance:

         title: "20 most common HTTP request paths",
          ***maxRows: 20,***
          keys: [
            { label: "Path", attribute: "uriPath" }
          ],
          ...


The ``columns`` clause specifies the data in the report. Each entry creates one column in the report
table. (Each key also gets a column.) A column can have the following fields: 

- ``label`` - the label for this column in the report table. 
- ``filter`` - a log query used to select data for this column. Uses the same syntax as the "expression"
  field in the log search page.
- ``function`` - how to summarize the data for each table cell. Functions are listed below. 
- ``attribute`` - which log field to apply the function to. No field is used if the function
  is count. 
- ``href`` - optional; allows you to attach a custom link to cells in this column, as described below.
- ``maxDisplayLength`` - optional; limits the number of characters displayed in this column.


The following functions are supported: 

- ``count`` - the total number of log messages matching the filter 
- ``latest`` - the field value from the most recent log message matching the filter 
- ``min``, ``max`` - the smallest or largest value 
- ``mean`` - the average value 
- ``sum`` - the total of all values 
- ``sumPerSecond`` - the sum, divided by the number of seconds in the time period. For instance, sumPerSecond
  of HTTP response sizes gives the outgoing bandwidth in bytes per second. 
- ``slopePerSecond`` - the difference between the oldest and newest matching log message, divided by
  the number of seconds between them. This shows the rate of change; it's useful for metrics like "free
  disk space". 
- ``breakdown`` - generates a breakdown of the values in a field (see [below](#breakdowns)) 

The ``sort`` clause specifies the order in which rows are displayed. You can specify one or more columns
to sort on. Each entry is a column label, optionally preceded by a minus sign for descending sort. You
can omit the ``sort`` clause, in which case the report is sorted on the key columns. 

Currently, reports always summarize the last hour's worth of logs. If you would like other options, let
us know.


## Complex Expressions

You can perform arithmetic computations in a report, using the +, -, * , and / operators. Uses include
scaling values to their most natural units (e.g. disk space as gigabytes), and computing ratios such
as "errors as a fraction of all web requests". To use this feature, replace the "filter", "attribute",
and "function" fields of a column specification with a single "expression" field. An example: 

      expression: "latest(value where $source='tsdb' metric='df.1kblocks.free' mount='/') / 1024"

You can perform arithmetic on queries (such as the "latest" query in the example), constants like 1024,
or a combination of the two. All report functions are supported: count, latest, min, max, mean, sum,
sumPerSecond, and slopePerSecond. 


## Breakdowns

The ``breakdown`` function generates multiple columns, one for each unique value in the attribute. For instance,
when applied to the HTTP status in a web access log, this generates a breakdown of traffic by status code. Here is
a simple report definition using a breakdown:

    {
     title: "HTTP requests, by path and status",
      keys: [
        { label: "Path", attribute: "uriPath", maxDisplayLength: 100 }
      ],
      columns: [
        {
          filter: "dataset='accesslog'",
          attribute: "status",
          function: "breakdown",
          includeTotal: true
        }
      ]
    }
    
This will generate a table looking something like this:

Path             | 200 | 201 | 502 | Total
/index.html      | 361 |  11 |  29 | 401
/foo             |  11 |     |   1 | 12

The following options can be included with a breakdown column:

- ``displayPercentages`` - instead of displaying the number of matches for each value, shows the percentage within that row.
- ``includeTotal`` - adds a "Total" column, showing the total number of matches for that row.
- ``maxDisplayedValues`` - The maximum number of distinct values to show. Defaults to 10; can range from 1 to 20. Any additional values will be grouped into an "Other" column.

Note: reports using the breakdown operator are currently limited to 24 hours of data, and 1000 output rows.


## Links

You can click on any cell in a table (except for columns defined using "expression", or static columns, unless they
also provide an ``href`` field). This will lead to a graph or log view of the data summarized in that cell. 

You can override the normal click behavior for any column by adding an ``href`` field to the column
specification. (You can even attach an ``href`` to a key column; key columns are not otherwise clickable.)
The ``href`` field contains a standard URL specifying the page to load when clicking on cells in
that column. The ``href`` can contain variables to be filled from the row data, using the syntax ``#attr#``.
For example, an ``href`` can be added to the Path column to link to a log search for requests with that path:

    {
      label: "Path",
      attribute: "uriPath",
      ***href: "events?filter=uriPath%3D%27#uriPath#%27"***
    }

If you are referencing a field in the row key, specify the field name, as it appears in the ``attribute`` field of
an entry in the ``keys`` list. If you are referencing a computed column, specify the column label, as it appears in
the ``label`` field of an entry in the ``columns`` list.

You can also use the special fields #startTime# and #endTime# to reference the time period covered by the report. For
instance:

    {
      label: "description",
      attribute: "description",
      ***href: "events?filter=uriPath%3D%27#uriPath#%27&startTime%3D#startTime#&endTime%3D#endTime#"***
    }


## Static Columns

A column can have a staticValue instead of the filter, function, and attribute fields: 

    {
      label: "Dashboard",
      ***staticValue: "link",***
      href: "dash?page=system&param_serverHost=%27#host#%27"
    }

This column will always contain the text "link", and will link to the System dashboard for the host whose
name is in the ``host`` key for this row. 


#### Data tables in static columns

You can use a data table to define mappings for use in static columns. For instance, you can map a status code to
a meaningful message.

Data tables were discussed [earlier](#datatables) for use in dashboard parameters. To create a data table for use
in a static column:

N. Go to the {{menuRef:Settings}} menu and choose {{menuRef:Configuration}}.
N. Click {{menuRef:Create New File}}.
N. Name the file /datatables/TABLENAME. For the table name, choose a simple identifier (no spaces or punctuation).
N. Type or paste the table content (see below).
N. Click {{menuRef:Update File}}.

The file should look something like this:

    {
      "200": "OK",
      "404": "Not Found",
      ...
    }

To use this in a report, create a static column with a staticValue like this:

    {
      label: "Status",
      staticValue: "#datatable(TABLENAME,status)#",
    },

This example will take the value of the "status" field (which must be one of the report's key fields), look it up
in the data table, and display the value.


## Wall View

If you want to keep a dashboard open permanently, perhaps in a wall-mounted display, click
the "Wall View" link to the upper-right of the dashboard form. This displays a simplified,
"chromeless" version of the dashboard page.

In Wall View, you can customize the size of graphs and the number of columns. You can also
specify that the dashboard automatically refresh. To do this, from the Wall View page, click
the "Edit Wall View" link in the upper-right corner.