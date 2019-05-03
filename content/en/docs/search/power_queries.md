---
title: PowerQueries
---

# PowerQueries

PowerQueries provide a rich set of commands for transforming and manipulating data. You can filter, perform
computations, extract new fields from your logs on the fly, and create groupings and statistical summaries. You
can freely mix and match commands, to create sophisticated analyses and find the answers you need.

To use PowerQueries, click on the Search menu and choose "PowerQueries", or simply navigate to [/query](/query). You
can also use PowerQueries in dashboards ([see below](#dashboards)).


## Cheat Sheet

Query syntax:

    filter-expression
    | command
    | command

 Commands:

    filter filter-expression

    let field=expression, field2=expression2, ...

    parse "format"
    parse from fieldname "format"

    lookup field=columnName, ... from "tableName" by columnName=expression, ...

    group function(expression), function2(expression2), ... by expression3, expression4, ...
    group name=function(expression), name2=function2(expression2), ... by name3=expression3, name4=expression4, ...

    sort expression, expression2, ...
    sort +expression, -expression2, ...

    limit
    limit nnn

    columns field, field2, ...
    columns field=expression, field2=expression2, ...

Grouping functions:

    count(), count(<condition>), sum, avg, min, max, median, stddev, estimate_distinct
    pct(99.9, <value>), p10, p50, p90, p99, p999

 Expressions:

    +, -, *, /, %
    <, <=, >, >=, ==, !=
    !, &&, ||
    ?:
    'string' or "string"
    <expression> contains "text"
    <expression> matches "regex"

Expression functions:

    abs, ceiling, floor, min, max, sqrt, exp, ln, log, pow
    len, lower, upper, ltrim, rtrim, trim, substr, replace, isempty, isblank

Comments:

    let x=y // two slashes indicate a comment, extending until the end of the line


examples: <Examples>
## Examples

Before we dive into the command syntax, here are a few examples that show the kinds of tasks you can accomplish with
PowerQueries. The first few examples assume you have a web access log named ``/var/log/access.log``, that has been
parsed using Scalyr's standard accessLog parser. However, PowerQueries can be used with any log format.

All queries begin with a standard Scalyr filter expression, speciying the data to be analyzed. This is followed
by one or more commands, each starting with a pipe character (``|``).


#### Example: Select Columns

The ``columns`` command allows you to display your logs as a table, showing a selected list of fields.

    $logfile='/var/log/access.log'
    | columns timestamp, status, uri

| timestamp               | status  | uriPath
| Jun 19  8:12:29.000 PM  |    200  | /home
| Jun 19  8:12:30.000 PM  |    200  | /about
| Jun 19  8:12:33.000 PM  |    404  | /hom


#### Example: Grouping

The ``group`` command allows you to aggregate events, grouping them by one or more fields, and computing aggregate
statistics for each group. In this example, we compute the number of requests for each page, the number of client-side
errors (4xx status), and the number of server-side errors (5xx status). We display the top 5 pages, by total request
count.

    $logfile contains 'access'
    | group total = count(),
            clientErrors = count(status >= 400 && status <= 499),
            serverErrors = count(status >= 500 && status <= 599)
            by uriPath
    | sort -total
    | limit 5

| uriPath            | total | clientErrors | serverErrors
| /home              |  8319 | 2            | 6
| /news              |  6214 | 108          | 39
| /blog              |  1125 | 31           | 0
| /login             |   538 | 14           | 2
| /about             |   122 | 0            | 0


#### Example: Data Transformation

The ``parse`` command allows you to extract new fields from your logs on the fly. The ``let`` command performs
arithmetic computations (and string manipulation). Suppose you have a debugging log which contains
some messages like this:

    image conversion processed 638KB in 0.326 seconds

This message contains two fields -- the data size, and the elapsed time. Ideally, you've already configured a
[parsing rule](/help/parsing-logs) that extracts these fields. But if not, you can use the ``parse`` command:

    "image conversion processed"
    | parse "image conversion processed $size$KB in $time$ seconds"

| size | time
|  638 | 0.326
| 1509 | 1.304
|  225 | 0.038

Using ``let``, you can then compute statistics such as the KB-per-second processing rate:

    "image conversion processed"
    | parse "image conversion processed $size$KB in $time$ seconds"
    | let kbPerSec = size / time

| size | time   | kbPerSec
|  638 | 0.326  | 1957.055
| 1509 | 1.304  | 1157.209
|  225 | 0.038  | 5921.053

Suppose that sometimes, no processing is needed, resulting in a message like this:

    image conversion processed 638KB in 0 seconds

This would throw off any further analysis. We can eliminate these messages using the ``filter`` command:

    "image conversion processed"
    | parse "image conversion processed $size$KB in $time$ seconds"
    | filter time > 0
    | let kbPerSec = size / time

Finally, let's compute some aggregate statistics, including the median and slowest processing rates per image:

    "image conversion processed"
    | parse "image conversion processed $size$KB in $time$ seconds"
    | filter time > 0
    | let kbPerSec = size / time
    | group conversions=count(), totalSize=sum(size), medianPerf=median(kbPerSec), slowestPerf=min(kbPerSec) by 1

| 1 | conversions |  totalSize | medianPerf | slowestPerf
| 1 |      53,193 | 42,163,408 |   1340.616 |     138.772

Grouping ``by 1`` is a trick to put all records in a single group.


#### Example: Count Unique IPs

The ``estimate_distinct`` function can be used in a ``group`` command to compute the number of
distinct IP addresses in your access logs:

    $logfile='/var/log/access.log'
    | group estimate_distinct(ip) by 1

| 1 | estimate_distinct(ip)
| 1 | 209570


#### Example: Looking Up Customer Names

The ``lookup`` command can be used to retrieve information from a static table. Suppose that in the configuration
file /datatables/customers, you have information about your customers:

    {
      columnNames: ["id", "name", "region"],
      rows: [
        [111, "Acme", "US"],
        [222, "BuyNLarge", "US"],
        ...
      ]
    }

Now suppose that you have log records that mention your customers by ID, but you'd like to prepare a report by
customer name. The ``lookup`` command enables this:

    $logfile='customer_purchases.log'
    | group count(), sum(price) by customerId
    | lookup name from "customers" by id=customerId



using: <Using PowerQueries>
## Using PowerQueries

All queries begin with a standard Scalyr filter expression, specifying the data to be analyzed. To set up a query,
it's often easiest to begin on the regular Scalyr [log search page](/events). Use the search field or facet list
to select the events you wish to process. Then click on the Search menu and choose "PowerQueries" to copy your
filter to the query page.

Alternately, you can simply navigate to [/query](/query) and type a filter into the edit box.

Once you've created your filter, you can then begin adding processing commands. Each command starts with a pipe
character (``|``) and the command name, such as ``parse`` or ``group``. For readability, it is typically best to
start each command on a new line, but this is not required.

Once you've added commands to create your query, execute it by clicking the magnifying class icon (below the right
corner of the edit box) or typing Command-Enter. You'll see a table containing the query output.


## Query Commands
The following commands are supported:

| Command               | Description
| [filter](#filter)     | Selects events or records to process
| [let](#let)           | Performs computations
| [parse](#parse)       | Extracts fields from log data
| [lookup](#lookup)     | Retrieves values from a lookup table stored in a configuration file
| [group](#group)       | Groups events together, and computes summary statistics for each group
| [sort](#sort)         | Sorts a table
| [limit](#limit)       | Limits the number of records displayed
| [columns](#columns)   | Specifies which columns to display, and/or renames columns


expressions: <Expression Syntax>
## Expression Syntax

Most commands contain one or more "expressions", which specify values and computations. The following are supported:

- Boolean constants (true, false)
- Numeric constants (3.14, -9, 6.02e+23)
- String constants, using single- or double-quotes ("hello", 'goodbye') and backslash escapes ("nested \"quote\"")
- Arithmetic operators: +, -, *, /, %, and negation (``-x``)
- Comparison operators: <, <=, >, >=, ==, !=
- Boolean operators: !, &&, ||, AND, OR, NOT
- Ternary operator: ``test ? value-if-true : value-if-false``
- Search operator: ``expression contains "searchString"`` (can use single or double quotes)
- Regex operator: ``expression matches "regex"`` (can use single or double quotes)
- Parenthesis
- Identifiers (``serverHost``, ``status``, etc.)
- Functions (e.g. ``sqrt(x)``); see [Function Reference](#functions)

Identifiers can be used to reference event fields (e.g. ``status``) or server fields (e.g. ``serverHost``) in the
input events. Note that ``$`` is not needed (or allowed); use ``serverHost``, not ``$serverHost``.

Identifiers can contain hyphens, e.g. ``k8s-controller``. To force the hyphen to be interpreted as subtraction,
insert spaces: ``k8s - controller``. To use other punctuation characters in an identifier, or to avoid warnings
due to the use of a hyphen, preceed the character with a backslash, e.g. ``field\#name``.

The ``let``, ``parse``, ``lookup``, ``columns``, and ``group`` commands create new fields that can be used by subsequent
commands. For instance, ``let kbPerSec = size / time`` creates a new field ``kbPerSec``. ``let``, ``parse``, and
``lookup`` add fields; ``group`` and ``columns`` create entirely new records. Thus, after a ``group`` or
``columns`` command, you can only use fields which were defined by that command.

If a query uses a field which is not present in an event, the missing field will be given the value ``null``.


filter: <Filter Command>
## Filter Command

    filter filter-expression

 Example:

    filter status == 502

This command discards records that do not satisfy the specified condition. You can filter raw events; filter events
based on a value extracted by a ``parse`` or ``lookup`` command or computed by a ``let`` command; or filter records
created by a ``group`` command.

The syntax is essentially the same as Scalyr's [standard filter language](/help/query-reference). It supports
all features of the expression syntax (see previous section), except for the ternary (``?:``) operator. In addition, the
following features of Scalyr's standard filter language are supported:

- A simple keyword (``error``) or string literal (``"transaction complete"``) performs a text search in the "message" field of an event.
- The syntax ``$"regex"``, i.e. a dollar sign followed by a regular expression in double quotes, performs a regex search in the "message" field of an event.
- The syntax ``fieldname = *`` matches all events having a value for that field.
- The && operator is optional. To search for A and B, you can simply say ``A B``.


let: <Let Command>
## Let Command

    let field=expression, field2=expression2, ...

 Example:

    let isError = (status >= 500 && status <= 599)

This command defines one or more new fields. You can't overwrite a field which was defined by a preceeding command. Use
``let`` to perform arithmetic computations or string manipulation on values from a raw event, values extracted by a
``parse`` or ``lookup`` command, or records created by a ``group`` command.


parse: <Parse Command>
## Parse Command

    parse "format"
    parse from fieldname "format"

 Example:

    parse "image conversion processed $size$KB in $time$ seconds"

This command extracts fields from your logs on the fly. If ``from fieldname`` is not specified, we parse the message
field (which contains the complete raw log message).

The format rule is the same as a "format" specifier in Scalyr's [standard parser syntax](/help/parsing-logs), with
the following exceptions:

- The expression may match any substring of the input, rather than having to start at the beginning of the line.
- "parse=" directives, such as parse=json or parse=uri, are not supported.
- The special "_" field name (for parsing key/value pairs) is not supported.
- Features which are not part of a format specifier, such as rewrite rules, combiner rules to group multi-line messages, or "repeat" clauses, are not supported.

A parsing rule can't create a field with the same name as a field which was defined by a preceeding command. Use a
different name instead.

 Tips:

- Include a filter command before your parse command, to ensure that you're only parsing messages that will match the
  expected format. This will improve performance and avoid garbage output.
- Instead of using the parse command, consider adding a rule to your ingestion-time [log parser](/parsers).
  Parsing logs when they are ingested results in faster queries, removes the need to use a parse command, and allows
  exploring field values using Scalyr's graphical tools.


lookup: <Lookup Command>
## Lookup Command

    lookup field=columnName, field2=columnName2, ... from "tableName" by columnName3=expression3, columnName4=expression4, ...

Examples:

    lookup name from "customers" by id=customerId
    lookup instanceCost="cost" from "instanceTypes" by region, "type"=instanceType

This command retrieves values from a lookup table stored in a configuration file. The file should have a name of the
form /datatables/TABLE_NAME, e.g. ``/datatables/customers``, and should contain a JSON structure like this:

    {
      columnNames: ["id", "name", "region"],
      rows: [
        [111, "Acme", "US"],
        [222, "BuyNLarge", "US"],
        ...
      ]
    }

There may be any number of column names. Each row should have the same number of entries as there are columns. Within
a row, values can be null, boolean, numbers, or strings.

The lookup command searches for the first row which matches all of the fields specified in the ``by`` clause. It
then retrieves the specified columns from that row. If the table doesn't have any matching row, then null values
are used.

Each entry in the ``by`` clause specifies a table column to search in, and an expression giving the value to look for.
Any of the following forms are supported:

- ``fieldName``: fieldName must be both the name of a table column, and a field in the current query.
- ``fieldName=expression``: matches table rows where the value of the expression equals the value in the specified column.
- ``"fieldName"=expression``: same as preceeding; use quotes when the column name contains punctuation.

If the expression evaluates to ``null``, then the lookup will match table entries containing ``null`` in the corresponding
column. In other words, ``null == null``.

Each entry in the initial part of the command (before ``from`) specifies a value to retrieve from the table. Any of the
following forms are supported:

- ``fieldName``: retrieve the column of that name, and place its value in a field of the same name.
- ``fieldName=columnName``: retrieve "columnName", and place its value in a field named "fieldName".
- ``fieldName="columnName"``: same as preceeding; use quotes when the column name contains punctuation.


group: <Group Command>
## Group Command

    group function(expression), function2(expression2), ... by expression3, expression4, ...
    group name=function(expression), name2=function2(expression2), ... by name3=expression3, name4=expression4, ...

Examples:

    group total = count(), errors = count(status >= 500 && status <= 599) by uriPath
    group count(), median(latency) by region, environment
    group estimate_distinct(ip) by 1

This command aggregates events, grouping them by one or more fields, and computing aggregate statistics for each group.
The result is a new table, with one row for each unique combination of the grouping fields, and one column for each
function (e.g. ``median(latency)``) or grouping field (e.g. ``region``). The following functions are supported:

| Function            | Description
| count()             | Counts the number of records in the group.
| count(expression)   | Counts the number of records for which the expression is true / nonzero / nonempty.
| sum(expression)     | The sum of all inputs, ignoring null, NaN, or non-numeric inputs. If there are no eligible inputs, the result is 0.
| avg(expression)     | The average of all inputs, ignoring null, NaN, or non-numeric inputs. If there are no eligible inputs, the result is NaN.
| min(expression)     | The smallest input, ignoring null, NaN, or non-numeric inputs. If there are no eligible inputs, the result is NaN.
| max(expression)     | The largest input, ignoring null, NaN, or non-numeric inputs. If there are no eligible inputs, the result is NaN.
| median(expression)  | The median input, ignoring null, NaN, or non-numeric inputs. If there are no eligible inputs, the result is NaN.
| pct(NN, expression) | A percentile of the inputs, ignoring null, NaN, or non-numeric inputs. NN should be a number from 0 to 100. For instance,\
pct(99.9, latency) yields the 99.9th percentile of the "latency" field. If there are no eligible inputs, the result is NaN.
| p10(expression)     | The 10th percentile of the inputs.
| p50(expression)     | The 50th percentile of the inputs. (This is the same as the median.)
| p90(expression)     | The 90th percentile of the inputs.
| p99(expression)     | The 99th percentile of the inputs.
| p999(expression)    | The 99.9th percentile of the inputs.
| stddev(expression)  | The standard deviation of the inputs, ignoring null, NaN, or non-numeric inputs. If there are no eligible inputs, the result is NaN.
| estimate_distinct(expression) | Estimates the number of distinct values in the group. Null is ignored, but NaN is counted as a value. \
Scalyr uses the HyperLogLog algorithm, configured for 1.3% median error, meaning that the result will generally be correct to within 1 or 2 \
percent, even if there are millions of unique values. If there are a small number of unique values, the result will be exact.

If there is no ``sort`` command after the last ``group`` command in a query, then by default the results are sorted by
the grouping field(s), in ascending order.


sort: <Sort Command>
## Sort Command

    sort expression, expression2, ...
    sort +expression, -expression2, ...

 Example:

    sort -error_rate

This command determines the order in which records are displayed. If you specify multiple sort columns, the one listed
first takes precedence, and the remaining column(s) are used to break ties. ``+`` specifies ascending order, and ``-``
specifies descending order. The default is ascending order.


limit: <Limit Command>
## Limit Command

    limit
    limit NNN

 Example:

    limit 10

This command imposes a cap on the number of records displayed, or the number of records processed by subsequent commands.
If ``limit`` is used without specifying a number, 10 records are displayed.


columns: <Columns Command>
## Columns Command

    columns field, field2, ...
    columns field=expression, "field2"=expression2, ...

 Example:

    columns timestamp, isError = (status >= 500 && status <= 500), uri

This command can be used to select fields for display, rename or reorder fields, and/or compute new fields. A typical
application is to place this command at the end of your query, to "clean up" the query output by discarding fields
that were only needed for intermediate processing, and to assign friendly field names.

The column name can optionally be enclosed in double-quotes. This allows including spaces or other characters in the
final name of a column, for display purposes. This should normally only be used as the last command of a query, as
such names are not easily referenced in subsequent commands.


functions: <Function Reference>
## Function Reference

The following functions are supported in expressions (including filter expressions).

Numeric functions:

| Function     | Description
| abs(x)       | The absolute value of x
| ceiling(x)   | x, rounded up to an integer
| floor(x)     | x, rounded down to an integer
| min(x, y)    | The smmaller of x and y
| max(x, y)    | The larger of x and y
| sqrt(x)      | The square root of x
| exp(x)       | The standard exponential function, e^x
| ln(x)        | The natural (base-e) logarithm of x
| log(x)       | The base-10 logarithm of x
| log(x, y)    | The logarithm of x in base y
| pow(x, y)    | x to the power of y, x^y

String functions:

| Function         | Description
| len(x)           | The number of characters in x
| lower(x)         | x, with all letters changed to lowercase
| upper(x)         | x, with all letters changed to uppercase
| ltrim(x)         | x, with leading whitespace removed
| ltrim(x, y)      | x, removing any initial characters which are found in y. For instance, ``ltrim("abbabca", "ab")`` yields ``"ca"``. \
 y must be a string constant, and can only contain ASCII characters.
| rtrim(x)         | x, with trailing whitespace removed
| rtrim(x, y)      | x, removing any trailing characters which are found in y. For instance, ``rtrim("acabbab", "ab")`` yields ``"ac"``. \
 y must be a string constant, and can only contain ASCII characters.
| trim(x)          | x, with leading and trailing whitespace removed
| trim(x, y)       | x, removing any leading or trailing characters which are found in y. For instance, ``trim("abcabcabc", "ab")`` yields ``"cabc"``. \
 y must be a string constant, and can only contain ASCII characters.
| substr(x, y)     | A copy of x, with the first y characters removed. If y is greater than the length of x, the result is an empty string.
| substr(x, y, z)  | z characters of x, starting at position y. If y is greater than the length of x, the result is an empty string. If \
z is greater than the number of characters after position y, then the entire string starting at position y is returned.
| replace(x, y, z) | x, with all matches for y replaced by z. y and z must be string constants: y specifies a regular expression, \
and z is a simple string. Matching is not case sensitive. y cannot be empty. NOTE: reference groups are not supported in the replacement string.
| isempty(x)       | True if x is null or an empty string.
| isblank(x)       | True if x is null, an empty string, or contains only whitespace.


dashboards: <Dashboards>
## PowerQueries in Dashboards

You can include the output of a query in a dashboard. To do this:

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


advanced: <Advanced>
## Advanced Notes

Performance tips:

- Try to move ``filter`` commands higher in the query. If possible, filter before parsing, grouping, or sorting.
- Instead of using the ``parse`` command, configure a [parsing rule](/parsers) to extract fields as events
  are ingested.
- Use field-based filters (e.g. ``customer=a1234567``) instead of simple text search (``"a1234567"``).
- In ``group`` commands, group by as few fields as possible. If you are grouping on a high cardinality field (a field
  with many different values), try to group on a field with fewer / simpler values. For instance, rather than grouping
  by complete URL (including query parameters), group by just the path portion of the URL.
- If possible, defer ``lookup`` commands until after grouping, so that the lookup is only performed once per group.

In the rare circumstance that you'd like to begin a query with a command other than filter, add an initial pipe character:

    | group total_message_count=count() by region

Internally, the query engine works with boolean values, 64-bit IEEE floating-point numbers, UTF-8 strings, and nulls. Operators
interact with types as follows:

- Arithmetic operators yield NaN unless both inputs are numbers. Exception: if either input to + is a string, then both
  arguments are converted to strings, and string concatenation is performed.
- Comparison operators: if both inputs are numbers, numeric comparison is performed; if both inputs are strings,
  lexicographic comparison is performed; if both inputs are booleans, then "false" is treated as smaller than "true";
  if both inputs are null, then they are treated as equal; otherwise, the results are undefined.
- Boolean operators: both arguments are converted to booleans. ``null``, ``0``, and the empty string are treated as false; all
  other non-booleans are treated as true.


memoryLimit:
## Memory Limits
If your query matches a large number of records, you may see a message like this:

``    ``213,408 of 37,059,484 matching events (0.576%) were omitted due to memory limits.

This occurs if the intermediate table used by the query exceeds a specified limit; usually, 20,000 rows. Each ``group``
command creates an intermediate table. So if a limit is reached, it will usually occur at the first ``group`` command.
If you have no ``group`` command anywhere in your query, then the limit applies to the entire output of the query.

The message tells you how much data was excluded due to the limit. This can result in some rows missing in the query
output. Sometimes, it can also result in under-counted statistics. This is because processing and grouping occurs
in a distributed fashion; it could be that one processing node includes a certain row in its 20,000 limit, but on
another node that row didn't fit within the limit. When the intermediate results are combined, the result could be
a row with partial data. However, in all scenarios, you can be confident that the result fully reflects the number
of events specified in the "memory limits" message -- in the example, 99.424% of all events which match the query.

If the query uses an unusually large amount of memory, tables may be limited to less than 20,000 rows. For instance,
if you are working with very large strings, or using multiple instances of the ``estimate_distinct`` function. The
"memory limits" message will accurately reflect this.

Some techniques to avoid memory limits:

- Try to move ``filter`` commands higher in the query. If possible, filter before grouping or sorting.
- If you are grouping by multiple fields, try reducing the number of fields you're grouping on. Grouping by
  multiple fields may result in a large number of tiny groups, which are often not useful for analysis in any case.
- If you are grouping on a high cardinality field (a field with many different values), try to group on a field with
  fewer / simpler values. For instance, rather than grouping by complete URL (including query parameters), group by
  just the path portion of the URL.
