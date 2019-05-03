---
title: "Monitoring Services"
weight: 40
---


You can use HTTP monitors to probe your servers and measure availability, status, and performance. 
Note that monitors are distinct from agent monitor plugins, which run on the server where the agent is installed.
Monitors reside on the Scalyr server. For this reason, you can open and edit them in the configuration file via the Scalyr UI.

Each monitor fetches a specified web page at regular intervals, and logs the outcome. You can
create monitors to probe your public web site or internal servers (if they are visible to the
public Internet). In some cases, monitors can even be used to poll data from a RESTful API
server. You can create up to 100 monitors. 

To create a monitor, open the [/scalyr/monitors](/file?path=%2Fscalyr%2Fmonitors[[[emitAddlParamTeamTokenIfPhoenix]]]) 
configuration file (Administration menu > Monitors > Settings > Edit Monitors), and specify the URL(s) you would like to probe. Here is a simple example: 

    {
      monitors: [
        {
          type: "http",
          url: "https://www.google.com", // fetch the Google home page
          label: "Google Home Page"
        },
        {
          type: "http",
          url: "https://www.bing.com", // and the Bing home page
          label: "Bing Home Page"
        }
      ]
    }

Scalyr will fetch each URL once per minute, on a staggered schedule, and log the outcome. Each
log record has the following fields: 

- tag: "httpMonitor" 
- url: The URL being probed. 
- status: Numeric status code, e.g. 200 or 404. (If Scalyr is unable to establish a connection
  at all, a status of 999 will be reported.) 
- statusLine: The complete status message of the HTTP response, e.g. "HTTP/1.1 200 OK" 
- time: Time required to retrieve this URL, in milliseconds. 
- responseSize: The response size, in bytes. Large responses are currently capped at 50000
  bytes. 
- responseBody: The response text, truncated to 1000 bytes. (Note, you can use extractors to
  log text beyond the first 1000 bytes; see below.) 

Once you have created a monitor, you can go to the [Monitors dashboard](/dash?page=monitors[[[emitAddlParamTeamTokenIfPhoenix]]])
and view a summary of the results. To view the raw data for a particular monitor, click on
its URL in the first column of the dashboard. Note that it will take up to one minute for a
new monitor to execute for the first time.

The optional ``label`` field is used to label the monitor on the Monitors dashboard.

NOTE: when monitoring an https URL, Scalyr does not verify that your SSL certificate is valid. This allows
you to monitor servers which are using self-signed or otherwise nonstandard certificates. As a result, it
is theoretically possible that monitor requests could be intercepted using a MITM attack. This is unlikely
in practice (it would require access to the data center paths between your server and Scalyr), but you should
not include highly sensitive data in the request or response of an HTTP monitor.

NOTE: Currently, Scalyr issues requests from Amazon’s us-east-1 (N. Virginia) region. This may change in the
future.


posts: <POSTs>
## POSTs

By default, monitors perform GET requests. You can also create a monitor that issues a POST, by adding a few
extra fields to your monitor definition:

        {
          type: "http",
          url: "https://www.example.com/page",
          label: "example",
          ***method: "POST",***
          ***requestBody: "this text will be sent in the body of the POST request",***
          ***contentType: "text/plain"***
        },


authentication: <HTTP Authentication>
## HTTP Authentication

You can attach HTTP Basic Authentication credentials to a monitor request. Simply add ``username`` and ``password``
fields to the monitor specification:

        {
          type: "http",
          url: "https://www.example.com/secure-page",
          ***username: "agent 86",***
          ***password: "xxx",***
          label: "example"
        },


headers: <Request Headers>
## Request Headers

You can specify custom HTTP headers to be supplied with a monitor request. Simply add a ``requestHeaders``
field to the monitor specification:

        {
          type: "http",
          url: "https://www.example.com/page",
          ***requestHeaders: {***
            ***header1: "foo",***
            ***header2: ["bar", "baz"]***
          ***},***
          label: "example"
        },


alerts: <Alerts>
## Alerts

You can set up alerts to notify you in case of problems with a server. For instance, you can
alert if a server stops responding, responds slowly, or does not return a 200 status code.
You can also check for expected text patterns in the response, and alert if the expected pattern
does not appear. 

