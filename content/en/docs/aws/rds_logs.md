---
title: "RDS Logs"
---

Scalyr can
continuously import logs from RDS instances, allowing you to perform real-time analysis and alerting.
(RDS logs are retrieved every 60 seconds.)


## Prerequisites

1. Your database instance should be generating the logs you want to import. The logs should be written
as files, not database tables.

To verify:

- Log into the AWS console, and navigate to the RDS service.
- In the left-hand navigation, click {{menuRef:Instances}}.
- Click on your database instance.
- Click the {{menuRef:Logs}} button.
- Check whether the logs you want are listed. For instance, for MySQL, you might look for 
  ``general/mysql-general.log``, ``slowquery/mysql-slowquery.log``, and ``error/mysql-error.log``.
  For Postgres, look for files with names beginning with ``error/postgresql.log``.

If some of your desired MySQL logs are not listed, read the section [Enable MySQL Logging](#enableLogs).
For Postgres, logs are enabled automatically. For other databases, contact us for support.

2. Use Amazon's IAM (Identity and Access Management) tools to create an IAM role account which can only be
used to read your database logs. For instructions, see the section [Create IAM Role](#createIAMRole).


## Steps

Scalyr uses "monitors" to fetch data from other services, including Amazon RDS. These steps will guide you
through creating a monitor to fetch your RDS log files.

1. From the navigation bar, click {{menuRef:Dashboards}}, and select {{menuRef:Monitors}}.

2. Click {{menuRef:Edit Monitors}} to open the monitors configuration file.

3. Find the ``monitors`` section of the configuration file. If you have never edited this file before,
the monitors section will look like this:

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

4. Add a stanza for each log file you'd like to import. If you like, you can also delete the commented-out
example monitors. The section might now look like this:

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

|||# Field                       ||| Value
|||# type                        ||| Always ``rdsLog``
|||# region                      ||| The AWS region in which your database instance is located, e.g. ``us-east-1``
|||# accessKey                   ||| The Access Key ID you obtained when creating your IAM role.
|||# secretKey                   ||| The Secret Access Key you obtained when creating your IAM role.
|||# db                          ||| The name of your RDS database instance, as shown in the Instances list of the RDS console.
|||# log                         ||| Full path of the log file to import. The example above shows the default paths for MySQL \
                                     error, slow query, and general query logs.
|||# logAttributes               ||| Specifies fields to attach to the messages imported from this log. You should always specify \
                                     a ``parser`` field, as shown in the examples above. This allows you to specify how the log \
                                     file should be parsed. The examples above show appropriate values for MySQL error, slow query, \
                                     and general query logs.

If you don't have the Access Key ID and Secret Access Key for your IAM role account, you can generate a new key. From the AWS console,
go to the IAM service and select the IAM account you're using for RDS log import. Choose the "Security Credentials" tab, click
Manage Access Keys, and then click Create Access Key. This will allow you to generate a new Access Key ID / Secret Access Key pair.

Don't use credentials from your primary AWS account; always use an IAM role account with limited permissions. If
you haven't already done so, follow the [Create IAM Role](#createIAMRole) instructions to create a special role
account which only has access to your database logs.

5. Click {{menuRef:Update File}} to save your changes. Scalyr will begin fetching new log data once per minute.

6. Wait 60 seconds, for the initial batch of log data to be retrieved.

7. In the top navigation bar, click Overview. In the list of servers, you should see an entry for each database instance from
which you are importing logs. For instance, if your database instance is named "foo", you should see a listing for "rds-db-foo".
To the right will be a link for each log you are importing.


#### RDS Metrics
Importing RDS metrics through CloudWatch is also supported with the monitor configuration file. Refer to the [CloudWatch integration](/solutions/import-cloudwatch) instructions to fill in the monitor's attributes. For example:

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
|||# Field                       ||| Value
|||# namespace                   ||| Always ``AWS/RDS``
|||# dimensions                  ||| A JSON value to identify the RDS instance. For example, using "DBInstanceIdentifier" and DB instance id (e.g. scalyr-mysql) as the key-value pair
|||# metric                      ||| List of RDS CloudWatch metrics to import. Note: check what are the available RDS metrics supported for your RDS types, e.g., Aurora, PostgreSQL etc. See [Amazon RDS metrics](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/MonitoringOverview.html#rds-metrics)
|||# statistics                   ||| (optional) Cloudwatch statistic to import. Defaults to "Average" See options in the Amazon RDS Statistics [documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Statistic).


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

troubleshooting: <Troubleshooting>
## Troubleshooting

If your logs don't appear, make sure you've waited at least 60 seconds since saving your changes to the Monitors
configuration (i.e. since clicking Update File). Also verify that there are fresh messages appearing in your RDS
log -- Scalyr won't import old messages. (To check whether new messages are appearing in the log, you can go to
the Amazon RDS console, select your database instance, click the Logs button, and then click the Watch button for
the log in question.) Then return to the Scalyr Overview page and refresh your browser.

If the log still does not appear, you may have a configuration error which is preventing the Scalyr monitor from retrieving
your logs from RDS. To check for error messages, in Scalyr's top navigation bar, click {{menuRef:Search}}. In the {{menuRef:Expression}}
box, type ``tag='rdsLogMonitor'`` and click the {{menuRef:Search}} button. Click {{menuRef:Latest}} to jump to the most recent log messages,
and click on an individual message to see details for that message. If the details page includes an "errorMessage" field, then
Amazon RDS returned an error when Scalyr attempted to retrieve your logs. Some common error messages:

|||# Cause                       ||| errorMessage
|||# Incorrect accessKey         ||| Status Code: 403, AWS Service: AmazonRDS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     InvalidClientTokenId, AWS Error Message: The security token included in the request is invalid.
|||# Incorrect secretKey         ||| Status Code: 403, AWS Service: AmazonRDS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     SignatureDoesNotMatch, AWS Error Message: The request signature we calculated does not match \
                                     the signature you provided. Check your AWS Secret Access Key and signing method. [etc.]
|||# Incorrect IAM configuration ||| Status Code: 403, AWS Service: AmazonRDS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     AccessDenied, AWS Error Message: User: arn:aws:iam::nnnnnnnnnnnn:user/rds-log-reader is not \
                                     authorized to perform: rds:DownloadDBLogFilePortion on resource: [etc.]

If you don't see any error messages, you may simply have entered an incorrect value in the "db" or "log" fields in the
Monitors configuration. RDS will not report an error for an incorrect log file path. Double-check your monitor configuration,
and compare it with the database instance name and log file path shown in the Amazon RDS console.

Scalyr can import at most 2000 log messages per second from RDS. If your database generates a higher log volume over a
sustained period, some messages may be lost. Note that this is quite rare in practice.


## Further Reading

To learn how to work with your imported logs, see [Exploring Data](/help/view).


enableLogs: <Enable Logging>
## Appendix: Enable Logging

If your RDS MySQL database is not generating logs, or is not generating all of the logs you want, you may need
to update the database configuration. In RDS, this is done by editing a "Parameter Group".

Log into the Amazon AWS console and switch to the RDS service. In the left-side navigation list, choose "Instances",
and select your instance. Check the value listed for "Parameter Group". If it's something like "default.mysql5.1",
you are using a default parameter group supplied by Amazon. Default parameter groups can't be edited, so you'll
have to create a new parameter group for this database:

N. In the RDS console, choose "Parameter Groups" from the left-side navigation list.
N. Click "Create DB Parameter Group". Set the DB Parameter Group Family according to your database type, fill in a name and description, and click "Yes, Create". The name can contain only letters, digits, or hyphens and must begin with a letter and end with a letter or number. You can now edit the parameter group, whether your database was already using a non-default parameter group or you've just created one.
N. Select the parameter group, and click the Edit Parameters button.
N. Set the appropriate options. For MySQL, set ``log_output`` to ``File``. To enable the slow query log, set ``slow_query_log`` to 1; to enable the general query log, set ``general_log`` to 1. (Note that on high-traffic databases, the general query log may generate excessive log volume.) For more information, see the [AWS Docs](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.Concepts.MySQL.html). For Postgres, see options in the [AWS Docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.Concepts.PostgreSQL.html). 
N. Click Save Changes. If you created a new parameter group, you now need to update your database instance to use that group. This will
require restarting the database, which entails a brief interruption in service.
N. In the left-side navigation list of the RDS console, choose "Instances".
N. Select your database instance.
N. From the "Instance Actions" dropdown, choose "Modify".
N. Change the "Parameter Group" option to your new parameter group, select "Apply Immediately", and click "Continue".
N. Click "Modify DB Instance".
N. From the "Instance Actions" dropdown, choose "Reboot", then click "Yes, Reboot".
N. Wait for the reboot to complete; this may take some time.




createIAMRole: <Create IAM Role>
## Appendix: Create IAM Role

You can use Amazon IAM to create a role account which can only be used to read your database logs. This allows you
to grant Scalyr the ability to import the logs, without opening up any other access to your AWS resources. Create
the IAM role as follows:

N. Make a note of your AWS account ID (a 12-digit number). You can find it near the top of the AWS
   [My Account](https://portal.aws.amazon.com/gp/aws/manageYourAccount) page.
N. Log into the Amazon AWS console. From the Services menu, choose "IAM".
N. Go to the Users list.
N. Click "Create New Users".
N. Enter a user name, such as "rds-log-reader".
N. Click "Create".
N. Click "Show User Security Credentials", and make a note of the Access Key ID and Secret Access Key.
N. Click "Close". Ignore the "You haven't downloaded the User security credentials" warning, and click "close" again.
N. In the user list, click on the newly created user.
N. In the "Permissions" section, click on the "Inline Policies" section, and then click the link to create an inline policy.
N. Click the "Select" button to use the Policy Generator.
N. Select the following values: ##
   ``  ``Effect: Allow                                              ##
   ``  ``AWS Service: Amazon RDS                                    ##
   ``  ``Actions: check DownloadDBLogFilePortion                    ##
   ``  ``Amazon Resource Name: ``arn:aws:rds:REGION:ACCOUNTID:db:*``
N. For REGION, enter the region in which your database is located, e.g. ``us-east-1``. For ACCOUNTID,
   enter your AWS account number, **without hyphens**.
N. Click "Add Statement", "Next Step", and "Apply Policy".
N. If you have databases in multiple AWS regions, repeat the steps for creating an Inline Policy for each region.
