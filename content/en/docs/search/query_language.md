---
title: Query Language
---

# Query Language

The Scalyr query language is used to select a set of events from your log data. It is used in data views,
alert triggers, report definitions, and elsewhere. Here are some sample queries.

All log messages containing the word "error":

    error

To search for text containing spaces, digits, or punctuation, enclose it in quotes:

    <span class='search-box-string'>"production-database"</span>

Access log events showing a request for "/index.html", in which at least 5000 bytes were returned:

    <span class='search-box-field-system'>$logfile</span> <span class='search-box-operator-comparison'>contains</span> <span class='search-box-string'>'access_log'</span> <span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>'/index.html'</span> <span class='search-box-operator-field'>bytes</span> <span class='search-box-operator-comparison'>>=</span> <span class='search-box-number'>5000</span>

Log messages containing the phrase "deadline exceeded", from servers tagged as part of a database tier:

    <span class='search-box-string'>"deadline exceeded"</span> <span class='search-box-field-system'>$serverTier</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>"database"</span>


structure: <Query Structure>
## Query Structure

A query can contain any number of terms. To select events matching all of the terms (an "AND" query),
you can simply enter the terms next to one another:

    <span class='search-box-field-system'>$logfile</span> <span class='search-box-operator-comparison'>contains</span> <span class='search-box-string'>'access_log'</span> <span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>'/index.html'</span>

You can also use explicit AND, OR, and NOT keywords to combine terms:

    <span class='search-box-field-system'>$logfile</span> <span class='search-box-operator-comparison'>contains</span> <span class='search-box-string'>'access_log'</span> <span class='search-box-operator-boolean'>and</span> <span class='search-box-operator-negation'>not</span> (<span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>'/home'</span> <span class='search-box-operator-boolean'>or</span> <span class='search-box-field'>path</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>"/away"</span>)

The operators ``&&``, ``||``, and ``!`` can be used as synonyms for AND, OR, and NOT:

    <span class='search-box-field-system'>$logfile</span> <span class='search-box-operator-comparison'>contains</span> <span class='search-box-string'>'access_log'</span> <span class='search-box-operator-boolean'>&&</span> <span class='search-box-operator-negation'>!</span>(<span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>'/home'</span> <span class='search-box-operator-boolean'>||</span> <span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>"/away"</span>)


search: <Text Search>
## Text search

To search for a word, simply type that word. This forms a search term, which can be combined
using explicit or implicit AND/OR. Here is a query which matches all events containing the word
"hello" and at least one of "sir" or "madam":

    hello (sir <span class='search-box-operator-boolean'>||</span> madam)

To search for a more complex string, enclose it in single or double quotes:

    <span class='search-box-string'>"cache miss"</span>
    <span class='search-box-string'>'***critical error***'</span>

You can also search using regular expressions. Enclose the expression in double quotes, preceeded
by a ``$``:

    <span class='search-box-regex'>$"/images/.*\.png"</span>

All of these terms search in the "message" field of an event. For logs uploaded by the Scalyr Agent,
this field contains the complete text of the log message. However, you can also search in other
fields. To perform a string match, use the "contains" keyword:

    <span class='search-box-field-system'>$logfile</span> <span class='search-box-operator-comparison'>contains</span> <span class='search-box-string'>'access_log'</span> <span class='search-box-string'>'log[0-9]+'</span>
    
For a regular expression match, use "matches": 

    <span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>matches</span> <span class='search-box-string'>'\\.png$'</span>

All text search is case-insensitive.


fields: <Field Comparison>
## Field Comparison

