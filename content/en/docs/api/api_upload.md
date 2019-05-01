---
title: "Upload Logs API"
---

# Upload Logs

[[[publicAppUrl(api/uploadLogs,nolinkify)]]] is a simple API for uploading raw log data to Scalyr servers.
It is best suited for lightweight integrations, or uploading individual batches of data from a stateless
environment such as Amazon Lambda. For complex use cases, you can also use the
[addEvents API](/help/api#addEvents).

From a traditional server environment, it is usually most convenient write your logs to disk, and
use the [Scalyr Agent](/help/scalyr-agent) to upload them. We also provide a 
[Java client library](/help/java-api).


## API Format

To use this API method, send an HTTPS request with the following fields:

- URL: [[[publicAppUrl(api/uploadLogs,nolinkify)]]]?token=[[[writeLogsToken]]]
- Method: POST
- Content-Type: text/plain

The token URL parameter is a "Write Logs" API token for your account. You can manage API tokens at
[[[publicAppUrl(keys)]]]

The request body should consist of one or more log messages, separated by line breaks (\n, \r, or \r\n).
A line break after the last message is optional.

**Note**: this API is not currently intended to ingest more than 10 GB/day. If you are working with higher log
volumes, you should use the [Scalyr Agent](/help/scalyr-agent) or 
[addEvents API](/help/api#addEvents), or contact us at [support@scalyr.com](mailto:support@scalyr.com).


## Responses

A successful request will return a response with the following body:

    {"status":"success"}

A failed request will return a body like this:

    {
      "message": "...detailed information goes here...",
      "status": "error/client/badParam"
    }


## Server / Log Attributes

You can add parameters to the URL, or as an HTTP request header, to tag messages as coming from a specific server
and/or log file:

**host** specifies the server name.

**logfile** specifies the log file name.

**parser** specifies which parser will be used to parse these messages (see [/help/parsing-logs](/help/parsing-logs)).

In addition, you can add arbitrary URL parameters or request headers beginning with "server-". For example, specify
``&server-region=us-east-1` to add a server field named "region", with value "us-east-1".

NOTE: to specify the server name in an HTTP request header, you must create a header named ``server-host``. Creating
a header named simply ``host`` will cause confusion, since this is a standard HTTP header.


## Retries and Nonces

To protect against double-uploads, you can include a "Nonce" header in the HTTPS request. This header may contain
any value. Multiple requests with the same nonce in the same (roughly) one-minute period are ignored.

If you are implementing logic to retry failed requests, it is a good idea to use the Nonce header. Generate a
unique value for each request, and re-use the value when retrying a request.


## Example

The following curl command will upload a single log message:

    curl -v '[[[publicAppUrl(api/uploadLogs,nolinkify)]]]?token=[[[writeLogsToken]]]' \
        -H 'Content-Type: text/plain' -d 'hello, world'

If you'd like to test with multiple lines of input, note that the curl command tends to remove line breaks. Use
curl's --data-binary option to avoid this.