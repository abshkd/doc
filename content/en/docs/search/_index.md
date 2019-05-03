---
title: "Searching Logs"
weight: 22
break: true
---

This page provides a detailed guide to the Search page -- where you'll likely spend most of your time in Scalyr.

{{< figure src="/img/nuiLogOverview.png" width="1200">}}


**(1)** To search for a specific word or phrase, type it here. Numbers, punctuation, or phrases must be enclosed in
quotes. Example searches: ``error``, ``"503"``, ``"customer 1309"``. See the
[Query Language Reference](/help/query-reference) for a full description of the Scalyr
query language.



**(2)** As you type search text into the box, it is parsed and presented in a form that makes your search easier to read and understand.
Different parts of your search text such as fields, operators, and values are highlighted in order to visually differentiate them. For example, in the
search text "bytes > 5000", each of the three components will be a different color.

**(3)** Click here to specify the time range to search. The following options will appear:

{{< figure src="/img/nuiTimeDropdown.png">}}

By default, the last four hours are displayed. You can
[customize this default](/help/tips#defaultSearchTimeSpan).  

**(3a)** Click on a preset to quickly search that time range.

**(3b)** Enter the start time for your search. You can enter a time (e.g. ``14:30`` or ``5:05 AM``), a date (``May 23``),
or date and time (``5/14/2016 2:00 PM``), using a wide variety of date and time formats. You can also enter shortcuts
like ``5h`` to indicate five hours ago. See the [Time Syntax Reference](/help/time-reference)
for a complete list of options.

**(3c)** Enter the end time for your search. You can use any of the formats explained in **(3b)**. You can also
enter a shortcut beginning with ``+`` to specify the amount of time you'd like to search, e.g. ``+24h`` or ``+1d`` to
search a one-day period beginning at the From time.


**(4)** Click these buttons to scroll to the beginning or end of your time range.


**(5)** Use this button to continuously view new log messages matching your search. The log will update every
10 seconds.

In Live Tail mode, most controls are hidden, so that more of your screen is available for log messages. Click the
Stop button to return to the regular search view.

After 10 minutes, Live Tail updates will pause. Click "Restart Live Tail" to resume.


**(6)** Use these fields to search a specific server or log file. If you're using Kubernetes these will allow you to search cluster and controller name, respectively. You can use a single ``*`` as a
wildcard at the beginning or end (but not the middle) of the server or log file name.


**(7)** This area lists the fields Scalyr's parser has found in the log messages matching your search. By default,
it shows the top 100 fields, arranged alphabetically in a scrollable window (All Fields). Click the
dropdown and switch to Top Fields to view the most common fields first.

The number next to each field indicates how many distinct values appear in that field. (If there
are more than a few hundred distinct values, the number shown will be an estimate.)

Click on a field to bring up a list of its most common values:

{{< figure src="/img/nuiGraphableFieldValues.png">}}

**(7a)** Depending on the type of data, various graphing options appear as buttons:
- **Graph Values** graphs the selected field over time.
- **#Matches** graphs matching events per second, broken down by the selected field.
- **Distribution** graphs a distribution of the selected field.  

For more information on Scalyr's graphingt tools, see [Graphs](/help/graphs).

**(7b)** You can click on a value to restrict your graph to events having that field value. You can also use the `==` and `!=` symbols to include (or exclude) these values from your search.

**(7c)** The bars provide a visual indication of how often each value appears, while the numbers provide a more precise estimate. You can click on a value to restrict your graph to events having that field value.

**(7d)** Information concerning the estimated values is located here.

**(7e)** If the field has too many values to display on one screen, click "see more" to show up to a maximum of 200 values.


**(8)** This chart shows how many log messages match your search in each time period. You can use it to look for spikes in log volume. The bars show volume per time period. The dotted line shows a smoothed distribution of actual log volume over that time period.   


**(9)** Click the *Expand* link to generate a larger graph of the number of matching log messages. This will give you
access to the complete set of [graphing tools](/help/graphs).


**(10)** This marker indicates what time period you're scrolled to in the search view. Click anywhere in the bar chart to
jump to that point in time.


**(11)** This area shows the log messages matching your search. You can scroll horizontally to view long messages, and vertically to move through your selected time range. To jump to a specific point in time, click the appropriate spot
in the bar chart.


**(12)** You can also jump to a specific point in time by typing the desired time in this field and pressing Enter.


**(13)** Select some text to bring up additional options. From here, you can:
- Click "Filter For" to restrict your search to messages containing the selected text.
- Click "Exclude" to restrict your search to messages that don't contain the selected text.
- Click "New Search For" to discard your current search and display all log messages containing the selected text.
- Click "Inspect Fields" to see more information regarding this log message.
- Click "Switch To" to view messages from the specific server thread that generated this log message. (This works only for messages reported using Scalyr's Java API library.).

**(14)** The Inspect Fields button displays additional information for the selected log message:

{{< figure src="/img/nuiEventDetails.png" width="750">}}

**(14a)** Click Edit Parser to manage the parsing rules used for this log file.

**(14b)** Click See In Original Log to view the raw log file where this message originated.

**(14c)** Click See In Thread Log to view log messages from the specific server thread that generated this log
   message. (This works only for messages reported using Scalyr's Java API library.)

**(14d)** If the parser was able to identify a timestamp in the message, that value is used. Otherwise, the timestamp is assigned according to the time that the message was received by Scalyr's servers.

**(14e)** The full text of the log message is shown.

**(14f)** All fields Scalyr's parser was able to identify are listed in the Inspect Fields list. Server-specific fields are grouped and listed below the others.


**(15)** The **Display** button at the right of the search bar opens a dialog that allows you to tailor how your search results are displayed:

{{< figure src="/img/nuiLogViewSettings.png" width="600">}}

You can choose whether to view search results as log lines, or in a table. If you choose to view them in a table, you will need to select which fields to show.

A set of checkboxes let you control what information is included before each log message in the Matching Events list:

- **Date**: Select this to include the date Scalyr assigned to this log message. If the parser was able to identify a timestamp in the message, the date is extracted from value. Otherwise, the date is assigned according to the time that the message was received by Scalyr's servers.
- **Time**: Display the time assigned to this message. Works like the Date field, described above.
- **Server/Host**: Select this to include the name of the server or other source from which the message originated.
- **Log file**: Select this to include the name of the log file in which this message originated. If the message did not come from a log
  (e.g. it was imported via the Scalyr API), this field will be blank.
- **Raw log**: Select this to include the original raw log event.

Use the Add and All buttons to move fields from the Parsed Fields list over to the Fields to Show list. The Up, Down and Remove buttons let you navigate and remove fields in the Fields to Show list.

If you make changes and click 'OK' those settings will remain in effect as long as you stay on the search page.  Once you leave the search page, those changes will be lost.  If you find that every time you go to the search
page that you always choose the same few fields to be displayed, or never want to see the server/host for example, you
can make the changes you want then click Save As Default.  This will save those settings permanently until you modify
them in the future.


**(16)** Click the "Save" button in the left-center of the search bar to display the following Save actions for your current search:

- **Save Search**: Opens a dialog box that lets you save the active query to either your personal or team's list of saved searches; your list is selected by default. Saved searches are available in the Search main navigation menu.
- **Save as Alert**: Create a new alerting rule, which will trigger if the number of matches to your current search goes above or below a level you specify.
- **Save to Dashboard**: Add this search to an existing dashboard, or start a new dashboard with this search.
- **Download**: Download the current search results as a text file.
- **Export to S3**: Save search results to an S3 bucket.


**(17)** Click the "Share" button in the left-center of the search bar to display the following Share actions for your current search:

- **Copy Link**: Opens a modal window where you can copy a link to this search with relative time references replaced by absolute (e.g., instead of the searching the previous hour, it would search 8 a.m. to 9 a.m.).
- **Add to Shared Search List**: Opens a dialog box that lets you save the active search query to either your personal or team's list of saved searches; the team list is selected by default. Saved searches are available in the Search main navigation menu.
