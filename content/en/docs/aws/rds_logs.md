---
title: "RDS Logs"
notoc: true
---

Scalyr can
continuously import logs from RDS instances, allowing you to perform near real-time analysis and alerting
(RDS logs are retrieved every 60 seconds).


## Before You Start

- Your database instance should be generating the logs you want to import. The logs should be written
as files, not database tables.

- Use Amazon's IAM (Identity and Access Management) tools to create an IAM role account which can only be
used to read your database logs. 


## Steps

1. Open the [/file?path=/scalyr/monitors](/file?path=%2Fscalyr%2Fmonitors) JSON configuration file.

1. Find the ``monitors`` section of the configuration file -- see below.

1. Add a stanza for each log file you'd like to import (see below). 

1. Save your changes, and Scalyr will begin fetching new log data at the specified interval.

1. Wait a few minutes, for the initial batch of metrics to be retrieved.

1. Click the Scalyr logo at to top of the page to navigate to the homepage. In the list of servers, you should see an
entry for each database instance from which you are importing logs. 

## Configuration File

If you have never edited it before, the monitor configuration file will look like this:

      monitors: [
        // {
        //   type:        \"http\",
        //   url:         \"http://www.example.com/foo?bar=1\"
        // },
        // {
        //   type:        \"http\",
        //   url:         \"http://www.example.com/foo?bar=1\"
        // }
      ]

Once you add your monitor stanzas, it will look like this (see settings values below):

      monitors: [
        {
          type: "rdsLog",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          db: "prod-rds",
          log: "error/mysql-error.log",
          logAttributes: {parser: "mysqlErrorLog"}
        },
        {
          type: "rdsLog",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          db: "prod-rds",
          log: "slowquery/mysql-slowquery.log",
          logAttributes: {parser: "mysqlSlowQueryLog"}
        },
        {
          type: "rdsLog",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          db: "prod-rds",
          log: "general/mysql-general.log",
          logAttributes: {parser: "mysqlGeneralQueryLog"}
        }
      ]

Fill in the appropriate values for each field:

Field                       | Value
---|---
type                        | Always ``rdsLog``
region                      | The AWS region in which your database instance is located, e.g. ``us-east-1``
accessKey                   | The Access Key ID you obtained when creating your IAM role.
secretKey                   | The Secret Access Key you obtained when creating your IAM role.
db                          | The name of your RDS database instance, as shown in the Instances list of the RDS console.
log                         | Full path of the log file to import. The example above shows the default paths for MySQL                                      error, slow query, and general query logs.
logAttributes               | Specifies fields to attach to the messages imported from this log. You should always specify                                      a ``parser`` field, as shown in the examples above. This allows you to specify how the log                                      file should be parsed. The examples above show appropriate values for MySQL error, slow query,                                      and general query logs.

If you don't have the Access Key ID and Secret Access Key for your IAM role account, you can generate a new key. Don't use 
credentials from your primary AWS account; always use an IAM role account with limited permissions. I


#### RDS Metrics

Importing RDS metrics through CloudWatch is also supported with the monitor configuration file. Refer to the 
[CloudWatch integration](/solutions/import-cloudwatch) instructions to fill in the monitor's attributes. For example:

**MySQL**

    metrics: [
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-mysql"}, metric: "Queries"},
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-mysql"}, metric: "SelectLatency"},
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-mysql"}, metric: "SelectThroughput"},
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-mysql"}, metric: "DatabaseConnections"},
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-mysql"}, metric: "CPUUtilization"},
          ...
    ]
    ...

**Postgres**


    metrics: [
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "DatabaseConnections"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "TransactionLogsGeneration"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "CPUUtilization"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "BurstBalance"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "DiskQueueDepth"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "BurstBalance"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "ReadThroughput"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "ReadIOPS"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "NetworkReceiveThroughput"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "WriteIOPS"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "WriteThroughput"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "ReadLatency"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "WriteLatency"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "FreeableMemory"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "SwapUsage"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "FreeStorageSpace"}
          {namespace: "AWS/RDS", dimensions: {DBInstanceIdentifier: "scalyr-postgres"}, metric: "ReplicationSlotDiskUsage"}
          ...
    ]
    ...

Fill in the appropriate values for each field:
---|---
Field                       | Value
namespace                   | Always ``AWS/RDS``
dimensions                  | A JSON value to identify the RDS instance. For example, using "DBInstanceIdentifier" and DB instance id (e.g. scalyr-mysql) as the key-value pair
metric                      | List of RDS CloudWatch metrics to import. Note: check what are the available RDS metrics supported for your RDS types, e.g., Aurora, PostgreSQL etc. See [Amazon RDS metrics](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/MonitoringOverview.html#rds-metrics)
statistics                   | (optional) Cloudwatch statistic to import. Defaults to "Average" See options in the Amazon RDS Statistics [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Statistic).


#### Postgres Logs

The process to set up RDS Postgres in Scalyr has several key differences than other RDS databases.

Postgres RDS uses rotating names for some Postgres log files. For instance, by default, some messages are written to a series
of files with names like the following. 

    error/postgresql.log.2014-04-09-17
    error/postgresql.log.2014-04-09-18
    error/postgresql.log.2014-04-09-19
    ...


To import this type of file, replace the date portion of the file name with "_YMDH" (if the file name includes the
hour, as in the example above) or "_YMD" (if the file name only includes the year, month, and date):

      monitors: [
        {
          type: "rdsLog",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          db: "prod-rds",
          log: "error/postgresql.log._YMDH",
          logAttributes: {parser: "postgresLog"}
        }
      ]

By default, logging is enabled in Postgres. You can enable more logging options by editing the [Parameter Group](#enableLogs). You can see Postgres logging options [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.Concepts.PostgreSQL.html).

## Troubleshooting

If your logs don't appear, make sure you've waited at least 60 seconds since saving your changes to the Monitors
configuration. Also verify that there are fresh messages appearing in your RDS
log -- Scalyr won't import old messages. 

If the logs still don't appear, you may have a configuration error which is preventing Scalyr from retrieving your
logs. If there are any error messages, they will be included as log entries in Scalyr, which you can search for as 
[tag=rdsLogMonitor](/events?filter=tag%3D%27rdsLogMonitor%27). 

Some common error messages are:


Cause                       | errorMessage
---|---
Incorrect accessKey         | Status Code: 403, AWS Service: AmazonRDS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      InvalidClientTokenId, AWS Error Message: The security token included in the request is invalid.
Incorrect secretKey         | Status Code: 403, AWS Service: AmazonRDS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      SignatureDoesNotMatch, AWS Error Message: The request signature we calculated does not match                                      the signature you provided. Check your AWS Secret Access Key and signing method. [etc.]
Incorrect IAM configuration | Status Code: 403, AWS Service: AmazonRDS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      AccessDenied, AWS Error Message: User: arn:aws:iam::nnnnnnnnnnnn:user/rds-log-reader is not                                      authorized to perform: rds:DownloadDBLogFilePortion on resource: [etc.]

If you don't see any error messages, you may simply have entered an incorrect value in the "db" or "log" fields in the
Monitors configuration. RDS will not report an error for an incorrect log file path. Double-check your monitor configuration,
and compare it with the database instance name and log file path shown in the Amazon RDS console.

Scalyr can import at most 2000 log messages per second from RDS. If your database generates a higher log volume over a
sustained period, some messages may be lost. Note that this is quite rare in practice.