The most powerful searches rely on event fields. (For a review of fields, refer back to the
[Getting Started](/help/getting-started#data) page.) You can select events which do or 
do not have a particular value, using the ``==`` and ``!=`` operators. ``=`` can be used as a synonym
for ``==``:

    <span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>'/index.html'</span>
    <span class='search-box-field'>status</span> <span class='search-box-operator-comparison'>==</span> <span class='search-box-number'>404</span>
    <span class='search-box-field'>client</span> <span class='search-box-operator-comparison'>!=</span> <span class='search-box-string'>"localhost"</span>

You can also use the ``<``, ``<=``, ``>``, and ``>=`` operators to compare values. For instance,
this query matches all requests with a status in the range 400-499:

    <span class='search-box-field'>status</span> <span class='search-box-operator-comparison'>>=</span> <span class='search-box-number'>400</span> <span class='search-box-field'>status</span> <span class='search-box-operator-comparison'><=</span> <span class='search-box-number'>499</span>

For field comparison operators, strings are treated as case sensitive.

When using a field which is associated with a server or log file, place a $ before the field name:

    <span class='search-box-field-system'>$serverHost</span> <span class='search-box-operator-comparison'>=</span> <span class='search-box-string'>'frontend-1'</span>

For fields that come directly from the log event, the $ is optional.

If a field name contains spaces or punctuation, use a backslash to escape those characters. For
instance, to display events with field service-name equal to "memcache":

    <span class='search-box-field'>service\-name</span> <span class='search-box-operator-comparison'>==</span> <span class='search-box-string'>"memcache"</span>

Finally, you can compare a field with the special value ``*`` to match events with any value in that
field:

    <span class='search-box-field'>error</span> <span class='search-box-operator-comparison'>==</span> *


graphFunctions: <Graph Functions>
## Graph Functions

By default, the graph view will show the average (mean) value of the field you specify in the
Variable box. You can graph a different function by replacing the field name with an expression:

Function                 | Meaning
``mean(value)``          | Average (the same as if no function is used)
``min(value)``           | Smallest value
``max(value)``           | Largest value
``sumPerSecond(value)``  | Total value across all events, divided by elapsed time. For instance, if you \
                                  have a field ``responseSize`` which records the number of bytes returned by some \
                                  operation, then ``sumPerSecond(responsesize)`` will graph the bandwidth consumed \
                                  by this operation, in bytes per second.
``median(value)``        | The median (50th percentile) value.
``p10(value)``           | The 10th percentile value.
``p50(value)``           | The 50th percentile value.
``p90(value)``           | The 90th percentile value.
``p95(value)``           | The 95th percentile value.
``p99(value)``           | The 99th percentile value.
``p999(value)``          | The 99.9th percentile value.
``p(value, n)``          | The Nth percentile value. For instance, ``p(value, 80)`` gives the 80th percentile.
``fraction(expr)``       | The fraction (from 0 to 1) of events which match the given expression. For instance, \
                                  ``fraction(status >= 500 status <= 599)`` is the fraction of requests which have a \
                                  status in the 5xx range. You can use any query expression, as documented in the earlier \
                                  sections of this page.


complexExpressions: <Complex Expressions>
## Ratios and Complex Expressions

A graph can combine multiple numeric queries into a single expression. For example, this expression
computes the ratio of log messages containing "error" to messages containing "success":

    <span class='search-box-function'>count</span>(<span class='search-box-field'>message</span> <span class='search-box-operator-comparison'>contains</span> <span class='search-box-string'>"error"</span>) <span class='search-box-operator-math'>/</span> <span class='search-box-function'>count</span>(<span class='search-box-field'>message</span> <span class='search-box-operator-comparison'>contains</span> <span class='search-box-string'>"success"</span>)

A complex expression like this is entered in the "filter" field of the graph form. In this mode, the Variable field
is not used.

In this type of expression, you can use any number numeric queries, combining them with the standard
operatiors +, -, *, and /, as well as parenthesis. You can also use simple numbers. For instance, the
following expression shows free disk space in gigabytes, converting from the kilobyte units reported by
the Scalyr Agent:

    <span class='search-box-function'>mean</span>(<span class='search-box-field'>value</span> where <span class='search-box-field-system'>$serverHost</span><span class='search-box-operator-comparison'>=</span><span class='search-box-string'>'frontend-1'</span> <span class='search-box-field'>metric</span><span class='search-box-operator-comparison'>=</span><span class='search-box-string'>'df.1kblocks.free'</span> <span class='search-box-field'>mount</span><span class='search-box-operator-comparison'>=</span><span class='search-box-string'>'/'</span>) <span class='search-box-operator-math'>/</span> (<span class='search-box-number'>1024</span> <span class='search-box-operator-math'>*</span> <span class='search-box-number'>1024</span>)

The general form of a numeric query is as follows:

      FUNCTION([FIELD where] FILTER)

FUNCTION is one of the functions listed below. FIELD is the name of a numeric event field;
if omitted, "value" is used. FILTER is a query. Examples:

    <span class='search-box-function'>count</span>(<span class='search-box-field'>message</span> <span class='search-box-operator-comparison'>contains</span> <span class='search-box-string'>"error"</span>)

The number of log messages that contain the word "error".

    <span class='search-box-function'>mean</span>(<span class='search-box-field'>bytes</span> where <span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>==</span> <span class='search-box-string'>"/home"</span>)

The average number of bytes returned in requests for /home.

    <span class='search-box-function'>p[95]</span>(<span class='search-box-field'>time</span> where <span class='search-box-field'>uriPath</span> <span class='search-box-operator-comparison'>==</span> <span class='search-box-string'>"/home"</span>)

95th percentile latency of requests for /home.

You can use any of the graph functions described in the [Graph Functions](#graphFunctions) section. The
generalized percentile operator ``p(value, n)`` becomes ``p[n](...)``, as shown in the example just above.
You can also use a ``count`` function, as shown in the first example above; this function gives the
number of events matching the query over each time period.

When you use numeric queries in the Expression box, the graph Variable box is ignored.