To create an alert, go to the [Monitors dashboard](/dash?page=monitors[[[emitAddlParamTeamTokenIfPhoenix]]]) and click on 
the numeric value you'd like to alert on. For instance, to set an alert based on the average response time,
click the "Average Time" value for the monitor in question. This will display a graph of the
reponse time for that monitor. Then click the Save Search button, select As Alert, specify the threshold at which
you'd like to be alerted, and click Add to create the alert. 

To alert on a text pattern, use an extractor (see below) to match on that pattern, and then
alert on an field generated by the extractor. 

intervals: <Interval and Timeout>
## Customize Interval and Timeout

By default, Scalyr will fetch each monitored URL once per minute, and wait up to 10 seconds
for the response. You can customize either of these values, either for all monitors or for
individual monitors, by specifying the new values in the /scalyr/monitors configuration file.
Here is an example: 

    {
      monitors: [
        ***executionIntervalMinutes: 5, // Fetch URLs once every 5 minutes by default***
        ***timeoutSeconds: 20,          // And allow up to 20 seconds for the response***
        {
          type: "http",
          url: "https://www.google.com",
          ***timeoutSeconds: 30 // Allow up to 30 seconds for this response***
        },
        {
          type: "http",
          url: "https://www.bing.com",
          ***executionIntervalMinutes: 2 // Fetch this page every 2 minutes***
        }
      ]
    }

tagging: <Tagging Monitors>
## Tagging Monitors

You can attach fields to a monitor. These fields are included in each log record created
by the monitor, and so can be used to query for output from a group of monitors. To attach
fields to a monitor, add a clause to the monitor definition, as follows: 

    {
      monitors: [
        {
          type: "http",
          url: "https://www.google.com",
          ***logAttributes: {***
            ***name1: "value1",***
            ***name2: "value2"***
          ***}***
        }
      ]
    }

responseHeaders: <Response Headers>
## Logging Response Headers

You can instruct a monitor to record one or more fields of the HTTP respoonse header, by listing
those headers in the monitor definition: 

    {
      monitors: [
        {
          type: "http",
          url: "https://www.google.com",
          ***responseHeadersToRecord: ["Connection", "Content-Type"]***
        }
      ]
    }

textPatterns: <Text Patterns>
## Extracting Text Patterns

For each monitor, you can specify text patterns to be extracted from the response. This allows
you to verify that the response text is as expected, or to fetch data from an API. Text patterns
are checked in the first 50,000 bytes of the response, and up to 1000 bytes from each pattern
are logged. 

To extract a text pattern, add an ``extractors`` clause to the monitor definition, listing
one or more text patterns to extract. Extractors use the same syntax as the "formats" section
of a log parser (see the [parser documentation](/help/parsing-logs)). Here are a 
couple of simple examples: 

    {
      monitors: [
        { // log lucky=true if the Google home page still says "I'm Feeling Lucky"
          type: "http",
          url: "https://www.google.com",
          ***extractors: [{id: "lucky", format: ".*I'm Feeling Lucky"}]***
        },
        { // log the latest price for Apple stock
          type: "http",
          url: "http://download.finance.yahoo.com/d/quotes.csv?s=AAPL&f=nsl1op&e=.csv",
          ***extractors: [".*\",$price=number$,"]***
        }
      ]
    }

templates: <Monitor Templates>
## Monitor Templates

If you would like to maintain a set of similar monitors, you can define the monitors once using
a template, and create several monitors from that template. Monitor templates are specified
using a nested section in the monitors file: 

    {
      monitors: [
        {
          templateParameters: [
            { hostname: "server1.example.com" },
            { hostname: "server2.example.com" },
            { hostname: "server3.example.com" }
          ],
          
          monitors: [
            { // Fetch the server's status page
              type: "http",
              url: "http://#hostname#/status",
              timeoutSeconds: 20,
              label: "#hostname# status"
            },
            { // Verify that the server supports SSL connections
              type: "http",
              url: "https://#hostname#",
              label: "#hostname# SSL check"
            }
          ]
        }
    }

Note the # syntax used to customize the monitor for each server. # variables can be used in
the url field and in the logAttributes section. For a fuller discussion of templates and template
parameters, see the "Alert Templates" section of the [Alerts documentation](/help/alerts). 
Also note that you can use templated alerts in conjunction with your templated monitors, to alert
on each instance of a templated monitor. 
