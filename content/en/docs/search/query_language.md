---
title: Query Language
notoc: true
---

Scalyr offers a very simple query language to filter events from your log data. It is used throughout Scalyr, including searches, graphs,
alerts, reports, etc. 


## Examples

To find log events containing the word "error":

    error

To search for text containing spaces, digits, or punctuation, enclose it in quotes:

    "production-database"

To find access log events showing a request for "/index.html", in which at least 5000 bytes were returned:

    $logfile contains 'access_log' uriPath = '/index.html' <span class='search-box-operator-field'>bytes >= <span class='search-box-number'>5000

To find log events containing the phrase "deadline exceeded", from servers tagged as part of a database tier:

    deadline exceeded" $serverTier = database"


## Query Structure

A query can contain a number of terms. To select events matching all of the terms (i.e., an "AND" query),
you can simply enter the terms next to one another:

    $logfile contains 'access_log' uriPath = '/index.html'

You can also use explicit AND, OR, and NOT keywords to combine terms:

    $logfile contains 'access_log' and not (uriPath = '/home' or path = /away")

The operators ``&&``, ``||``, and ``!`` can be used as synonyms for AND, OR, and NOT:

    $logfile contains 'access_log' && !(uriPath = '/home' || uriPath = /away")


## Text search

To search for a word, simply type that word. This forms a search term, which can be combined
using explicit or implicit AND/OR. Here is a query which matches all events containing the word
"hello" and at least one of "sir" or "madam":

    hello (sir || madam)

To search for a more complex string, enclose it in single or double quotes:

    cache miss"
    '***critical error***'

You can also search using regular expressions. Enclose the expression in double quotes, preceeded
by a ``$``:

    $"/images/.*\.png"

All of these terms search in the "message" field of an event. For logs uploaded by the Scalyr Agent,
this field contains the complete text of the log message. However, you can also search in other
fields. To perform a string match, use the "contains" keyword:

    $logfile contains 'access_log' 'log[0-9]+'
    
For a regular expression match, use "matches": 

    uriPath matches '\\.png$'

All text search is case-insensitive.



## Fields

You can select events which do or 
do not have a particular value, using the ``==`` and ``!=`` operators. ``=`` can be used as a synonym
for ``==``:

    uriPath = '/index.html'
    status == 404
    client != localhost"

You can also use the ``<``, ``<=``, ``>``, and ``>=`` operators to compare values. For instance,
this query matches all requests with a status in the range 400-499:

    status >= 400 status <= 499

For field comparison operators, strings are treated as case sensitive.

When using a server attribute or logfile name, place a $ before the field name:

    $serverHost = 'frontend-1'

For fields that come directly from the log event, the $ is optional.

If a field name contains dashes, backslashes or other punctuation, use a backslash to escape those characters. For
instance, to display events with field service-name equal to "memcache":

    service\-name == memcache"

Finally, you can compare a field with the special value ``*`` to match events with any value in that
field:

    error == *


## Graph Functions

By default, the graph view will show the average (mean) value of the field you specify in the
Variable box. You can graph a different function by replacing the field name with an expression:

<!--- This is just to keep the table below from becoming unreadable -->
<style>
.td-content td > code {
  white-space: nowrap;
}
</style>

Function                 | Meaning
---|---
``mean(value)``          | Average (the same as if no function is used)
``min(value)``           | Smallest value
``max(value)``           | Largest value
``sumPerSecond(value)``  | Total value across all events, divided by elapsed time. For instance, if you                                   have a field ``responseSize`` which records the number of bytes returned by some                                   operation, then ``sumPerSecond(responsesize)`` will graph the bandwidth consumed                                   by this operation, in bytes per second.
``median(value)``        | The median (50th percentile) value.
``p10(value)``           | The 10th percentile value.
``p50(value)``           | The 50th percentile value.
``p90(value)``           | The 90th percentile value.
``p95(value)``           | The 95th percentile value.
``p99(value)``           | The 99th percentile value.
``p999(value)``          | The 99.9th percentile value.
``p(value, n)``          | The Nth percentile value. For instance, ``p(value, 80)`` gives the 80th percentile.
``fraction(expr)``       | The fraction (from 0 to 1) of events which match the given expression. For instance,                                   ``fraction(status >= 500 status <= 599)`` is the fraction of requests which have a                                   status in the 5xx range. You can use any query expression, as documented in the earlier                                   sections of this page.


## Ratios and Complex Expressions

A graph can combine multiple numeric queries into a single expression. For example, this expression
computes the ratio of log messages containing "error" to messages containing "success":

    count(message contains "error") / count(message contains "success")

A complex expression like this would be entered in the "search" field on the graph page. 

In this type of expression, you can use any number numeric queries, combining them with the standard
operatiors +, -, *, and /, as well as parenthesis. You can also use simple numbers. For instance, the
following expression shows free disk space in gigabytes, converting from the kilobyte units reported by
the Scalyr Agent:

    mean(value where $serverHost='frontend-1' metric='df.1kblocks.free' mount='/') / (1024*1024)

The general form of a numeric query is as follows:

      FUNCTION([FIELD where] FILTER)

FUNCTION is one of the functions listed below. FIELD is the name of a numeric event field;
if omitted, "value" is used. FILTER is a query. Examples:

    count

The number of log messages that contain the word "error".

    mean(bytes where uriPath == /home")

The average number of bytes returned in requests for /home.

    p[95](time where uriPath == /home")

95th percentile latency of requests for /home.

You can use any of the graph functions listed in the table above. The
generalized percentile operator ``p(value, n)`` becomes ``p[n](...)``, as shown in the example just above.
You can also use a ``count`` function, as shown in the first example above; this function gives the
number of events matching the query over each time period.
