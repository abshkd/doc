---
title: "The Scalyr API & CLI"
---

You can use the Scalyr API to send and retrieve log data directly from Scalyr servers, as well as manage
configuration files. It is usually most convenient to use the [Scalyr Agent](/help/scalyr-agent) to
send log files, and to view logs on the web site. We also provide a [Java client library](/help/java-api)
and a [command-line tool](/help/command-line). But if you'd like to talk directly to 
the Scalyr servers from a language other than Java, you've come to the right place.

The Scalyr API includes the following methods:

- [uploadLogs](/help/api-uploadLogs) -- insert raw log text
- [addEvents](#addEvents) -- insert structured log events
- [query](#query) -- retrieve log events
- [numericQuery](#numericQuery) -- retrieve numeric / graph data
- [timeseriesQuery](#timeseriesQuery) -- optimized variant of numericQuery for repetitive queries
- [facetQuery](#facetQuery) -- retrieve the most common values for a field
- [powerQuery](#powerQuery) -- execute a PowerQuery
- [getFile](#getFile) -- retrieve a configuration file
- [putFile](#putFile) -- create, update, or delete a configuration file
- [listFiles](#listFiles) -- list configuration files
- [apiKeys](#apiKeys) -- create, update, or delete API keys
- [inviteUser](#inviteUser) -- invite user to a team
- [editUserPermissions](#editUserPermissions) - edit user permissions
- [revokeAccess](#revokeAccess) - revoke user access
- [listUsers](#listUsers) -- list users with access to the team
- [addGroup](#addGroup) -- add a permission group
- [editGroupPermissions](#editGroupPermissions) - edit group permissions
- [removeGroup](#removeGroup) - remove a group
- [listGroups](#listGroups) - list groups
- [addUsersToGroup](#addUsersToGroup) - add users to a group
- [removeUsersFromGroup](#removeUsersFromGroup) - remove users from a group
- [listUsersInGroup](#listUsersInGroup) - list users in a group
- [createTimeseries](#createTimeseries) -- (deprecated)


format: <API Format>
## API Format

(Note: this section does not apply to the uploadLogs API, which uses simple text bodies.)

To invoke a Scalyr API method, send an HTTPS POST to the URL for the method you wish to invoke. The
request should have Content-Type "application/json", and the body should be a JSON-formatted, UTF-8
encoded string. The response is also a JSON-formatted, UTF-8 encoded string.

The query, numericQuery, facetQuery, timeseriesQuery, and powerQuery methods can also be invoked via GET, passing arguments
in standard URL format. (Remember to encode spaces as %20.) When invoked in this fashion, the response will still be JSON.

The response will always include a "status" property, indicating whether the operation succeeded or failed.
Status codes are hierarchical, with slash-delimited components. For example, "error/client" and
"error/server" both indicate that the operation failed, but one indicates that the problem was the client's
fault and the other the server's fault. New status values may be added in the future, but they will
generally extend (refine) existing values. So when checking the status value, always be prepared for extra
text -- check startsWith() instead of equals(). Each method may list one or more responses specific to that
method. In addition, the following responses are possible for all methods:

Response if the request is somehow incorrect ("your fault"):

    {
      "status":  "error/client",
      "message": "a human-readable message"
    }

Response if the server experiences an internal error while processing the request ("our fault"):

    {
      "status":  "error/server",
      "message": "a human-readable message"
    }

If the server is overloaded, or for some other reason is temporarily unable to process the request, it will return a
status of "error/server/backoff". When this status is returned, you may wish to retry the request after a short delay.
You should also retry after a delay in the case of server errors (5xx status code), 429 status code ("Too Many Requests"),
or a request timeout.

Note that new status values, in particular new error statuses, may be added in the future. Please treat any unexpected
status value like "error".

When an error is returned, the HTTP status code will contain an appropriate non-200 value. Some HTTP client libraries
---
title: "Scalyr API & CLI"
weight: 90
---

(such as the standard Java library) don't provide access to the response body when the status code is not 200, making
it difficult to get a detailed error message. If you provide an "errorStatus" request header with value "always200",
the Scalyr server will return a 200 status code even for errors. In this mode, to detect errors, check the JSON
response body for a status string beginning with "error". Note that some low-level errors may still yield a non-200
status code.

addEvents: <addEvents>
## addEvents

This method is used to insert events (log records). You can insert one or more events per request. If you are
generating many events per second, you should group them into batches and have each server upload a batch every
few seconds.

To upload raw log text, it is usually easier to use the [uploadLogs](/help/api-uploadLogs) method.

*Note: only recent events (events with a timestamp in the last few minutes) can be uploaded. Due to the way Scalyr
Logs indexes events, older events will be discarded. If this is a problem for you, [e-mail us](mailto:support@scalyr.com) and
we can make adjustments for your account.*

#### URL

[[[publicAppUrl(addEvents,nolinkify)]]]

#### Input

    {
      "token":           "xxx",
      "session":         "yyy",
      "sessionInfo":     {...},
      "events":          [...],
      "threads":         [...]
    }

**token** should be a "Write Logs" API token. Find API tokens at [[[publicAppUrl(keys)]]]. 

**session** is an arbitrary string which should uniquely define the lifetime of the process
which is uploading events. An easy way to generate the session parameter is to generate a
[UUID](http://en.wikipedia.org/wiki/Universally_unique_identifier) at process startup and store the
value in a global variable. **Do not create a new session identifier for each request**; if you
create too many session identifiers, we may be forced to rate-limit your account. However, you should
use a different session for each server or process, as timestamps must be in-order within a session
(discussed below).

**sessionInfo** is optional. It can be used to specify fields associated with the uploading process.
These fields can then be used when querying the uploaded events. For instance:

    {
      "serverHost": "front-1",
      "serverType": "frontend",
      "region":     "us-east-1"
    }

You should generally specify at least a ``serverHost`` field, containing your hostname or some other stable server
identifier. Scalyr uses this value to organize events from different servers.

sessionInfo should remain the same for all API invocations that share a session value. If not, Scalyr might
ignore the changes to sessionInfo and associate the original sessionInfo with all events for that session.

**events** contains zero or more event records, as defined in the next section.

**threads** is optional. If present, it should contain a series of objects of the form
``{"id": "...", "name": "..."}``, one for each unique thread ID appearing in the events list. This is
used to associate a readable name with each thread.

NOTE: the request body can be at most 3,000,000 bytes in length. Longer requests will be rejected. To avoid problems,
if you have a large number of event records to upload, you should issue them in batches well below the 3,000,000 byte
limit.

#### Events

(You may wish to review the Scalyr data model, as documented in the [Getting Started](/help/getting-started#data) 
guide, before continuing.)

An event record looks like this:

    {
      "thread": "identifier for this server thread (optional)",
      "ts": "event timestamp (nanoseconds since 1/1/1970)",
      "type": nnn,
      "sev": nnn,
      "attrs": { ... }
    }

Note that the timestamp is specified as a string, not a number. This is because some JSON packages convert all numbers to
floating-point, and a standard 64-bit floating point value does not have sufficient resolution for a nanosecond timestamp.
Scalyr uses timestamps internally to identify events, so the ts field must be strictly increasing -- each event
must have a larger timestamp than the preceding event. This applies to all /addEvents invocations for a given session;
each session (identified by the session parameter to /addEvents) has an independent timestamp sequence. So one easy way
to ensure valid timestamps is for each client to keep track of the last timestamp it used, and ensure that the next
timestamp it generates is at least 1 (nanosecond) larger.

The type field indicates a "normal" event, or the beginning or end of an event pair. A normal event has type 0, start
events have type 1, and end events have type 2. This field is optional (defaults to 0).

The "sev" (severity) field should range from 0 to 6, and identifies the importance of this event, using the classic
scale "finest, finer, fine, info, warning, error, fatal". This field is optional (defaults to 3 / info).

The attrs field specifies the "content" of the event. A simple event might contain only a single text field:

    { "message": "record 39217 retrieved in 19.4ms; 39207 bytes" }

However, it's better to break out individual components so that they can be queried on later:

    {
      "message": "record retrieved",
      "recordId": 39217,
      "latency": 19.4,
      "length": 39207
    }

Note that numeric values should be passed as JSON numbers, not quoted strings.

#### Responses

Normal response:

    {
      "status": "success",
    }

If an error occurs, a different status code will be returned. In some cases, a success status may
be accompanied by a "message" field containing a warning message; for instance, if some events had
to be discarded because they were too old (see above).

#### Example

A complete request:

    {
      "token": "xxx",
      "session": "149d8290-7871-11e1-b0c4-0800200c9a66",
      "sessionInfo": {
        "serverType": "frontend",
        "serverId": "prod-front-2"},
      "events": [
        {
          "thread": "1",
          "ts": "1332851837424000000",
          "type": 0,
          "sev": 3,
          "attrs": {
            "message": "record retrieved",
            "recordId": 39217,
            "latency": 19.4,
            "length": 39207
          }
        }
      ],
      "threads": [
        {"id": 1, "name": "request handler thread"},
        {"id": 2, "name": "background processing thread"}
      ]
    }


query: <query>
## Log Query

This method is used to retrieve events (log records). You can retrieve all events in a specified time range, or
only events matching specific criteria.

#### URL

[[[publicAppUrl(api/query,nolinkify)]]]

#### Input

    {
      "token":             "xxx",
      "queryType":         "log",
      "filter":            "...",
      "startTime":         "...",
      "endTime":           "...",
      "maxCount":          nnn,
      "pageMode":          "...",
      "columns":           "...",
      "continuationToken": "...",
      "priority":          "..."
    }

**token** should be a "Read Logs" API token. Find API tokens at [[[publicAppUrl(keys)]]].

**queryType** should be ``log``.

**filter** specifies which events to match, using the same syntax as the Expression field in the
query UI. To match all events, omit this field or pass an empty string.

**startTime** and **endTime** specify the time range to query, using the same syntax as the Start and End
fields in the query UI. You can also supply a simple timestamp, measured in seconds, milliseconds, or
nanoseconds since 1/1/1970.

The default is to query the last 24 hours. If you specify startTime but not endTime, the query covers 24
hours beginning at the startTime. If you specify endTime but not startTime, the query covers 24 hours
ending at the endTime.

**maxCount** specifies the maximum number of records to return. You may specify a value from 1 to 5000.
The default is 100.

**pageMode** applies when the number of events matching the query is more than maxCount. Pass
``head`` to get the oldest matches in the specified time range, or ``tail`` to get the newest. The
default is head if you specify a startTime, tail otherwise.

**columns** specifies which fields to return for each log message. Omit this parameter (or pass an
empty string) to return all fields.

**continuationToken** is used to page through result sets larger than maxCount. Omit this parameter
for your first query. You may then repeat the query with the same filter, startTime, endTime, and
pageMode to retrieve further matches. Each time, set continuationToken to the value returned by the
previous query.

When using continuationToken, you should set startTime and endTime to absolute values, not relative values
such as ``4h``. If you use relative time values, and the time range drifts so that the continuation token
refers to an event that falls outside the new time range, the query will fail.

**priority** specifies the execution priority for this query; defaults to "low". Use "low" for background
operations where a delay of a second or so is acceptable. Low-priority queries have more generous rate limits.

The query API can also be invoked using GET, passing the parameters using URL encoding:

    curl '[[[publicAppUrl(api/query?queryType=log&maxCount=1&token=XXX,nolinkify)]]]'

When using GET, remember to encode spaces as %20.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See
the API Overview section for details. Otherwise, the response should have the following structure:

    {
      "status": "success",
      "matches": [
        {
          "timestamp": "1393009097459537089",
          "message": "hello, world",
          "severity": 3,
          "session": "sess_d5952fdd-eed2-45f1-8106-b2f2af55dabd",
          "thread": "28",
          "fields": {
            "tag": "foo"
          }
        }
      ],
      "sessions": {
        "sess_d5952fdd-eed2-45f1-8106-b2f2af55dabd": {
          "serverHost": "some.host.name",
          "serverIP": "1.2.3.4",
          "session": "sess_d5952fdd-eed2-45f1-8106-b2f2af55dabd"
        }
      },
      "executionTime": 12,
      "continuationToken": "L6_ckjI4BgATVPZkxGaUwQ--"
    }

**matches** lists the events matching the query, up to maxCount. Matches are always given in ascending
timestamp order, regardless of whether you are paging forwards or backwards. Each match contains the following
fields:

- timestamp: The time of this event, in nanoseconds since 1/1/1970.
- message: The raw log line from which this record was derived. If the record was created using the addEvents
    API and did not specify a message field, this field will be empty or missing.
- severity: A severity level, using the standard 0-6 numbering scheme. By default, records have a value of 3
    ("info").
- session: The session ID for this record, as specified in the addEvents API.
- thread: The thread ID for this record, as specified in the addEvents API.
- fields: Additional fields for this record, as created by a log parser or in the addEvents API.

(If you specify a columns list, any fields not listed will not appear in the match objects. This applies
to built-in fields like timestamp and message, as well as fields in the fields object.)

**sessions** contains an entry for each session mentioned in the matches list. For each session, it lists
the fields associated with that session. This includes the hostname and IP address of the server from
which you uploaded these events, along with any other fields specified in the sessionInfo parameter
of the addEvents API. (For the Scalyr Agent, these are the fields specified in the ``server_attributes``
field of the configuration file.)

**executionTime** indicates how much time our server spent processing this query, in milliseconds. Your API queries
are limited to 30,000 milliseconds of processing time, replenished at 36,000 milliseconds per hour. If you exceed
this limit, your queries will be intermittently refused. (Your other uses of Scalyr, such as log uploading or
queries via the web site, will not be impacted.) If you need a higher limit, [let us know](mailto:support@scalyr.com).

**continuationToken** may be passed to a subsequent API call, to retrieve additional matches. Note that this
field may be present in the response even if there are no further matches to retrieve. If you use the continuationToken
in a subsequent query, make sure to repeat the same filter, startTime, endTime, and pageMode as the previous query,
and set startTime and endTime to absolute values (not relative values such as ``4h``). If you use relative time values,
and the time range drifts so that the continuation token refers to an event that falls outside the new time range,
the query will fail.

#### Examples

To see the query API in action, try the [command-line tool](https://github.com/scalyr/scalyr-tool). When invoked with
the --verbose and --output=json-pretty options, the tool will output the raw JSON request and response objects:

    scalyr query --count=5 --verbose --output=json-pretty

Here is an example GET query URL:

    [[[publicAppUrl(api/query?queryType=log&maxCount=5&token=XXX,nolinkify)]]]


numericQuery: <numericQuery>
## Numeric Query

This method is used to retrieve numeric data, e.g. for graphing. You can count the rate of events matching some criterion
(e.g. error rate), or retrieve a numeric field (e.g. response size).

If you will be be invoking the same query repeatedly, you should consider using the [timeseriesQuery](#timeseriesQuery)
API instead. This is especially useful if you are using the Scalyr API to feed a home-built dashboard, alerting system,
or other automated tool. A timeseries precomputes a numeric query, allowing you to execute queries almost
instantaneously, and without exhausting your query execution limit (see below).

#### URL

[[[publicAppUrl(api/numericQuery,nolinkify)]]]

#### Input

    {
      "token":             "xxx",
      "queryType":         "numeric",
      "filter":            "...",
      "function":          "...",
      "startTime":         "...",
      "endTime":           "...",
      "buckets":           nnn,
      "priority":          "..."
    }

**token** should be a "Read Logs" API token. Find API tokens at [[[publicAppUrl(keys)]]].

**queryType** should be ``numeric``.

**filter** specifies which events to match, using the same syntax as the Expression field in the query UI.
To match all events, omit this field or pass an empty string.

**function** specifies the value to compute from the matching events. You can use any function listed
in [Graph Functions](/help/query-language#graphFunctions), except for ``fraction(expr)``. 
For example: ``mean(x)`` or ``median(responseTime)``, if ``x`` and ``responseTime`` are fields of your log. You can 
also specify a simple field name, such as ``responseTime``, to return the mean value of that field. If you omit the
function argument, the rate of matching events per second will be returned. Specifying ``rate`` yields
the same result.

To count the number of events in each time period, set function to ``count``.

**startTime** and **endTime** specify the time range to query, using the same syntax as the Start and End
fields in the query UI. You can also supply a simple timestamp, measured in seconds, milliseconds, or
nanoseconds since 1/1/1970.

You must specify startTime. endTime defaults to the present time.

**buckets** specifies the number of numeric values to return. The time range is divided into this many equal
slices. For instance, suppose you query a four-hour period, with buckets = 4. The query will return four numbers,
each covering a one-hour period.

You may specify a value from 1 to 5000. The default is 1.

**priority** specifies the execution priority for this query; defaults to "low". Use "low" for background
operations where a delay of a second or so is acceptable. Low-priority queries have more generous rate limits.

The numericQuery API can also be invoked using GET, passing the parameters using URL encoding:

    curl '[[[publicAppUrl(api/numericQuery?queryType=numeric&startTime=1h&token=XXX,nolinkify)]]]'

When using GET, remember to encode spaces as %20.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See
the API Overview section for details. Otherwise, the response should have the following structure:

    {
      "status": "success",
      "values": [
        "nnn",
        "nnn",
        ...
      ],
      "executionTime": 12
    }

The number of values returned will always be equal to the ``buckets`` parameter. Each entry will give the value for
the corresponding time slice, as determined by the ``startTime`` and ``endTime`` parameters. If a value is undefined
(e.g. taking the mean or max of a time period which did not contain any values), null is used.

**executionTime** indicates how much time our server spent processing this query, in milliseconds. Your API queries
are limited to 30,000 milliseconds of processing time, replenished at 36,000 milliseconds per hour. If you exceed
this limit, your queries will be intermittently refused. (Your other uses of Scalyr, such as log uploading or
queries via the web site, will not be impacted.) If you need a higher limit, [let us know](mailto:support@scalyr.com).

#### Examples

To see the query API in action, try the [command-line tool](https://github.com/scalyr/scalyr-tool). When invoked with
the --verbose and --output=json-pretty options, the tool will output the raw JSON request and response objects:

    scalyr numeric-query --start 1h --buckets 10 --verbose --output=json-pretty

Here is an example GET query URL:

    [[[publicAppUrl(api/numericQuery?queryType=numeric&startTime=1h&buckets=60&token=XXX,nolinkify)]]]


facetQuery: <facetQuery>
## Facet Query

This method is used to retrieve the most common values for a field. For instance, you can find the most common URLs
accessed on your site, the most common user-agent strings, or the most common response codes returned.

#### URL

[[[publicAppUrl(api/facetQuery,nolinkify)]]]

#### Input

    {
      "token":             "xxx",
      "queryType":         "facet",
      "filter":            "...",
      "field":             "...",
      "maxCount":          nnn,
      "startTime":         "...",
      "endTime":           "...",
      "priority":          "..."
    }

**token** should be a "Read Logs" API token. Find API tokens at [[[publicAppUrl(keys)]]].

**queryType** should be ``facet``.

**filter** specifies which events to match, using the same syntax as the Expression field in the query UI.
To match all events, omit this field or pass an empty string.

**field** specifies the event field to retrieve.

**maxCount** specifies the maximum number of unique values to return.

You may specify a value from 1 to 1000. The default is 100.

**startTime** and **endTime** specify the time range to query, using the same syntax as the Start and End
fields in the query UI. You can also supply a simple timestamp, measured in seconds, milliseconds, or
nanoseconds since 1/1/1970.

You must specify startTime. endTime defaults to the present time.

**priority** specifies the execution priority for this query; defaults to "low". Use "low" for background
operations where a delay of a second or so is acceptable. Low-priority queries have more generous rate limits.

The query API can also be invoked using GET, passing the parameters using URL encoding:

    curl '[[[publicAppUrl(api/facetQuery?queryType=facet&field=uriPath&startTime=1h&token=XXX,nolinkify)]]]'

When using GET, remember to encode spaces as %20.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See
the API Overview section for details. Otherwise, the response should have the following structure:

    {
      "status": "success",
      "values": [
        {"value": "aaa", "count": 100},
        {"value": "bbb", "count": 50},
        ...
      ],
      "matchCount": 100,
      "executionTime": 12
    }

The number of values returned will be equal to the ``maxCount`` parameter, or the total number of unique values for
this field, whichever is smaller. Values will be sorted by decreasing count.

**matchCount** gives the total number of events which match the query.

**executionTime** indicates how much time our server spent processing this query, in milliseconds. Your API queries
are limited to 30,000 milliseconds of processing time, replenished at 36,000 milliseconds per hour. If you exceed
this limit, your queries will be intermittently refused. (Your other uses of Scalyr, such as log uploading or
queries via the web site, will not be impacted.) If you need a higher limit, [let us know](mailto:support@scalyr.com).

#### Examples

To see the query API in action, try the [command-line tool](https://github.com/scalyr/scalyr-tool). When invoked with
the --verbose and --output=json-pretty options, the tool will output the raw JSON request and response objects:

    scalyr facet-query '$dataset="accessLog"' uriPath --start 1h --verbose

Here is an example GET query URL:

    [[[publicAppUrl(api/facetQuery?queryType=facet&field=uriPath&startTime=1h&token=XXX,nolinkify)]]]

#### Notes

If a very large number of events match your filter, the results will be based on a random subsample of matching
events. The subsample will contain at least 500,000 events.


createTimeseries: <createTimeseries>
## Create Timeseries

This method is deprecated, and will eventually be removed from the Scalyr API.

``createTimeseries`` creates a timeseries, and returns a numeric ID which can be passed to the
[timeseriesQuery](#timeseriesQuery) API without specifying ``filter`` and ``function`` arguments. Instead of
using ``createTimeseries``, you should simply specify ``filter`` and ``function`` arguments when invoking
``timeseriesQuery``.

#### URL

[[[publicAppUrl(api/createTimeseries,nolinkify)]]]

#### Input

    {
      "token":             "xxx",
      "queryType":         "numeric",
      "filter":            "...",
      "function":          "..."
    }

**token** should be a "Write Configuration" API token. Find API tokens at [[[publicAppUrl(keys)]]].

**queryType** should be ``numeric``.

**filter** and **function** specify the query that can be performed with this timeseries. They have the same
meaning as for the [numericQuery](#numericQuery) method.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See
the API Overview section for details. Otherwise, the response should have the following structure:

    {
      "status": "success",
      "timeseriesId": "...",
      "foundExistingSeries": false | true
    }

You will use the timeseriesId in subsequent calls to the [timeseriesQuery](#timeseriesQuery) method.

If there was already a timeseries with this filter and function, the existing timeseries ID will be returned, and
foundExistingSeries will be true. Otherwise, foundExistingSeries will be false.

#### Examples

To see the query API in action, try the [command-line tool](https://github.com/scalyr/scalyr-tool). When invoked with
the --verbose and --output=json-pretty options, the tool will output the raw JSON request and response objects:

    scalyr create-timeseries "404" --verbose --output=json-pretty


timeseriesQuery: <timeseriesQuery>
## Timeseries Query

This method is similar to [numericQuery](#numericQuery), but is optimized for queries that will be executed
repeatedly. If you are using the Scalyr API to feed a home-built dashboard, alerting system, or other automated tool,
this method is for you. This method also allows you to execute multiple queries in a single request.

When you use ``timeseriesQuery``, Scalyr will precompute the results of the query, and update those results
continuously, allowing subsequent calls with the same ``filter`` and ``function`` to execute almost instantaneously.
This optimization applies even if you use a different ``startTime`` and ``endTime`` for each query. If you're interested
in knowing what goes on behind the scenes, the internal mechanism is discussed in
[this blog post](https://www.scalyr.com/blog/impossible-engineering-problems-often-arent/).

It may take up to half an hour for a new timeseries to be fully populated. During that time, queries will not be fully
optimized.

Because ``timeseriesQuery`` is intended for repetitive queries, a rate limit may be applied if you issue more than
100 novel queries (queries for which a timeseries has not already been created) per hour.

Because ``timeseriesQuery`` has side effects (it creates an internal timeseries, and counts against the rate limit
on new timeseries creation), calls to timeseriesQuery require a "Write Configuration", "Read Configuration", or a "Read Log Access" API token.


#### URL

[[[publicAppUrl(api/timeseriesQuery,nolinkify)]]]

#### Input

    {
      "token":             "xxx",
      "queries": [
        {
          "filter":            "...",
          "function":          "...",

          "timeseriesId":      "...", // deprecated
          
          "startTime":         "...",
          "endTime":           "...",
          "buckets":           nnn,
          "priority":          "..."
        },
        ...
      ]
    }

**token** should be a "Read Logs" API token. Find API tokens at [[[publicAppUrl(keys)]]]. Note that users with
"limited" permission can't issue timeseries queries.

**queries** should be an array of query specifications. For each query, the ``filter``, ``function``, ``startTime``,
``endTime``, ``buckets``, and ``priority`` arguments have the same meaning as for the [numericQuery](#numericQuery)
method; as with ``numericQuery``, ``endTime`` and ``buckets`` are optional, defaulting to the present time and one
bucket.

To issue a query using a timeseries ID obtained from the deprecated [createTimeseries](#createTimeseries) method,
supply a ``timeseriesId`` argument instead of ``filter`` and ``function``.

**priority** specifies the execution priority for this query; defaults to "low". Use "low" for background
operations where a delay of a second or so is acceptable. Low-priority queries have more generous rate limits.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See
the API Overview section for details. Otherwise, the response should have the following structure:

    {
      "status": "success",
      "results": [
        {
          "values": [ nnn, nnn, ... ],
          "executionTime": 5,
          "foundExistingSeries": true
        },
        {
          "values": [ nnn, nnn, ... ],
          "executionTime": 7,
          "foundExistingSeries": true
        }
      ],
      "executionTime": 12
    }

**results** will have one entry for each entry in the ``queries`` parameter. Each result entry contains
an array of numeric values, giving the value for each time slice of the corresponding query, as defined by the
``buckets`` parameter of that query. If a value is undefined in some time slice, the ``values`` array will contain
null at that index.

**executionTime** indicates how much time our server spent processing this query, in milliseconds. Your API queries
are limited to 30,000 milliseconds of processing time, replenished at 36,000 milliseconds per hour. If you exceed
this limit, your queries will be intermittently refused. (Your other uses of Scalyr, such as log uploading or
queries via the web site, will not be impacted.) If you need a higher limit, [let us know](mailto:support@scalyr.com).
``executionTime`` is specified for each result. The total execution time is reported in the outer response object.

**foundExistingSeries** indicates whether the query used an existing timeseries, or created a new timeseries. When
you specify a timeseriesId instead of a filter, foundExistingSeries will always be true.

#### Examples

To see the query API in action, try the [command-line tool](https://github.com/scalyr/scalyr-tool). When invoked with
the --verbose and --output=json-pretty options, the tool will output the raw JSON request and response objects:

    scalyr timeseries-query --timeseries XXX --start 1h --buckets 10 --verbose --output=json-pretty

When invoked for GET, only one query can be performed per request; here is an example:

    [[[publicAppUrl(api/timeseriesQuery?startTime=12h&endTime=11h&buckets=60&timeseriesId=XXX&token=YYY,nolinkify)]]]


powerQuery: <powerQuery>
## powerQuery

This method is used to perform a [PowerQuery](/help/powerQueries).

#### URL

[[[publicAppUrl(powerQuery,nolinkify)]]]

#### Input

    {
      "token":     "xxx",
      "query":     "...",
      "startTime": "...",
      "endTime":   "...",
      "priority":  "..."
    }

**token** should be a "Read Logs" API token. Find API tokens at [[[publicAppUrl(keys)]]].

**query** specifies the query to execute, in the PowerQuery language.

**startTime** and **endTime** specify the time range to query, using the same syntax as the Start and End fields in the
query UI. You can also supply a simple timestamp, measured in seconds, milliseconds, or nanoseconds since 1/1/1970.

The default is to query the last 24 hours. If you specify startTime but not endTime, the query covers 24 hours beginning
at the startTime. If you specify endTime but not startTime, the query covers 24 hours ending at the endTime.

**priority** specifies the execution priority for this query; defaults to "low". Use "low" for background operations
where a delay of a second or so is acceptable. Low-priority queries have more generous rate limits.

The PowerQuery API can also be invoked using GET, passing the parameters using URL encoding:

    curl 'https://www.scalyr.com/api/powerQuery?query=foo&token=XXX'

When using GET, remember to URL-encode spaces, line breaks, and other special characters.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See the API Overview
section for details. Otherwise, the response should have the following structure:

    {
      "status": "success",
      "matchingEvents": nnn,
      "omittedEvents": nnn,
      "columns": [
        {"name": "columnName1"},
        {"name": "columnName2"},
        ...more columns...
      ],
      "values": [
        [ valueForColumn1, valueForColumn2, ... ], // row 1
        [ valueForColumn1, valueForColumn2, ... ], // row 2
        ...more rows...
      ]
    }

**matchingEvents** is the total number of events which match the query's initial filter, and hence were processed as
part of query execution. **omittedEvents** is the number of those events which were omitted from the final result, due
to memory limitations. See [Memory Limits](/help/powerQueries#memoryLimit).

**columns** specifies the name of each column in the output table.

**values** specifies the value of each cell in the output table. The outer array has one entry per table row, and the
inner array has one entry per table column. Each cell may hold null, true, false, a number, a string, or one of the
following special values:

- ``{"special": "+infinity"}``
- ``{"special": "-infinity"}``
- ``{"special": "NaN"}``


getFile: <getFile>
## getFile

This method is used to retrieve a configuration file. You can also use this method to block until the file is changed.

#### URL

[[[publicAppUrl(getFile,nolinkify)]]]

#### Input

    {
      "token":           "xxx",
      "path":            "/foo",
      "expectedVersion": 3,        // optional
      "prettyprint":     false     // optional
    }

**token** should be a "Read Configuration" or "Write Configuration" API token. Find API tokens
at [[[publicAppUrl(keys)]]].

**path** is the file path, as listed at [[[publicAppUrl(files)]]]. See the [Configuration Files](/help/config)
page for more information about configuration files and file names/paths.

**expectedVersion** is optional. If expectedVersion is specified, and matches the file's current version, a
``status/unchanged`` response will be returned (see below).

**prettyprint** is optional (defaults to false). If true, then we return a prettyprinted representation of the file's
content. (Assumes the file is JSON.)

#### Responses

Normal response:

    {
      "status":        "success",
      "path":          "...",       // same as path parameter
      "version":       nnn,         // current version number
      "createDate":    nnn,         // time when file was created
      "modDate":       nnn,         // time when file was last modified
      "content":       "...",       // file content
      "stalenessSlop": nnn          // reserved for future use
    }

Response when an expectedVersion parameter was specified, and the file matches that version:

    {
      "status":        "success/unchanged",
      "path":          "...",       // same as path parameter
      "version":       nnn,         // the file's current version number
      "createDate":    nnn,         // time when file was created
      "modDate":       nnn,         // time when file was last modified
      "stalenessSlop": nnn,         // reserved for future use
    }

Response when no file exists at the specified path:

    {
      "status":        "success/noSuchFile",
      "stalenessSlop": nnn,         // reserved for future use
      "message":       "a human-readable message"
    }

createDate and modDate are represented as milliseconds since the Unix epoch of 1/1/1970.


putFile: <putFile>
## putFile

This method is used to create, update, or delete a configuration file.

#### URL

[[[publicAppUrl(putFile,nolinkify)]]]

#### Input

To create or update a file:

    {
      "token":           "xxx",
      "path":            "/foo",
      "content":         "...",
      "prettyprint":     false,   // optional
      "expectedVersion": 3        // optional
    }

To delete a file:

    {
      "token":           "xxx",
      "path":            "/foo",
      "deleteFile":      true,
      "expectedVersion": 3        // optional
    }

**token** should be a "Write Configuration" API token. Find API tokens at [[[publicAppUrl(keys)]]].

**path** is the file path, as listed at [[[publicAppUrl(files)]]]. See the [Configuration Files](/help/config)
page for more information about configuration files and file names/paths.

**content** is the content for the new/updated file.

**prettyprint** is optional (defaults to false). If true, then we prettyprint the content before storing it. (Assumes
the content is JSON.)

**deleteFile** indicates that this is a delete operation, rather than a create or update.

**expectedVersion** is optional. If specified, and the file's current version is a different value,
an ``error/client/versionMismatch`` response will be returned (see below).

#### Responses

Normal response:

    {
      "status":  "success",
    }

Response if expectedVersion was specified and did not match the file's current state:

    {
      "status": "error/client/versionMismatch"
    }


listFiles: <listFiles>
## listFiles

This method is used to list all configuration files.

#### URL

[[[publicAppUrl(listFiles,nolinkify)]]]

#### Input

    {
      "token": "xxx"
    }

**token** should be a "Read Configuration" or "Write Configuration" API token. Find API tokens
at [[[publicAppUrl(keys)]]].

#### Responses

Normal response:

    {
      "status":     "success",
      "paths": [
        "/bar",
        "/baz/file1",
        "/foo",
        etc.
      ]
    }

Paths are returned in lexicographic order.

apiKeys: <apiKeys>

## Scalyr API Keys

### Keys for Log Access
To generate new keys for accessing logs, click "add key" and select "read key" if you need read access, or select
"write key" if you need write access.

### Keys for Configuration Access
For configuration access, click "add key" and select "read key" if you need read access, or select
"write key" if you need write access.

### Copying Keys
To copy the key value to the clipboard, hover over the key, the copy icon will appear, click the copy icon. If your 
account is configured to hide API keys, you will only be able to copy a key when it is first created, so be sure to 
store it in a safe place.

### Naming Keys
The default name of the key is the current date in the format "DDD MM YYYY". To change the name of the key, hover over
they key name, an edit icon will appear. Click on the icon, you will be prompted to enter a new name which can be any
name of 20 or fewer characters.

### Removing Keys
Keys can be deleted by hovering over the key name, and clicking on the delete icon. Once the key is deleted, the action
cannot be undone. 


inviteUser: <inviteUser>
## inviteUser 

This method invites a user to a join team and grants them permission to access the team's data. If the user did not
have a Scalyr account, an account will be created for them.

#### URL

[[[publicAppUrl(api/inviteUser,nolinkify)]]]

#### Input 

    {
        "token":             "xxx",
        "emailAddress":      "xxx@xxx.xxx",
        "permission":        "full",
        "allowedSearch":     "",
        "allowedDashboards": [],
        "groups":            []
    }


**token** should be a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**emailAddress** is the address of the user to invite.

**permission** is the user's access level: ``full``, ``readLog``, or ``limited``. See
[Manage Users](https://www.scalyr.com/help/users) for a discussion of access levels.

**allowedSearch** is only needed for users with ``limited`` permission. It should be a filter expression specifying
which data the user is allowed to access.

**allowedDashboards** is only needed for users with ``limited`` permission. It should be a list of dashboard names,
indicating which dashboards this user can view.

**groups** optional, specifies which groups the user belongs to. See [groups](https://www.scalyr.com/help/users#groups) for more information.


editUserPermissions: <editUserPermissions>
## editUserPermissions

This method updates a user's access permissions within a team.

#### URL

[[[publicAppUrl(api/editUserPermissions,nolinkify)]]]

#### Input 

    {
        "token":             "xxx",
        "emailAddress":      "xxx@xxx.xxx",
        "permission":        "full",
        "allowedSearch":     "",
        "allowedDashboards": [],
        "groups":            []
    }
    
**token** should be a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**emailAddress** is the address of the user whose permissions will be updated.

**permission** is the user's new access level: ``full``, ``readLog``, or ``limited``. See
[Manage Users](https://www.scalyr.com/help/users) for a discussion of access levels.

**allowedSearch** is only needed for users with ``limited`` permission. It should be a filter expression specifying
which data the user is allowed to access.

**allowedDashboards** is only needed for users with ``limited`` permission. It should be a list of dashboard names,
indicating which dashboards this user can view.

**groups** Specifies which groups the user belongs to. This parameter is optional; if not specified,
then the user's group memberships are not changed. See [groups](https://www.scalyr.com/help/users#groups) for more information.


revokeAccess: <revokeAccess>
## revokeAccess

This method revokes a user's access.
 
#### URL

[[[publicAppUrl(api/revokeAccess,nolinkify)]]]

#### Input 
    {
        "token":             "xxx",
        "emailAddress":      "xxx@xxx.xxx"
    }
    
**token** should be a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**emailAddress** is the address of the user whose team access will be revoked.


listUsers: <listUsers>
## listUsers

This method lists all users with access to the team, with their associated permissions.

#### URL

[[[publicAppUrl(api/listUsers,nolinkify)]]]

#### Input

    {
        "token":              "xxx"
    }

**token** should be a "Read Configuration" or a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See the API
Overview section for details. Otherwise, the response should have the following structure:

    {
      "users": [
        {
          "email": "alice@example.com",
          "permissions": "limited",
          "allowedSearch": "$serverHost='server-1'", // only relevant for ``limited`` permission
          "allowedDashboards": [                     // only relevant for ``limited`` permission
            "Log Volume",
            "WebServer"
          ]
        },
        {
          "email": "bob@example.com",
          "permissions": "full"
        }
      ],
      "status": "success"
    }

This contains a list of all users with access to this team, with their associated permissions. The
schema is the same as in the [/scalyr/logs configuration file](https://www.scalyr.com/help/users#syntax), but the response will be pure JSON
with no comments or other nonstandard features.


addGroup: <addGroup>
## addGroup

This method creates a permission group. See [groups](https://www.scalyr.com/help/users#groups) for more information.

#### URL

[[[publicAppUrl(api/addGroup,nolinkify)]]]

#### Input

    {
        "token":             "xxx",
        "name":              "Group Name",
        "permission":        "limited",
        "allowedSearch":     "",
        "allowedDashboards": []
    }


**token** should be a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**name** is the name of the group. Group names are not case sensitive.

**permission** is the group's access level: ``full``, ``readLog``, or ``limited``. See [Manage Users](https://www.scalyr.com/help/users) for a discussion of access levels.

**allowedSearch** is only needed for groups with ``limited`` permission. It should be a filter expression specifying
which data the group is allowed to access.

**allowedDashboards** is only needed for groups with ``limited`` permission. It should be a list of dashboard names,
indicating which dashboards this group can view.


editGroupPermissions: <editGroupPermissions>
## editGroupPermissions

This method updates a group's access permissions within a team.

#### URL

[[[publicAppUrl(api/editGroupPermissions,nolinkify)]]]

#### Input

    {
        "token":             "xxx",
        "name":              "Group Name",
        "permission":        "limited",
        "allowedSearch":     "",
        "allowedDashboards": []
    }

**token** should be a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**name** is the name of the group whose permission will be updated.

**permission** is the group's new access level: ``full``, ``readLog``, or ``limited``. See [Manage Users](https://www.scalyr.com/help/users) for a discussion of access levels.

**allowedSearch** is only needed for groups with ``limited`` permission. It should be a filter expression specifying
which data the group is allowed to access.

**allowedDashboards** is only needed for groups with ``limited`` permission. It should be a list of dashboard names,
indicating which dashboards this group can view.


removeGroup: <removeGroup>
## removeGroup

This method removes a group from the team.

#### URL

[[[publicAppUrl(api/removeGroup,nolinkify)]]]

#### Input
    {
        "token":             "xxx",
        "name":              "Group Name"
    }

**token** should be a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**name** is the name of the group to be removed.


listGroups: <listGroups>
## listGroups

This method lists all groups with access to the team, with their associated permissions.

#### URL

[[[publicAppUrl(api/listGroups,nolinkify)]]]

#### Input

    {
        "token":              "xxx"
    }

**token** should be a "Read Configuration" or a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See the API
Overview section for details. Otherwise, the response should have the following structure:

    {
      "groups": [
        {
          "permissions": "limited",
          "name": "Group Name",
          "allowedDashboards": [        // only relevant for ``limited`` permission
            "Log Volume",
            "WebServer"
          ],
          "allowedSearch": "$serverHost='server-1'"        // only relevant for ``limited`` permission
        },
        ...
      ]
      "status": "success"
    }

This contains a list of all groups in this team, with their associated permissions. The
schema is the same as in the [/scalyr/logs configuration file](https://www.scalyr.com/help/users#groups), but the response will be pure JSON
with no comments or other nonstandard features.

addUsersToGroup: <addUsersToGroup>
## addUsersToGroup

This method adds one or more users to a group.

#### URL

[[[publicAppUrl(api/addUsersToGroup,nolinkify)]]]

#### Input
    {
        "token":             "xxx",
        "groupName":         "Group Name",
        "userEmails":        ["alice@example.com", "bob@example.com"]
    }

**token** should be a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**groupName** is the name of the group.

**userEmails** lists the users to be added to the group.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See the API
Overview section for details. Otherwise, the response should have the following structure:

    {
        "status":        "success",
        "updatedUsers":  ["xxx@xxx.xxx", "nnn@nnn.nnn"
    }

**updatedUsers** lists the users added to the group. This will not include users who do not exist or who already belonged to the group.


removeUsersFromGroup: <removeUsersFromGroup>
## removeUsersFromGroup

This method removes one or more users from a group.

#### URL

[[[publicAppUrl(api/removeUsersFromGroup,nolinkify)]]]

#### Input
    {
        "token":             "xxx",
        "groupName":         "Group Name",
        "userEmails":        ["alice@example.com", "bob@example.com"]
    }

**token** should be a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**groupName** is the name of the group.

**userEmails** lists the users to be removed from the group.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See the API
Overview section for details. Otherwise, the response should have the following structure:

    {
        "status":        "success",
        "updatedUsers":  ["xxx@xxx.xxx", "nnn@nnn.nnn"]
    }

**updatedUsers** lists the users removed from the given group. This will not include users who do not exist or did not belong to the group.


listUsersInGroup: <listUsersInGroup>
## listUsersInGroup

This method lists all users belonging to a group, with their associated permissions.

#### URL

[[[publicAppUrl(api/listUsersInGroup,nolinkify)]]]

#### Input

    {
        "token":              "xxx",
        "groupName" :         "nnn"
    }

**token** should be a "Read Configuration" or a "Write Configuration" API token for the team. Find API tokens at [[[publicAppUrl(keys)]]].

**groupName** is the name of the group.

#### Responses

An error is indicated by a response object whose ``status`` field does not begin with ``success``. See the API
Overview section for details. Otherwise, the response should have the following structure:

    {
      "users": [
        {
          "permissions": "xxx",
          "email": "xxx@xxx.xxx",
          "allowedDashboards": [        // only available when user has ``limited`` permission
            "nnn",
            "mmm"
          ],
          "allowedSearch": "nnn",       // only available when user has ``limited`` permission
          "groups": ["nnn"]
        }
        ...
      ]
      "status": "success"
    }

This contains a list of all users belonging to the group, with their associated permissions. The
schema is the same as in the [/scalyr/logs configuration file](https://www.scalyr.com/help/users#syntax), but the response will be pure JSON
with no comments or other nonstandard features.

