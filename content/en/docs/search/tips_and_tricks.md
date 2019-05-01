---
title: Tips + Tricks
---

# Scalyr Tips + Tricks

## Copy and search selection

Dragging a selection of log text (or double clicking to select all) will let you right-click and copy the term. You can
also narrow your search on the selected text by clicking filter for, exclude it from the current search  
or start a new search with it included: 

[[[{type: "image", name: "eventTextSelection.png", maxWidth: 900}]]]

## Explore new terms without closing the current search

When refining a search, it's sometimes useful to duplicate the browser tab to explore new terms without losing the current search. 
In Google Chrome, right-click on the tab and select duplicate and continue refining in the new tab.  
  
[[[{type: "image", name: "chromeDuplicateTab.png", maxWidth: 275}]]]

## Use our [command-line utility](https://github.com/scalyr/scalyr-tool) to download search results
 
The [query](https://github.com/scalyr/scalyr-tool#querying-logs) command allows you to not only search and filter your logs, 
but retrieve raw log data as well. The following command lets you get the latest 1000 entries
in the log tagged as source=accessLog and download them in csv format with the columns status and uriPath.   
 
    scalyr query '$source="accessLog"' --output=csv --columns='status,uriPath' --count=1000


defaultSearchTimeSpan: <Default Search Time Span>
## Set the Default Search Time Span

By default all searches are performed for the past four hours. You can customize this by modifying the
[/scalyr/logs](/file?path=/scalyr/logs[[[emitAddlParamTeamTokenIfPhoenix]]]) configuration file.  Add a
``defaultSearchTimeSpan`` property to the JSON file. The value can be any time string between 5 minutes and 4 
hours; e.g. "10 minutes" or "2 hours". If you have a large log volume, using a shorter time span can speed up
searches.

    {
        ...
        
        defaultSearchTimeSpan: "20 minutes"
    }

defaultLogPageTimeout: <Set the Log Page Timeout Interval>
## Set the Log Page Timeout Interval

By default, the table on the Logs page displays data from servers that have uploaded logs or other data to Scalyr within the last 24 hours. If no data is received from a server after that timeout interval it is removed from this list. A note at the upper right of the page provides information on any such removed servers and logs.

You can customize this timeout interval if you wish, by opening the
[/scalyr/logs](/file?path=/scalyr/logs[[[emitAddlParamTeamTokenIfPhoenix]]]) config file and adding a
``defaultAgeLimitHoursInOverviewPage`` property as shown in the example below. The value can be any integer, representing hours. If, for example, you are monitoring an environment where virtual servers are created and deleted frequently, you may want to set this to just a few hours, to avoid having too many deleted servers persisting in the list.

    {
        ...
        
        defaultAgeLimitHoursInOverviewPage: 6
    }



originalLogTime: <Original Log or Thread Time>
## Set See In Original Log / Thread Time Window

When you click on a log line in the search page, an options bar is displayed that allows you take actions such 
as "Inspect Fields" or "See In Original Log". The "See In Original Log" action shows you all events from the 
same log file on that server/host around the time of the selected event. By default we do a search for all the 
events from that log file for an hour before the event you select and an hour after.  To narrow your time range 
and speed up the results you can set ``originalLogOrThreadTime`` in [/scalyr/logs](/file?path=/scalyr/logs) with 
a max time of 1 hour e.g. "1 second" or "5 minutes".  This would display the event in question and all other 
events from that log for the amount of time you specify before and after your highlighted event.  If you have a 
large log volume, using a shorter time span can speed up searches. 

    {
        ...
        
        originalLogOrThreadTime: "30 seconds"
    }


