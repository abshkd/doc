---
title: How Scalyr Works
weight: 101
---

Scalyr is a service. You don't need to know how it works. But you're an engineer; you *like* knowing how things work.
This page is for you.


overview: <Overview>
## Overview

[[[{type: "image", name: "external-block-diagram.png", maxWidth: 750}]]]

Scalyr unifies multiple functions into a single tool: log aggregation, search, and analysis; server metrics;
dashboards and alerts, external monitoring, and more. At the heart of all this is the **event database**, a universal
repository for logs, metrics, and other operational data, hosted on our servers. Data reaches the event database from
a variety of sources:

- The [Scalyr Agent](/help/scalyr-agent), a lightweight daemon installed on your 
  servers. It collects logs, server metrics, and other information, and sends them to Scalyr's servers over SSL.
- [Monitors](/help/monitors), which run on Scalyr's servers. They can probe your web 
  servers, import metrics from Amazon CloudWatch, and collect log files from a plethora of Amazon services.
- Our SSL-based [API](/help/api). Use this to push data directly to Scalyr.
- More options listed at [Data Sources](/help/data-sources).

Once data has reached the event database, you can view, search, and analyze it using our array of web-based tools. You
can also analyze and retrieve data using our [API](/help/api) or 
[command-line tool](https://github.com/scalyr/scalyr-tool). Finally, [alerts](/help/alerts) 
automatically query the event database and notify you when specified conditions occur.


agent: <Agent>
## Agent

The Scalyr Agent is a daemon that you install on your servers. It sits in the background, monitoring the log files you
specify. Every few seconds, it checks each file for new messages, and uploads those messages to Scalyr. The agent also
gathers system and application / process metrics. The agent is open source ([GitHub](https://github.com/scalyr/scalyr-agent-2/)),
and can be extended with custom monitoring plugins.

You can configure the agent to [redact sensitive information](/help/scalyr-agent#filter) 
from your logs before the logs leave your server. Communication to the Scalyr server is strictly outbound; Scalyr's 
servers can't push commands or new configuration down to the agent. You're always in complete, local control of the 
agent's behavior.


monitors: <Monitors>
## Monitors

A **monitor** is an active data-gathering process that runs inside Scalyr servers. Examples:

- An [HTTP monitor](/help/monitors) probes a specified URL (http or https) and records 
  data on availability, status, performance, and response content.
- A [CloudWatch monitor](/solutions/import-cloudwatch) uses the Amazon CloudWatch API 
  to retrieve metric data for your AWS services.
- An [CloudTrail monitor](/solutions/import-cloudtrail) uses Amazon CloudTrail to 
  retrieve records of your AWS API usage.
- An [RDS log monitor](/solutions/import-rds-logs) uses Amazon's RDS API to retrieve 
  log files for your RDS databases.


parsing: <Log Parsing>
## Log Parsing

As log messages arrive, the Scalyr server parses them to extract structured fields. These fields are recorded in the
event database for use in search and analysis. The [parsing engine](/help/parsing-logs) 
uses regular expressions, augmented to process JSON, URL encoding, quoted strings, and other formats. We have yet to 
encounter a log we couldn't parse (challenge us!).

The parser holds the last 60 seconds of logs in a special association buffer. This allows it to combine multi-line
messages, such as stack traces, into a single event. It can even associate values across non-adjacent messages, if
they share a transaction identifier or other common field.


alerts: <Alerts>
## Alerts

[Alerts](/help/alerts) are managed by a background process on Scalyr's database servers. 
Alerts are evaluated once per minute, using a query against the event database. When an alert changes state, we enqueue 
a task to alert your specified recipient(s).  This task is stored durably in our database, ensuring that it can be 
retried reliably until delivery occurs.


security: <Security>
## Security

Security is a key driver behind every aspect of our system design. Some of the steps we take:

- All communication, including internal hops, uses SSL. The only exception is when you tell us to monitor an HTTP URL.
- The Scalyr Agent is designed with safety in mind. It doesn't have to run as root, has no facility for
  receiving external instructions (we can't reach in and control it), and it can
  [redact sensitive information](/help/scalyr-agent#filter) before it leaves your server.
- We build on safe tools: Java instead of C/C++, to eliminate buffer overflows; prepared SQL statements, to eliminate
  SQL injection; AngularJS templates, which automatically encode data to avoid XSS; automatic input sanitization, for
  a second layer of XSS defense; and so on.
- Access to the Scalyr API is authorized using permission-limited tokens, that you can rotate or revoke at any time.
  The Scalyr Agent runs with a token that only allows it to upload new log data.


reliability: <Service Reliability>
## Service Reliability

We take our responsibility of providing a reliable service very seriously. We run in multiple data centers, with full
redundancy. We closely monitor all servers, with overlapping mechanisms:

- A separate staging instance of Scalyr monitors our production servers. This monitoring is quite detailed, with
  hundreds of alerts covering every critical system from multiple angles.
- The production servers monitor the staging servers.
- Our alerts are designed to catch problems before they happen. For instance, we alert when a buffer reaches 70% of
  capacity, rather than waiting until it overflows.
- Most uncaught exceptions result in an immediate e-mail message being sent to the operations team. (This forces us to
  run a very tight ship -- even unusual or intermittent problems are caught and fixed.)
- User mistakes, such as incorrect query syntax, are also logged for periodic review. We use this information to
  continuously make Scalyr easier to learn and use.
- To break the Scalyr-monitors-Scalyr recursion, we also monitor our servers using Pingdom.


diagram: <System Diagram>
## System Diagram

[[[{type: "image", name: "internal-block-diagram.png", maxWidth: 750}]]]

Scalyr is organized around a set of **database servers**, which run our custom software stack for storing, searching,
and rendering the event database. Database servers are organized into replication triplets, consisting of one master
and two read replicas, each located in a different AWS availability zone. Two of these are powerful machines, each
capable of handling the workload on its own. In normal operation they cooperate to double query performance; if one
fails, the other can immediately take over its duties. The third server ensures data retention even in the event of
catastrophe.

Each request passes through a load balancer, a pool of redundant "frontend" servers, and finally the appropriate master
database server.

Monitors (for probing web servers, retrieving Amazon CloudWatch metrics, CloudFront, CloudTrail, ELB, RDS,
Redshift, and S3 logs, and more) run on monitor servers.

database: <Event Database>
## Event Database

The event database is Scalyr's universal repository for logs, metrics, and other operational data. Each message or
metric is represented as an **event**, with fields such as its timestamp, message text, origin server, and any parsed
ields. The [Getting Started](/help/getting-started) page has more information about 
the event model.

All operations become queries against the event database. A query can select any set of events using our
[query language](/help/query-language). The query engine can return the raw matching 
events, or summarize them as a [graph](/help/view#graph), 
[facet breakdown](/help/view#facets), or 
[histogram](/help/view#histogram).

The event database is entirely home-built, optimized for cost efficiency and blazing query performance. Events are
stored in a columnar format (like Amazon Redshift). We add some data organization tricks inspired by Google's
PowerDrill project ("Processing a Trillion Cells per Mouse Click"). We've embarked on a series of blog posts to
describe the inner workings in detail, so if you'd like to dive deep, check out
[Searching 1 TB/sec: Systems Engineering Before Algorithms](https://www.scalyr.com/blog/searching-1tb-sec-systems-engineering-before-algorithms/).
