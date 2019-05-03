---
title: Distributions
---

# Distributions

Use the distribution view to summarize the values in a numeric log field, such as server response times or page sizes.
Distribution view shows the range of values and which values are most common. You can view values from an individual
log, aggregate multiple servers / logs, and use search terms to narrow the log messages shown.


display: <Displaying Distributions>
## Displaying Distributions

To display the distribution of values in a field, find that field in the left sidebar of the Search view. Click on the
field name, and click the "Distribution" button at the bottom of the pop-up panel.

The "Distribution" button will appear only for fields with numeric values.


reference: <Quick Reference>
## Quick Reference

[[[{type: "image", name: "nuiDistributionOverview.png", maxWidth: 750}]]]

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

[[[{type: "image", name: "nuiTimeDropdown.png"}]]]

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

[[[{type: "image", name: "nuiFieldValues.png"}]]]

You can click on any value to restrict your view to log messages having that field value. For numeric fields, click
the "Graph Values" button to display a graph of that field.


**(7)** This shows the name of the field you're viewing.


**(8)** This area shows the distribution of values in the specified field.


**(9)** This area displays summary statistics for the values in the distribution.


filters: <Filtering Data>
## Filtering Data

[[[{type: "image", name: "nuiDistributionSearchField.png", maxWidth: 750}]]]

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
