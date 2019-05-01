---
title: Query Language Reference
---

# Query Language Reference

The Scalyr query language is used to select a set of events from your log data. It is used in searches and graphs,
alert triggers, report definitions, and elsewhere. Search text is highlighted as you type in order to make the query
more readable. Here are some sample queries.

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
[Getting Started](/help/getting-started#data) page.) You can 
select events which do or do not have a particular value, using the ``==`` and ``!=`` operators. 
``=`` can be used as a synonym for ``==``:

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
