---
title: "Log Parsers"
---

# Log Parsers

Most logs have some sort of structure. For instance, a web access log specifies URI, user agent, referrer,
IP address, and other fields for each entry. Scalyr uses parsers to extract these fields.

When you configure the Scalyr Agent to upload a log file, you specify the name of a parser to use for
that file:

    attributes: {parser: "accessLog"}

Scalyr provides some [built-in parsers](/help/scalyr-agent#logUpload) for common log 
formats. If you specified one of these parser names, the log will be parsed automatically. Otherwise, you'll need to 
tell Scalyr what to do with this log.

To configure a parser, click the {{menuRef:Settings}} menu in the navigation bar, and select {{menuref:Parsers}}.
Find the parser you want to configure, and click one of the action buttons:

- Click {{menuRef:Ask us to create for you}} or {{menuRef:Ask us to edit for you}}. A sample of your log data will
  be sent to the Scalyr staff, and we'll get back to you shortly with a custom-built parser. We can usually put
  these together for you very quickly, and we enjoy a challenge, so don't hesitate to send us your home-grown
  application logs!
- If you're the do-it-yourself type, click {{menuRef:Create}} or {{menuRef:Edit}} and you'll be taken to
  the parser editor. The rest of this page tells you how to create and edit your own parsers.

Once you're done, your settings will apply to all log files using the same parser name. You don't need
to repeat the process when installing the agent on additional servers.

If you're just getting started with Scalyr, you're now ready to head on to the
[Getting Started guide](/help/getting-started).


editor: <Parser Editor>
## Parser Editor

Log parsing is defined by a *parser definition file*. A parser definition file is essentially
a collection of regular expressions, which identify particular types of log message or extract
fields. You should create a parser definition file for each unique log format you work with.
If you have several logs with the same format, they can all use a single parser -- just make
sure to specify the same "parser" field when configuring the Scalyr Agent to upload the
files.

A parser is specified by a configuration file in an augmented JSON format; see the
[Configuration Files](/help/config) reference for details. Each parser is stored in a 
configuration file named "/logParsers/PARSER_NAME". To create a parser, click the Settings
menu from the navigation bar, and choose Parsers. Then click the Create or Edit button for the
parser you want to manage. This will lead you to the parser.

The parser editor is divided into three panes. The top pane, Edit Parser, lets you edit the parser definition
file. The middle pane, Log Sample, shows recent log data. The bottom pane, Parser Output, shows the fields that your parser
generates when applied to that log. As you develop your parser, you can click the Update button
to re-parse the sample data and see how your parser behaves.

Once you click the Save Parser button, Scalyr begins applying your parser to new log messages
as they arrive. Older logs can not be (re-)parsed.

If you need to try a parser on data not currently present in your logs, go to
[[[publicAppUrl(logParseTester)]]]
On this page, you can paste arbitrary text for parsing.

formats: <Line Formats>
## Line Formats

To parse a log, you specify one or more "line formats". Each line format specifies the structure
of a particular type of log message. For example, consider a message from a basic web access
log:

    10.0.0.1 - - [21/Mar/2013:04:28:37 +0000] "GET /home HTTP/1.1" 200 9318

This message has nine fields: client IP, user, authenticated user, timestamp, HTTP method,
URI, protocol, response status, and response length. The fields are delimited by an assortment
of spaces, square brackets, and quotes. To parse it, we simply define the nine fields and indicate
the delimiters that appear between them:

    {
    formats: [
      "$ip$ $user$ $authUser$ \\[$timestamp$\\] \"$method$ $uri$ $protocol$\" $status$ $bytes$"
      ]
    }

This example specifies that all text up to the first run of whitespace is parsed as an "ip" field.
All text up to the next run of whitespace becomes the "user" field. After that, the parser
searches for whitespace followed by a ``[`` character, and places this in an "authUser" field.
Then it searches for a ``]`` character, whitespace, and ``"`` character to delineate the "timestamp"
field, and so forth.


You can specify any number of line formats in a single parser. Suppose you have an application
log that mixes two types of message:

    11:04:36 login: user aaaaaa from 10.0.0.1
    11:04:41 image xxx uploaded by user aaaaaa
    11:04:42 login: user bbbbbb from 10.0.0.2
    11:04:43 image yyy uploaded by user bbbbbb
    11:04:44 image zzz uploaded by user bbbbbb

You could parse this with a pair of formats:

    {
      formats: [
        "$timestamp$ login: user $userid$ from $ip$",
        "$timestamp$ image $imageid$ uploaded by user $userid$"
      ]
    }

A name surrounded by ``$`` characters is a parseable field. Any other text is a regular
expression which must match the log message. So, the first format will match messages that
contain the snippets "login: user" and "from". The second format matches messages containing
"image" and "uploaded by user". The intervening text is assigned to the appropriate fields.

Note that regular expression features cannot enclose a $...$ field. For example, suppose you
have a log like this:

    11:04:36 login user aaaa
    11:04:38 upload file 1111

The following format would *not* work, because it attempts to use the regex alternative operator
around $...$ fields:

    $timestamp$ (login user $userId$|upload file $fileId$)

For a log like this, you should instead use formats that match line fragments, as described
in the next section.

fragments: <Parsing Line Fragments>
## Parsing Line Fragments

The examples above are meant to match complete log messages. However, you can also write a
format that matches part of a line. This is useful when a log contains different types of message
that share some common components. For instance, consider the following fragment from a LevelDB
log file:

    2013/03/21-04:33:21 7fd77b7a3700 Generated table #3212838: 82924 keys, 1350832 bytes ##
    2013/03/21-04:33:21 7fd77b7a3700 Generated table #3212839: 66792 keys, 1096768 bytes ##
    2013/03/21-04:33:21 7fd77b7a3700 Generated table #3212840: 8577 keys, 144790 bytes ##
    2013/03/21-04:33:21 7fd77b7a3700 Compacted 1@2 + 10@3 files => 13349718 bytes ##

There are two different types of message, but they both begin with a timestamp and a session
identifier. We can parse this as follows:

    {
      formats: [
        // Parse the timestamp and session identifier. Extract the rest of the line
        // in a catch-all "details" field.
        "$timestamp$ $session$ $details$",
        
        // Extract additional fields from a "Generated table" message. This format
        // begins with .* to indicate that it can start in the middle of the message.
        ".*Generated table #$tableId$: $keys$ keys, $bytes$ bytes",
     
        // Extract additional fields from a "Compacted" message.
        ".*Compacted $files$@$level$ \\+ $files2$@$level2$ files => $bytes$ bytes"
      ]
    }

The first rule applies to all lines, and extracts the basic timestamp + session ID + details
structure. The other two rules extract additional fields from specific messages. If a message
matches several formats, they are all used.

Sometimes you don't want multiple formats to apply to the same message. Consider this hypothetical
log fragment:

    18:38:40 login by user aaaaaa
    18:38:40 logout by user bbbbbb
    20:21:48 initiating background scan
    21:03:00 logout by user aaaaaa

We have login messages, logout messages, and other miscellaneous messages. Let's say you want
to parse the login and logout messages specially, and then have a catch-all rule for the remaining
messages. You could do that as follows:

    {
      formats: [
        {
          format: "$timestamp$ login by user $userid$",
          halt: true
        },
        {
          format: "$timestamp$ logout by user $userid$",
          halt: true
        },
        {
          format: "$timestamp$ $miscellaneous$",
          halt: true
        }
      ]
    }

Here, we've replaced each format string by a JSON object with two fields, "format" and "halt".
The halt option indicates that when a log message matches this format, the parser should not
examine any additional formats. Formats are tried in the order they appear in the parser definition.

patterns: <Field Patterns>
## Field Patterns

In the examples so far, field boundaries have always been defined by the text between the
fields. Sometimes this isn't sufficient. For instance, consider this message from a system
log:

    Mar 20 18:38:40 host1 kernel: imklog 5.8.10
       
The delimiter between the timestamp and hostname is simply a space, but there are also spaces
inside the timestamp. Thus, this simple format specification would not work:

    $timestamp$ $host$ $process$: $text$

The timestamp field, delimited by a space, would match only the word "Mar". To address
this, we specify a pattern for the timestamp field:

    {
      patterns: {
        tsPattern: "\\w+\\s+\\d+\\s+[0-9:]+"
      },

      formats: [
        "$timestamp=tsPattern$ $host$ $process$: $text$"
      ]
    }

Now, the timestamp field matches the full timestamp, as specified by tsPattern.

The following patterns are predefined:

- **digits** -- one or more digits 
- **number** -- an integer or decimal number, optionally including an exponent suffix (e.g.
  "3.8E+6"). 
- **alphanumeric** -- any sequence of letters and/or digits. 
- **identifier** -- a sequence of letters, digits, hyphens, or underscores, beginning with a letter or underscore. 
- **quotable** -- a value that may optionally be enclosed in double-quotes. If the value begins
  with a ``"`` character, it will match until the next ``"``, with support for backslash escapes.
  If the value begins with any other character, it will match until the first instance of the
  format delimiter (the format text after this $...$ term). 
- **quoteOrSpace** -- a value that may optionally be enclosed in double-quotes. If the value
  begins with a ``"`` character, it will match until the next ``"``, with support for backslash
  escapes. If the value begins with any other character, it will match until the next whitespace
  character (or the end of the message). 
- **json** -- a value that is delimited by ``{`` and ``}`` characters. Supports nested braces,
  and embedded string literals. This may be used to match a JSON object or any similar brace-enclosed
  value. If the value does not begin with a ``{``, it will match until the first instance of
  the format delimiter. 

You can also specify a pattern directly in a parsing rule:

    {
      formats: [
        "$timestamp{regex=\\w+\\s+\\d+\\s+[0-9:]+}$ $host$ $process$: $text$"
      ]
    }

rewrites: <Rewriting Rules>
## Rewriting Rules

You can attach rewriting rules to any line format. A rewriting rule searches a field for a specified regular
expression, and replaces the first match with a different string. One application is to remove "noise" components
from a value for better clustering and analysis. For instance, suppose your application has URLs that look
like this:

    /account12345/foo

where "foo" is a page name, and 12345 is an identifier. If you want to see how frequently each page is accessed,
you might want to remove the identifiers, leaving a value like "/account/foo" that will cluster nicely. The
following rule will copy the "url" field into a second field "simplifiedUrl", with the account ID elided:

    {
      formats: [
        {
          format: "...",
          rewrites: [
            {
              input:   "url",
              output:  "simplifiedUrl",
              match:   "/account[0-9]+/",
              replace: "/account/"
            }
          ]
        }
      ]
    }

A line format can have any number of rewrite rules. Each rule is applied in order. The input and output field names
can be the same (in which case the raw value is overwritten with the result of the rewrite rule).

The "replace" string can contain substitution tokens of the form $1, $2, etc. These are replaced with the
correspondingly numbered capturing groups from the match expression. For instance, the following rule will
turn ``[abc,def]`` into ``abc-def``:


    {
      formats: [
        {
          format: "...",
          rewrites: [
            {
              input: "foo",
              output: "foo",
              match: "\\[([a-z]+),([a-z]+)\\]",
              replace: "$1-$2"
            }
          ]
        }
      ]
    }

A double-backslash character, ``\\``, can be used in both the match and replacement strings to escape special characters
such as ``[`` or ``$``.

To replace all instances of the match expression, add a ``replaceAll`` argument:

    {
      formats: [
        {
          format: "...",
          rewrites: [
            {
              input:   "someField",
              output:  "fieldWithoutSpaces",
              match:   "[ ]+",
              replace: "",
              ***replaceAll: true***
            }
          ]
        }
      ]
    }

**Tip** Rewrite rules only apply to the parsed field defined in the ``input:`` object. If you want to change the log message itself, you need an additional rewrite rule for the ``message`` field.


timeDifference:
### Computing Time Differences

A special form of rewrite rule can be used to compute the time difference between two events. It looks like this:

    {
      formats: [
        {
          format: "...",
          rewrites: [
            {
              ***action: "timeDelta",***
              ***startTime: "field1",***
              ***endTime: "field2",***
              ***output: "field3"***
            }
          ]
        }
      ]
    }

This rule looks for fields named ``field1`` and ``field2``, each containing a textual date + time. (A wide variety
of formats are supported.) It computes the difference (in seconds) between these times, and records it in ``field3``.

The startTime and endTime fields can reference values which were generated by an [association rule](#association).
Thus, you can compute the time difference between two different log messages (connected by a transaction ID or other
unique identifier). This requires a complex alignment of several parser features; feel free to drop us a line at
[support@scalyr.com](mailto:support@scalyr.com) for help.

timeDelta rules do not currently support capturing of the time zone name using a ``timezone`` field in the format
string. The time zone must be specified in the timestamp itself, or in ``timezone`` attribute of the rewrite rule; 
otherwise, GMT is used.


specialAttrs: <Timestamp, Severity, and Message>
## Special Fields: Timestamp, Severity, and Message

A field named "timestamp" is parsed as a date/time, and used as the event timestamp. Most
standard time formats are supported. (If you encounter a time format that is not parsed properly,
[let us know](mailto:support@scalyr.com).)

Some messages contain an explicit time zone, such as the ``-0300`` in ``28/Jul/2006:10:27:32
-0300``. If the message does not explicitly specify a time zone, GMT is assumed. You can override
this for a parser or an individual field matcher:

    {
      ***timezone: "PST"***,
      formats: [
        "foo $timestamp$ $details$",
        "bar $timestamp***{timezone=EST}***$ $details$"
      ]
    }

Here, EST is used for timestamps in "bar" records, while the parser's default of PST is used
for "foo" records. You can specify time zones by name, abbreviation, or as "GMT+n:nnn" or "GMT-n:nnn".

You can also define a separate "timezone" field to capture the time zone. For instance, if your messages begin
like this:

    <Apr 1, 2010 3:15 PM> <EST>

Your format rule could begin with ``<$timestamp$> <$timezone$>`` to parse the timestamp and time zone. The time zone
specified in the log message will then be used to parse the timestamp. For this to work, the time zone must be
captured in a field with the exact name of ``timezone``. 

Most log formats that use timestamps include them on every line, but there are exceptions.
For instance, MySQL query logs emit a new timestamp at most once per second; if multiple queries
occur in the same second, only the first gets a timestamp. For this case, add:

      intermittentTimestamps: true

to the parser definition. Otherwise, lines that do not contain a timestamp will be assigned
to the time at which the Scalyr Agent first scans the message. For an example, see the [MySQL
query log parser](/parser?parser=mysqlGeneralQueryLog[[[emitAddlParamTeamTokenIfPhoenix]]]).

A field named "severity" is interpreted as a log severity level, and converted to an integer
from 0 to 6. The following values are supported:

0: "finest" ##
1: "finer", "trace" ##
2: "fine", "debug" ##
3: "info", "notice", "i" ##
4: "warn", "warning", "w" ##
5: "error", "err", "e" ##
6: "fatal", "emerg", "emergency", "crit", "critical", "panic", ""alert", "f"

If you are parsing log records that use a different set of log level identifiers, [let us know](mailto:support@scalyr.com).
If no extractor yields a severity field, info (3) is used as a default.

The text of a log message is stored in a field named "message". If a parsing rule also specifies a "message" field, it
will be ignored.


formatDetails: <Format Details>
## Format Details

A few other rules round out the processing of format strings:

If two fields are not separated by any delimiter text, the first field must specify a pattern.
For instance, suppose your log messages contain a numeric user ID followed immediately by an
action name:

    03298login
    03298upload
    49107login

You could parse this with the following format string:

    $userid=digits$$action=identifier$

It is not strictly necessary to specify a pattern for the action field, but it is essential
to specify the digits pattern for the userid field, because there is no space character or
other delimiter to indicate the end of that field.

If a field is immediately followed by a double-quote character in the format string, then backslashes
in the field will be treated as escape characters. For instance, consider this log message
and format string:

    11:02:15 message "Project \"fuzzy bunny\" cancellation", 3029 bytes
    $timestamp$ message "$subject$", $length$ bytes

Because the $subject$ field is enclosed in double-quotes in the format string, it will not
end at the escaped double-quote before "fuzzy".

If a field is immediately followed by a space character in the format string, and no pattern
is specified for that field, the "quotable" pattern will be used. This matters only if the
field value begins with a double-quote: it will automatically match through the matching double-quote,
with support for backslash escapes.

A space character in a format string matches any run of whitespace (``\s+``) in the log message.
Additional spaces in the format string are ignored. To match whitespace precisely, put a backslash
before the space character.

To use a $ character inside a format string, escape it with another dollar sign. For example:

    9:55:11 payment authorized for $1162.15
    $timestamp$ payment authorized for \$$$amount$

This format string has three dollar signs before "amount". The first two dollar signs are an
escape sequence matching a single dollar sign in the input string. The final dollar sign begins
the ``$amount$`` field. The backslash is needed to treat the dollar sign as a literal character
and not the regular-expression symbol for "end of line".

taggingLineFormats: <Tagging Line Formats>
## Tagging Line Formats

You can attach additional fields to a line format. These fields are added to each log
message matching that format. For example, here is our earlier LevelDB example, extended with
fields:

    {
      formats: [
        "$timestamp$ $session$ $details$",

        {
          id: "generateTable"
          format: ".*Generated table #$tableId$: $keys$ keys, $bytes$ bytes"
        },

        {
          attributes: { action: "compaction", phase: "finished" }
          format: ".*Compacted $files$@$level$ + $files2$@$level2$ files => $bytes$ bytes"
        }
      ]
    }

With this parser, "Generated table" messages will be annotated with generateTable=true. "Compacted"
messages will be annotated with action="compaction" and phase="finished". "id" and "attributes"
can be used separately or together.

You can also define fields at the top level of a parser specification:

    {
      attributes: { ... },
      formats: [
        ...
      ]
    }

These fields will be applied to all log messages processed by the parser.

valueLists: <URLs and JSON>
## Parsing URLs, JSON, or Key/Value Lists

If a field contains a URL, you can tell the parser to break it apart into path and query components
using a "parse" directive. Here is our access log example, updated with a parse directive:

    {
      formats: [
        "$ip$ $user$ $authUser$ \\[$timestamp$\\] \"$method$ $uri{***parse=uri***}$ $protocol$\" $status$ $bytes$"
      ]
    }

If the log contains the URI /dir/file?foo=hello&bar=123, the following fields will be created:

      uriPath: "/dir/file"
      uriFoo: "hello"
      uriBar: 123

The path portion of the URI goes in the "path" field, and each query parameter gets its
own field. All of the field names are prefixed with the field name in the format string,
"uri" in this example.

Sometimes this can cause the database to become cluttered with extraneous fields. This
is especially possible when working with data that originates outside your own systems, e.g.
a web access log for an Internet-facing service. The attrWhitelist and attrBlacklist options
can be used to manage this. These options, if specified, are treated as regular expressions
to be applied to field names. If attrBlacklist is defined, fields matching that expression
are discarded. If attrWhitelist is defined, fields not matching that expression are discarded.
For example:

Message: ``15:06:11 /home?apple=w&banana=x&banana2=y&cherry=z`` ##
Format: ``$timestamp$ $details{parse=uri}{attrWhitelist=[a-b].*}{attrBlacklist=.*[0-9]}$`` ##
Result: ##
``  timestamp = 15:06:11`` ##
``  detailsPath   = /home`` ##
``  detailsApple  = w`` ##
``  detailsBanana = x``

The banana2 field is discarded because it matches the blacklist, and the cherry field
is discarded because it doesn't match the whitelist.

You can define a whitelist, a blacklist, both, or neither. Whitelist and blacklist expressions
must match the entire field name, hence the frequent need for .* at the beginning or end.
They can be used with any parse option, not just "uri".

Other supported parsing types:

**uriAttributes or urlAttributes** -- a series of URL-encoded parameters, separated by ampersands.
This is similar to the "uri" type, but does not expect a path or ? delimiter. For example:

Message: ``15:06:11 foo=hello&bar=good+morning`` ##
Format: ``$timestamp$ $details{parse=uriAttributes}$`` ##
Result: ##
``  timestamp = 15:06:11`` ##
``  detailsFoo = hello`` ##
``  detailsBar = good morning``

**json **-- a JSON object, enclosed in {...}. For example:

Message: ``15:06:11 {"foo": "hello", "bar": 123}`` ##
Format: ``$timestamp$ $details{parse=json}$`` ##
Result: ##
``  timestamp = 15:06:11`` ##
``  detailsFoo = hello`` ##
``  detailsBar = 123``

Nested dictionaries are flattened. For instance, if the input contains ``{"foo": {"bar": 123}}``, the parser will create
a field named ``fooBar`` with value 123.

**escapedJson** -- like JSON, but the parser removes a layer of backslash escapes before parsing.
For example:

Message: ``15:06:11 {\"foo\": \"hello\", \"bar\": 123}`` ##
Format: ``$timestamp$ $details{parse=escapedJson}$`` ##
Result: same as above

**urlEncodedJson** -- like JSON, but the parser performs URL decoding before parsing.
For example:

Message: ``15:06:11 %7B%22foo%22%3A%20%22hello%22%2C%20%22bar%22%3A%20123%7D`` ##
Format: ``$timestamp$ $details{parse=urlEncodedJson}$`` ##
Result: same as above

**base64EncodedJson** -- like JSON, but the parser performs URL decoding before parsing.
For example:

Message: ``15:06:11 eyJmb28iOiAiaGVsbG8iLCAiYmFyIjogMTIzfQ==`` ##
Format: ``$timestamp$ $details{parse=base64EncodedJson}$`` ##
Result: same as above

**pythonDict **-- a Python dictionary literal. For example:

Message: ``15:06:11 {'foo': 'hello', 'bar': 123}`` ##
Format: ``$timestamp$ $details{parse=pythonDict}$`` ##
Result: ##
``  timestamp = 15:06:11`` ##
``  detailsFoo = hello`` ##
``  detailsBar = 123``

**rubyHash **-- a Ruby hash literal. For example:

Message: ``15:06:11 {"foo" => "hello", :bar => 123}`` ##
Format: ``$timestamp$ $details{parse=rubyHash}$`` ##
Result: ##
``  timestamp = 15:06:11`` ##
``  detailsFoo = hello`` ##
``  detailsBar = 123``

**dict **-- a general dictionary parser, accepting JSON or Python dictionary syntax, and forgiving of some syntactic
details. The dictionary should be enclosed in {...}, with entries separated by commas, and a colon separating each
field name from its value.

**commaKeyValues** -- a comma-delimited list of key=value pairs. Each value can be surrounded
by single quotes, double quotes, or no quotes. For example:

Message: ``15:06:11 foo="hello",bar=123`` ##
Format: ``$timestamp$ $details{parse=commaKeyValues}$`` ##
Result: same as above

**sqlToSignature**. Use this when the input is an SQL query string and you wish to compute
a "signature". The signature replaces constant values with a question mark, and eliminates
excess whitespace. This allows you to group similar queries, such as "...where id=9234" and
"...where id=2758", for analysis. For example:

Message: ``SELECT * FROM accounts WHERE org = 'aaaaaa' AND status = 2`` ##
Format: ``$signature{parse=sqlToSignature}$`` ##
Result:  ##
``  signature = SELECT * FROM accounts WHERE org = ? AND status = ?``

Numbers, single-quoted strings, and IN and VALUE/VALUES clauses are replaced. In some variants
of SQL, it's also useful to replace double-quoted strings. For that, use sqlWithDoubleQuotesToSignature.

**syslogPriority**. Use this for parsing a numeric syslog "PRI" code. It generates three fields, with the following
names: ``facility`` (the syslog facility code), ``rawSeverity`` (the syslog severity code, from 0-7), and ``severity``
(the severity code mapped on to Scalyr's 0-6 scale, which runs in the opposite direction from the syslog scale).

**dateTimeSeconds** ##
**dateTimeMs** ##
**dateTimeNs** -- a time or date/time value. A wide variety of formats are supported. The value is converted to
numeric form, giving the number of seconds, milliseconds, or nanoseconds since 1/1/1970. For example:

Message: ``finished transaction that had started at 2013-01-15 09:57:30`` ##
Format: ``finished transaction that had started at $start{parse=dateTimeSeconds}$`` ##
Result: ##
``  start = 1358243850``

You can add a timezone specifier, e.g. ``$start{parse=dateTimeSeconds}{timezone=EST}$``. Otherwise, the time zone
specified for the overall parser will be used, or GMT if the parser does not specify a time zone.

**hoursMinutesSeconds** -- a time value in ``hh:mm:ss`` or ``hh:mm:ss.sss`` format. The value is
converted into a numerical number of seconds. For example:

Message: ``report generated in 00:20:43.609`` ##
Format: ``report generated in $duration{parse=hoursMinutesSeconds}$`` ##
Result: ##
``  duration = 1243.609``

**seconds** -- a numeric time value with optional units. Can either be a simple number, or a number followed
by one of the following units:

    s, sec, secs, second, or seconds
    ms, millis, or milliseconds
    micros or microseconds
    ns, nanos, or nanoseconds
    m, min, mins, minute, or minutes
    h, hour, or hours
    d, day, or days

If a unit is supplied, the value will be scaled appropriately. For instance, "5 minutes" will be parsed as 300.
If no unit is supplied, the value is not scaled.

**milliseconds** -- a numeric time value with optional units. Can either be a simple number, or a number followed
by any of the same units as for the ``seconds`` parsing type.

If a unit is supplied, the value will be scaled appropriately. For instance, "6 seconds" will be parsed as 6000.
If no unit is supplied, the value is not scaled.

**bytes** -- a numeric byte count with optional units. Can either be a simple number, or a number followed
by one of the following units:

    b, byte, or bytes
    k, kb, kbyte, or kbytes
    m, mb, mbyte, or mbytes
    g, gb, gbyte, or gbytes

If a unit is supplied, the value will be scaled appropriately. For instance, "5kb" will be parsed as 5120.
If no unit is supplied, the value is not scaled.

**kb** -- a numeric kilobyte count with optional units. Can either be a simple number, or a number followed
by any of the same units as for the ``bytes`` parsing type.

If a unit is supplied, the value will be scaled appropriately. For instance, "4096 bytes" will be parsed as 4.
If no unit is supplied, the value is not scaled.

**mb** -- a numeric megabyte count with optional units. Can either be a simple number, or a number followed
by any of the same units as for the ``bytes`` parsing type.

If a unit is supplied, the value will be scaled appropriately. For instance, "4096KB" will be parsed as 4.
If no unit is supplied, the value is not scaled.

**gb** -- a numeric gigabyte count with optional units. Can either be a simple number, or a number followed
by any of the same units as for the ``bytes`` parsing type.

If a unit is supplied, the value will be scaled appropriately. For instance, "1073741824 bytes" will be parsed as 1.
If no unit is supplied, the value is not scaled.



keyValue: <Key/Value Logs>
## Parsing Key/Value Logs

Some logs contain ad-hoc key/value formats that don't fit any of the parsing options above.
A special technique can be used to parse these logs. Consider the following log fragment:

    8:03:00 /home cacheHits: 169 cacheMisses: 11 dbScans: 12 bytesFetched: 9317
    8:03:07 /tools/upload cacheHits: 3 bytesFetched: 0 bytesStored: 31508

Each message consists of a timestamp, a path, and some number of labeled values. We can parse
this log as follows:

    {
      formats: [
        "$timestamp$ $path$ ",
        {format: ".*$_=identifier$: $_=number$", repeat: true}
      ]
    }

Two formats are defined. The first matches the timestamp and path. The second matches the labeled
values. The second format appears complicated, but we can break it down:

- ``.*`` can match anything. By placing this at the beginning of the format, we allow it to
  match a labeled value anywhere on the line. 
- ``$_=identifier$`` matches a label. We place the label in a special field named "``_``".
  This field name is magic: it won't appear in the parsed message, but it will be used
  in a later step. 
- "``: ``" matches the colon and whitespace separating the label from the value. 
- ``$_=number$`` matches the value. The field name "``_``" is replaced by the label matched
  earlier. 
- The repeat option indicates that this format can be applied repeatedly to a single log message.
  This allows it to match each labeled value on the line. 

If you like, you can include a prefix before the _ in the second field name. For example, with
this format:

    format: ".*$_=identifier$: $stat_=number$", repeat: true

The values would be recorded as statcacheHits, statcacheMisses, etc.

multiline: <Multi-Line Messages>
## Multi-Line Messages

In some logs, there will be messages that span multiple lines of text. The lines might be adjacent, or
might be interleaved with other messages.

A "lineGroupers" clause allows you to combine adjacent lines into a single log message. For instance,
Java applications often emit multi-line stack traces:

    java.lang.Exception
        at com.foo.bar(bar.java:123)
        at com.foo.baz(baz.java:456)

The following rule will combine this into a single log message, allowing you to work with the stack trace
as a whole:

      lineGroupers: [
        {
          start: "^[^\\s]",
          continueThrough: "^[\\s]+at"
        }
      ]

This declaration says that line grouping should begin on any line which does not begin with
whitespace, and continue through any subsequent lines that begin with whitespace followed by
the word "at". In general, each lineGrouper has a *_start_* pattern and a *_continuation_*
pattern. Whenever a log message containing the start pattern is observed, subsequent lines
are then grouped together with that line according to the continuation rule.

If you have multiple grouping rules, they are evaluated in order. The first rule whose start
pattern matches a message, is applied to that message. The continuation pattern is then applied
to subsequent messages from the same session and thread.

Start and continuation patterns are applied to each event's "message" field. The message
fields of the matching events are concatenated together. All other fields of the initial
event are retained, and other fields of the other events are discarded.

Four different types of continuation pattern are supported. Each grouping rule should specify
a start pattern, plus exactly one of the four continuation patterns:

**continueThrough**: all consecutive lines matching this pattern are included in the group.
The first line (the line that matched the start pattern) does not need to match the continueThrough
pattern. This is useful in cases such as a Java stack trace, where some indicator in the line
(such as leading whitespace) indicates that it is an extension of the preceeding line.

**continuePast**: all consecutive lines matching this pattern, plus one additional line, are
included in the group. This is useful in cases where a log message ends with a continuation
marker, such as a backslash, indicating that the following line is part of the same message.

**haltBefore**: all consecutive lines *_not_* matching this pattern are included in the group.
This is useful where a log line contains a marker indicating that it begins a new message.

**haltWith**: all consecutive lines, up to and including the first line matching this pattern,
are included in the group. This is useful where a log line ends with a termination marker,
such as a semicolon.

Each grouping rule can also contain a **maxChars** and/or **maxLines** field. This limits the amount
of text which will be combined into a single event. If either limit is exceeded, the message will be
broken up into two or more events. There is a maximum of 3500 message bytes per event, so you may want
to set maxChars to a value slightly lower than this.


association:
#### Interleaved Messages

Some logs scatter related information across non-adjacent lines. For instance, consider this snippet
from an Adobe CQ5 log:

    31/Mar/2009:11:32:57 +0200 [379] -> GET /path/x HTTP/1.1 
    31/Mar/2009:11:32:57 +0200 [380] -> GET /path/y HTTP/1.1 
    31/Mar/2009:11:32:57 +0200 [379] <- 200 text/html 33ms 
    31/Mar/2009:11:32:59 +0200 [380] <- 200 application/json 1539ms

The snippet shows two requests, one for /path/x which took 33ms, and one for /path/y which took 1539ms.
If you want to analyze request time by path, you need to associate the path and time for each request.
The path and time do not appear in the same log line, but you can associate them by their request IDs (379
and 380 in this example). The following parser will accomplish this:

    {
      formats: [
        {
          id: "requestStart",
          format: "$timestamp$ \\[$requestId$\\] -> $method$ $path$ $protocol$",
          association: {tag: "request", keys: ["requestId"], store: ["path"]}
        },
        
        {
          id: "requestEnd",
          format: "$timestamp$ \\[$requestId$\\] <- $status$ $contentType$ $time$ms",
          association: {tag: "request", keys: ["requestId"], fetch: ["path"]}
        }
      ]
    }

The "association" rules cause the path field to be copied from the first event to the second event in
each pair. Thus, the second event will have both "path" and "time" fields, allowing you to analyze
request time by path.

An association rule has the following fields:

- **tag** -- used to connect association rules with one another. Use the same tag in all rules that are
  meant to share information together. Use different tags if you have several independent sets of rules.
- **keys** -- lists one or more fields that indicate how log lines should be associated. In the Adobe CQ5
  example, the requestId field is used to connect each request-start message with the corresponding
  request-end message.
- **store** -- lists fields which should be stored, for inclusion in a later, related log message.
- **fetch** -- lists fields which should be retrieved from an earlier log message. Each field will be taken
  from the most recent store clause with the same tag and the same values in the "keys" fields.

Association rules are meant to be used for messages that appear nearby in the log. If two log messages are
received more than 60 seconds apart, values stored by the first message may not be available for fetching
in the second message.

Association rules don't have to be grouped into simple store / fetch pairs. For more complex logs, you can
attach an association rule to any number of format records, and each rule can have both "store" and "fetch"
fields. "Fetch" is non-destructive, so you can retrieve the same value multiple times. Unpaired log messages
will not cause any problems; association data is quietly discarded after 60 seconds.

discard: <Discard Rules>
## Discard Rules

If you specify discard: true on a format string, log messages matching that format will be
discarded. This can be used to filter out noisy messages that you don't want cluttering up
your log. Loglines that are discarded will not count towards your daily log volume. 

For example, the following parser will discard all messages containing the substring
FINEST:

    {
      formats: [
        { format: ".*FINEST", discard: true },
        { format: "$timestamp$ $details$" }
      ]
    }

## Parser Aliases

If you want to use the same parser for two different log types, you can define one parser as
an alias to the other. The definition file for an alias parser looks like this:

    { aliasTo: "xxx" }

where "xxx" is the name of the target parser (i.e. the target parser is in /logParsers/xxx).
An alias cannot refer to another alias.


notes: <Notes>
## Notes

There is a limit on the maximum amount of text per event which can be parsed. Currently, that limit is 10,000
characters. If an event exceeds this length, only the first 10,000 characters will be used in parsing.


summary: <Summary>
## Summary

Here is the complete format of a log parser, including all optional features:

    {
      timezone: "...default time zone for interpreting timestamps..."
      attributes: {
        ...fields added to every event processed by this parser...
      },
      lineGroupers: [
        ...line grouping rules...
      ],
      patterns: {
        ...named regular expressions for use in field matchers...
      },
      formats: [
        {
          id: "...name for a field to add to messages matched by this format...",
          attributes: { ...additional fields for messages matched by this format... },
          format: "...",
          association: { ...an association rule; see Interleaved Messages... }
          discard: false | true,
          halt:    false | true,
          repeat:  false | true
        },
        ...additional formats...
      ]
    }

Within a format string, each field matcher has the following structure:

    $fieldName=patternName{parse=...}{attrWhitelist=...}{attrBlacklist=...}{timezone=...}$

examples: <Examples>
## Examples

Here is a complete parser for standard Apache web access logs:

    {
      attributes: {
        // Tag all events parsed with this parser so we can easily select them in queries.
        dataset: "accesslog"
      },
        
      formats: [
        // Extended format including referrer, user-agent, and response time.
        {
          format: "$ip$ $user$ $authUser$ \\[$timestamp$\\] \"$method$ $uri{parse=uri}$ $protocol$\" $status$ $bytes$ $referrer=quotable$ $agent=quotable$ $time=digits$",
          halt: true
        },
        
        // Format including referrer and user-agent (but no response time)
        {
          format: "$ip$ $user$ $authUser$ \\[$timestamp$\\] \"$method$ $uri{parse=uri}$ $protocol$\" $status$ $bytes$ $referrer=quotable$ $agent=quotable$",
          halt: true
        },
          
        // Including referrer and user-agent, but with no separate method, uri, and protocol. Sometimes
        // observed for invalid or incomplete requests.
        {
          format: "$ip$ $user$ $authUser$ \\[$timestamp$\\] \"$header$\" $status$ $bytes$ $referrer=quotable$ $agent=quotable$",
          halt: true
        },
          
        // Basic format with no referrer or user-agent
        {
          format: "$ip$ $user$ $authUser$ \\[$timestamp$\\] \"$method$ $uri{parse=uri}$ $protocol$\" $status$ $bytes$",
          halt: true
        },
          
        // Basic format, with no separate method, uri, and protocol.
        {
          format: "$ip$ $user$ $authUser$ \\[$timestamp$\\] \"$header$\" $status$ $bytes$",
          halt: true
        }
      ]
    }

And a parser that handles many system log messages:

    {
      attributes: {
        // Tag all events parsed with this parser so we can easily select them in queries.
        dataset: "systemlog"
      },
        
      patterns: {
        timestamp: "([a-z]+\\s+[0-9]+\\s+[0-9:]+)|"    // e.g. Feb  3 03:47:01
                 + "(\\d{4}-\\d{2}-\\d+T\\d{2}:\\d{2}:\\d{2}.\\d+\\+\\d+:\\d{2})"  // e.g. 2013-03-20T00:53:26.942569+00:00
      },
        
      formats: [
        // Process name plus ID. Examples:
        // 2013-03-19T12:25:16.267245+00:00 ip-10-11-222-111 auditd[14957]: Audit daemon rotating log files
        // Feb  3 13:17:00 host-1 dhclient[1576]: DHCPREQUEST on eth0 to 169.108.1.0 port 67 (xid=0x323f0123)
        {
          format: "$timestamp=timestamp$ $host$ $process$\\[$procid$\\]: $text$",
          halt: true
        },
          
        // Process name with no ID. Examples:
        // Feb  3 03:47:01 host-1 rsyslogd: [origin software="rsyslogd" swVersion="5.8.03" x-pid="1631" x-info="http://www.rsyslog.com"] rsyslogd was HUPed
        // Mar 17 04:34:12 li58-102 dhclient: DHCPREQUEST on eth0 to 206.192.11.29 port 67
        {
          format: "$timestamp=timestamp$ $host$ $process$: $text$",
          halt: true
        }
      ]
    }

