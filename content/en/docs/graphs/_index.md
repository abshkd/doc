---
title: "Graphing Results"
weight: 23
---

You can graph values
from an individual log, aggregate multiple servers / logs, and use search terms to narrow the log messages to
graph. To graph the values in a field, find that field in the left sidebar of the Search view. Click on the
field name, and click the "Graph Values" button at the top of the pop-up panel.

The "Graph Values" button will appear only for fields with numeric values.

To graph the rate at which some event occurs, such as a certain error message, use the Search view to search for that event.
Then click the "Show Graph" button above the timeline chart near the top of the Search view.


## Quick Reference


{{< figure src="/img/nuiGraphOverview.png" width="750">}}

**(1)** To search for a specific word or phrase, type it here. This determines which log messages are reflected in the
graph. Numbers, punctuation, or phrases must be enclosed in quotes. Sample searches:

| Search              | Meaning
| ``error``           | To search for a word or part of a word, just type it
| ``"/blog"``         | Punctuation must be enclosed in quotes
| ``"customer 1309"`` | Multi-word phrases must also be enclosed in quotes
| ``userId = 1309``   | Matching on a parsed field
| ``time > 0.5``      | Numeric comparison on a parsed field

See [Query Language Reference](/help/query-reference) for a full description of the 
Scalyr query language.

**(2)** As you type search text into the box, it is parsed and presented in a form that makes your search easier to read and understand.
Different parts of your search text such as fields, operators, and values are highlighted in order to visually differentiate them. For example, in the
search text "bytes > 5000", each of the three components will be a different color.

**(3)** Click here to specify the time range to graph. The following options will appear:

{< figure src="/img/nuiTimeDropdown.png">}}

**(3a)** Click on a preset to quickly graph that time range.

**(3b)** Enter the start time for your graph. You can enter a time (e.g. ``14:30`` or ``5:05 AM``), a date (``May 23``),
or date and time (``5/14/2016 2:00 PM``), using a wide variety of date and time formats. You can also enter shortcuts
like ``"5h"`` to indicate five hours ago. See [Time Syntax Reference](/help/time-reference) 
for a complete list of options.

**(3c)** Enter the end time for your graph. You can use any of the formats supported by the Fromt time. You can also
enter a shortcut beginning with ``+`` to specify the amount of time you'd like to search, e.g. ``+24h`` or ``+1d``
to graph a one-day period beginning at the From time.


**(4)** Use these buttons to move forward or backward one half-graph at a time.


**(5)** Use this button to view the raw log messages matching your search.


**(6)** Use these fields to search a specific server or log file. You can use a single ``*`` as a
wildcard anywhere in the name.


**(7)** This area lists the fields Scalyr's parser has found in the log messages matching your search. By default,
it shows the most common fields, limited to the number that will fit in your window ("Top Fields"). Click the
dropdown and switch to "All Fields" to view all fields; then use the Prev/Next buttons to navigate through the
alphabetical list. The number next to each field indicates how many distinct values appear in that field. (If there
are more than a few hundred distinct values, the number shown will be an estimate.)

Click on any field to view the most common values in that field:

{{< figure src="/img/nuiFieldValues.png">}}

You can click on any value to restrict your graph to log messages having that field value. For numeric fields, click
the "Graph Values" button to display a graph of that field.


**(8)** This shows the name of the field you're graphing.


