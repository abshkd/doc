---
title: "Custom Metrics"
---

# Custom Metrics

This Solution describes how to log custom metrics from your application code. You can log simple metrics, or complex multi-field
events, with equal ease. Then use your metrics for searching, graphing, alerting, and more.


## Steps

1. Choose a log format for your custom metrics. Scalyr can work with any format (see Further Reading), but two easy
choices are key=value pairs or JSON. key=value logging should look like this:

      [2011-02-07 23:31:41 UTC] event=user-login id=123 email="foo@example.com" notes="referred from http://example.com/hello"

Each line should begin with a timestamp, enclosed in square brackets. After this, place any number of fields, each in the
form ``NAME=VALUE``. The value can optionally be enclosed in double quotes; if it is not in double quotes, then it is
assumed to end at the next whitespace character. Within double quotes, backslash and double-quote characters should be
escaped with a backslash.

The timestamp can be in any common format. (If you encounter a time format that is not parsed properly, let us know and
we'll add it to our extensive list of supported formats.) You can omit the timestamp, in which case the event will be
assigned a timestamp when it reaches the Scalyr server.

JSON logging should look like this:

      {"timestamp": "2011-02-07 23:31:41 UTC", "event": "user-login", "id": 123, "email": "foo@example.com", "notes": "referred from http://example.com/hello"}

Each line should be a single object in standard JSON format. Field values can be strings, numbers, or booleans. Nested objects,
arrays, and nulls are not supported. The "timestamp" field, if supplied, is interpreted as for key=value logging.

2. Configure the Scalyr Agent to upload this log file, on each server where your application runs. See the
[Upload Multiple Log Files](/solutions/upload-multiple-logs) solution for instructions.

When adding the log file to the agent configuration file, specify ``parser: "keyValue"`` or ``parser: "json"``, according
to the format you chose. For instance:

    logs: [
       ...
       {
         path: "/var/log/my-application/metrics.log",
         attributes: {parser: "keyValue"}
       }
     ]

3. Deploy your application code that writes metrics to the new log file.

4. Click the {{menuRef:Overview}} link in the navigation bar. You should see the new log file listed; click on it. You can now use
all of the Scalyr tools to work with your custom metrics. For some basic tips, see [Working With Data](/help/getting-started#viewing).

5. You can add additional metrics to your application code at any time. There's no need to update the agent when you add new
metrics to an existing log file.


## Further Reading

The [View Logs](/help/view) page describes the tools you can use to view and analyze 
log data, including your custom metrics.  [Query Language](/help/query-language) 
lists the operators you can use to select specific metrics and values.  You can also use metrics in 
[Dashboards](/help/dashboards) and [Alerts](/help/alerts).

If you have existing code that generates metrics in a custom format, you can create a custom parser for that format -- or
we can take care of it for you. See the instructions at the top of the [Log Parsing](/help/parsing-logs) 
reference.

To aggregate metrics across servers, see the [Manage Groups of Servers](/solutions/manage-server-groups) 
solution.