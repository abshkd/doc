---
title: "Graphing Results"
weight: 23
---

# Graphs

This section gives a quick introduction to the Graph view, which is where you can graph values in your logs, such as server response times or page sizes. You can graph values
from an individual log, aggregate multiple servers / logs, and use search terms to narrow the log messages to
graph. This page gives a brief overview. For a detailed description of all the powerful features provided by the
graph view, see [Graphs Reference](/help/graph-reference).


display: <Displaying Graphs>
## Displaying Graphs

To graph the values in a field, find that field in the left sidebar of the Search view. Click on the
field name, and click the "Graph Values" button at the top of the pop-up panel.

The "Graph Values" button will appear only for fields with numeric values.

To graph the rate at which some event occurs, such as a certain error message, use the Search view to search for that event.
Then click the "Show Graph" button above the timeline chart near the top of the Search view.


reference: <Quick Reference>
## Quick Reference


[[[{type: "image", name: "nuiGraphOverview.png", maxWidth: 750}]]]

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

[[[{type: "image", name: "nuiTimeDropdown.png"}]]]

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

[[[{type: "image", name: "nuiFieldValues.png"}]]]

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

[[[{type: "image", name: "nuiGraphType.png"}]]]