**(9)** Click "Break Down By" to create a breakdown graph. A breakdown graph shows a separate plot for each server,
or some other field you choose. For instance, if you're graphing the number of errors on your site, a breakdown graph
will show the number of errors on each individual server. See [Graphs Reference](/help/graph-reference#breakdown) 
for details.


**(10)** This area shows a graph of the specified field.


**(11)** This area lists the functions which you can select for your graph. Check one or more boxes to select
different functions of the graphed field. Each function is documented in the [Graphs Reference](/help/graph-reference).

You can click and drag in the graph to select a time range. The legend then shows aggregate statistics for the entire
time range. A "Zoom to selection" button will appear; click this button to zoom in to the selected time range.


**(12)** These statistics apply only when you have dragged to select a time range in the graph. They show how much
the graph changes during that time range.

**(13)** Click the "Save" button in the left-center of the search bar to display the following Save actions for your current search:

- **Save Graph**: Opens a dialog box that lets you save the graph to either your personal or team's list of saved graphs, which are also available in the main Search menu at the top of the page. 
- **Save as Alert**: Create a new alerting rule, which will trigger if the number of matches to your current search goes above or below a level you specify.
- **Save to Dashboard**: Add this search to an existing dashboard, or start a new dashboard with this search. 
- **Download as PNG**: Saves the current graph as a PNG file and downloads it to your default Downloads folder. 


**(14)** Click the "Share" button in the left-center of the search bar to display the following Share actions for your current search:

- **Copy Link**: Opens a modal window where you can copy a link to this search with relative time references replaced by absolute (e.g., instead of the searching the previous hour, it would search 8 a.m. to 9 a.m.).
- **Add to Shared Search List**: Opens a dialog box that lets you save the active search query to either your personal or team's list of saved searches; the team list is selected by default. Saved searches are available in the Search menu.


**(15)** Use the chart type drop down to select the type of chart you'd like to see.  If you choose Stacked Bar Chart 
you'll also be able to select the time interval for the bars, e.g. 1 minute or 1 hour.  If you have a graph with a huge
difference between highest and lowest values you may want to switch to a logarithmic y-axis.

{{< figure src="/img/nuiGraphType.png">}}

Once you’ve entered the graph view, you can refine which log records or metrics are included in your graph.


functions: <Graph Functions>
## Graph Functions

[[[{type: "image", name: "nuiGraphSidebar.png"}]]]

Use the checkboxes **(1)** on the right side of the graph to specify which functions you’d like to plot. You can
select one function, or many.

| Function      | Value
| Average       | The average of all values in each time period. For instance, if you are graphing server response times, this will show the average response time.
| Minimum       | The smallest value in each time period.
| Maximum       | The largest value in each time period.
| Sum/sec       | Adds all values in each time period, and divides by the time span. For instance, if you are graphing the response-size field in a web access log, this will give the response bandwidth in bytes per second.
| 10th %ile     | Shows the 10th percentile of all values in each time period.
| 50th %ile     | Shows the 50th percentile (median) of all values in each time period.
| 90th %ile     | Shows the 90th percentile (median) of all values in each time period.
| 95th %ile     | Shows the 95th percentile (median) of all values in each time period.
| 99th %ile     | Shows the 99th percentile (median) of all values in each time period.
| 99.9th %ile   | Shows the 99.9th percentile (median) of all values in each time period.

A percentile is only meaningful if your search matches a large number of events. If there are not enough events to
compute a percentile, the corresponding checkbox will be disabled.

If you move your mouse over the graph, the exact value of each selected function is displayed next to that function **(2**).

Deltas **(3)** shows information about the slope, or rate of change, of your graph. For instance, if you're viewing
a graph of free disk space, the delta tells you how quickly disk space is being consumed.

- "Change" shows the change in value from one end of the graph to the other.
- "Change/hour" shows the average change in value per hour.
- "Change/sec" shows the average change in value per second.

Deltas are computed based on average values in the first and last time periods of the graph, even if you have chosen
to display a different function (such as minimum or maximum).


timeRanges: <Selecting Time Ranges>
## Selecting Time Ranges

You can click and drag in the graph to select a time range. When you do this, the values displayed in the Functions area 
reflect the time range you’ve selected. For instance, Minimum will show the minimum value in that entire time range, and 
Deltas reflect the change across the selected time range.

When you have selected a time range, a "Zoom to selection" button will appear. Click this button to zoom in to the
selected time range. You can use the browser’s Back button to undo a zoom.


timeNavigation: <Time Navigation>
## Time Navigation

[[[{type: "image", name: "nuiGraphTimeNavigation.png", maxWidth: 750}]]]

By default, the last four hours are displayed. You can
[customize this default](/help/tips#defaultSearchTimeSpan).  

Click on the time range dropdown **(1)** to specify the time range to graph.

Click the Older **(2)** and Newer **(3)** buttons to move forward or backward one half-graph at a time.

If you’ve specified a relative time range (e.g. "Last 4 hours"), click the Update button **(4)** to show the latest
data. This will refresh your display to reflect the current time. For instance, if you display a graph at 11:23 AM,
using the default "Last 4 hours" span, it will show data from 7:23 AM to 11:23 AM. If you then click the Update button
at 11:30 AM, your time range will update to show 7:30 AM to 11:30 AM.

Click See Logs **(5)** to view the raw log messages on which the graph is based.


### Time Range Dropdown

[[[{type: "image", name: "nuiTimeDropdownB.png"}]]]

The presets **(1a)** select your most recent data. For instance, select "4 hours" to view data from the last 4 hours.

To specify a custom time range, use the From **(1b)** and To **(1c)** fields. These fields are very flexible; you can enter:

- A time (e.g. ``14:30`` or ``5:05 AM``)
- A date (``May 23``)
- A date and time (``5/14/2016 2:00 PM``)
- A value like ``5h`` or ``2d`` to indicate "5 hours ago" or "2 days ago".
- ["To" field only] A value like ``+30m`` or ``+2h`` to indicate "30 minutes after the From time" or "two hours after the From time".

Examples:

| Scenario                                          | Start                        | End
| Graph the last hour.                              | ``1h`` or ``1 hour``         |||
| Graph from 5:23 AM this morning                   | ``5:23``                     |||
| Graph one hour, beginning at 5:23 AM this morning | ``5:23``                     | ``+1h``
| Graph one hour, beginning at 1:00 PM on April 4th | ``April 4 1:00PM``           | ``+1 hour``
| Graph from three days ago to two days ago         | ``3d`` or ``3 days``         | ``2d`` or ``2 days``

A wide range of date and time formats are supported. See [Time Syntax Reference](/help/time-reference) 
for a complete list.


filters: <Filtering Data>
## Filtering Data

[[[{type: "image", name: "nuiGraphSearchField.png", maxWidth: 750}]]]

Use the Server/Host and Log fields **(1)** to specify which servers and/or logs you’d like to graph. In the Server/Host
field, you can enter the name of a server. You can also use ``*`` as a wildcard at the beginning or end (but not the
middle) of a name. For instance, enter ``database*`` to graph logs from all servers whose name begins with "database".
Similarly, use the Log field to enter the name of a log file. If you have files with the same name on different servers,
the Log field will select that log across all servers. To select a single log from a single server, fill in both
Server/Host and Log.

When you click in the Server/Host or Log field, you will see a list of all available names. You can use the mouse or
arrow keys to select an entry from the list. As you begin typing, the list will narrow down to match what you've
typed so far. However, your selection in one field does not affect the choices shown in the other field. For instance,
if you type the name of a single server, the Log field will still list log files from all servers.

Use the Search field **(2)** to graph messages containing particular text (e.g. ``error``), or by field values (e.g.
``status >= 500``). See [Query Language Reference](/help/query-reference) for a full 
description of the Scalyr query language.

When you enter text into the search field, it will be highlighted with different colors to make your query more readable.

breakdown: <Breakdown Graphs>
## Breakdown Graphs

Click the "Break Down By" menu to create a breakdown graph. A breakdown graph shows a separate plot for each server.
For instance, if you're graphing the number of errors on your site, a breakdown graph will show the number of errors
on each individual server. Here is an example:

[[[{type: "image", name: "nuiBreakdownGraph.png"}]]]

You can break down by any field, not just server. For instance, when graphing data from a web access log, you could
break down by URL or user-agent. The breakdown graph shows a separate plot for each value in the selected field.

To break down by a different field, or to turn off breakdown mode, click the dropdown (1). In this example, the graph
(2) has four plots, one for each server. Use the function menu (3) to choose a function, such as Average, Minimum, or
Maximum. Use the checkboxes (4) to choose which plots to display.

If there are more than 20 plots (e.g. if you have more than 20 servers), the top 20 will be shown.


fieldList: <Field List>
## Field List

[[[{type: "image", name: "nuiFieldList.png", maxWidth: 750}]]]

This area lists the fields Scalyr's parser has found in the events or data points matching your search. By default,
it shows the most common fields, limited to the number that will fit in your window: "Top Fields" (1). Click the
dropdown and switch to "All Fields" to view all fields; then use the Prev/Next (3) buttons to navigate through the
alphabetical list. The number next to each field indicates how many distinct values appear in that field (2). (If there
are more than a few hundred distinct values, the number shown will be an estimate.)

Click on any field to view the most common values:

[[[{type: "image", name: "nuiGraphableFieldValues.png", maxWidth: 750}]]]

The blue bars **(1)** provide a visual indication of how often each value appears, and the numbers **(2)** provide a
more precise estimate. You can click on a value **(3)** to restrict your graph to events having that field value.

If the field has too many values to display on one screen, click the "see more" link **(4)** to display up to 200 values.

For numeric fields, click the "Graph Values" button **(5)** to switch to a graph of that field.


saveMenu: <The Save Menu>
## The Save Menu

Click the "Save" button in the left-center of the search bar to display the following Save actions for your current search:

- **Save Graph**: Opens a dialog box that lets you save the graph to either your personal or team's list of saved graphs, which are also available in the main Search menu at the top of the page.
- **Save as Alert**: Creates a new alerting rule, which will trigger if the number of matches to your current search goes above or below a level you specify.
- **Save to Dashboard**: Adds this graph to an existing dashboard, or create a new dashboard with this search. 
- **Download as PNG**: Saves the current graph as a PNG file and downloads it to your default Downloads folder.


shareMenu: <Share Menu>
## The Share Menu

Click the "Share" button in the left-center of the search bar to display the following Share actions for your current search:

- **Copy Link**: Opens a modal window where you can copy a link to this search with relative time references replaced by absolute. For example, instead of the searching the previous hour, it would search 8 a.m. to 9 a.m.
- **Add to Shared Search List**: Opens a dialog box that lets you save the search active query to either your personal or team's list of saved searches; the team list is selected by default. Saved searches are available in the Search main navigation menu.

Use the distribution view to summarize the values in a numeric log field, such as server response times or page sizes.
Distribution view shows the range of values and which values are most common. You can view values from an individual
log, aggregate multiple servers / logs, and use search terms to narrow the log messages shown.


## Displaying Distributions

To display the distribution of values in a field, find that field in the left sidebar of the Search view. Click on the
field name, and click the "Distribution" button at the bottom of the pop-up panel.

The "Distribution" button will appear only for fields with numeric values.


## Quick Reference

{{< figure src="/img/nuiDistributionOverview.png" width="750">}}

**(1)** To search for a specific word or phrase, type it here. This determines which log messages are reflected in the
distribution. Numbers, punctuation, or phrases must be enclosed in quotes. Sample searches:

| Search              | Meaning
| ``error``           | To search for a word or part of a word, just type it
| ``"/blog"``         | Punctuation must be enclosed in quotes
| ``"customer 1309"`` | Multi-word phrases must also be enclosed in quotes
| ``userId = 1309``   | Matching on a parsed field
| ``time > 0.5``      | Numeric comparison on a parsed field

See [Query Language Reference](/help/query-reference) for a full description of the 
Scalyr query language.

**(2)** As you type search text into the box, it is parsed and presented in a form that makes your search easier to read and understand.
Different parts of your search text such as fields, operators, and values are highlighted in order to visually differentiate them. For example, in the
search text "bytes > 5000", each of the three components will be a different color.

**(3)** Click here to specify the time range to view. The following options will appear:

{{< figure src="/img/nuiTimeDropdown.png">}}

**(3a)** Click on a preset to quickly view that time range.

**(3b)** Enter the start time for your view. You can enter a time (e.g. ``14:30`` or ``5:05 AM``), a date (``May 23``),
or date and time (``5/14/2016 2:00 PM``), using a wide variety of date and time formats. You can also enter shortcuts
like ``"5h"`` to indicate five hours ago. See [Time Syntax Reference](/help/time-reference) 
for a complete list of options.

**(3c)** Enter the end time for your view. You can use any of the formats supported by the Fromt time. You can also
enter a shortcut beginning with ``+`` to specify the amount of time you'd like to search, e.g. ``+24h`` or ``+1d``
to view a one-day period beginning at the From time.


**(4)** Use this button to view the raw log messages matching your search.


**(5)** Use these fields to search a specific server or log file. You can use a single ``*`` as a
wildcard anywhere in the name.


**(6)** This area lists the fields Scalyr's parser has found in the log messages matching your search. By default,
it shows the most common fields, limited to the number that will fit in your window ("Top Fields"). Click the
dropdown and switch to "All Fields" to view all fields; then use the Prev/Next buttons to navigate through the
alphabetical list. The number next to each field indicates how many distinct values appear in that field. (If there
are more than a few hundred distinct values, the number shown will be an estimate.)

Click on any field to view the most common values in that field:

{{< figure src="/img/nuiFieldValues.png">}}

You can click on any value to restrict your view to log messages having that field value. For numeric fields, click
the "Graph Values" button to display a graph of that field.


**(7)** This shows the name of the field you're viewing.


**(8)** This area shows the distribution of values in the specified field.


**(9)** This area displays summary statistics for the values in the distribution.


## Filtering Data

{{< figure src="/img/nuiDistributionSearchField.png" width="750">}}

Use the Server/Host and Log fields **(1)** to specify which servers and/or logs you’d like to view. In the Server/Host
field, you can enter the name of a server. You can also use ``*`` as a wildcard at the beginning or end (but not the
middle) of a name. For instance, enter ``database*`` to view logs from all servers whose name begins with "database".
Similarly, use the Log field to enter the name of a log file. If you have files with the same name on different servers,
the Log field will select that log across all servers. To select a single log from a single server, fill in both
Server/Host and Log.

When you click in the Server/Host or Log field, you will see a list of all available names. You can use the mouse or
arrow keys to select an entry from the list. As you begin typing, the list will narrow down to match what you've
typed so far. However, your selection in one field does not affect the choices shown in the other field. For instance,
if you type the name of a single server, the Log field will still list log files from all servers.

Use the Search field **(2)** to view messages containing particular text (e.g. ``error``), or by field values (e.g.
``status >= 500``). See [Query Language Reference](/help/query-reference) for a full 
description of the Scalyr query language.

