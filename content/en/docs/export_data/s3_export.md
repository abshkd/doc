---
title: Batch Export Logs to Amazon S3
---

#  Batch Export Logs to Amazon S3

@class=bg-warning docInfoPanel: This feature is still under development and is only available for limited use.  
Please contact [support@scalyr.com](mailto:support@scalyr.com) for more information.

From time to time, you may need to export some log data. Scaly's solution for this is to batch export the data to a dedicated Amazon S3 bucket and notify you when it's done. The first step in configuring this is to provision an S3 bucket.

## Provisioning S3 Buckets

1. Create a new S3 bucket from the AWS Management Console (see Amazon's help page for 
[How Do I Create an S3 Bucket](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html)). Please note that
Amazon S3 bucket names need to be globally unique, so you should call it something like "mylogs.mycompanyname".

2. Add Scalyr to the list of accounts that can read and write objects in this bucket (see Amazon's help page for 
[How Do I Set ACL Bucket Permissions](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/set-bucket-permissions.html)):

- Log into the [AWS console](https://console.aws.amazon.com{target=aws}) and navigate to the S3 service page
- Click on the name of the bucket where exported logs should be written
- In Permissions > Access Control List, choose "+ Add account"
- The Scalyr account id is ``c768943f39940f1a079ee0948ab692883824dcb6049cdf3d7725691bf4f31cbb``
- Click the checkboxes to enable both "List objects" and "Write objects": 

[[[{type: "image", name: "solutionS3Perms.png", maxWidth: 750}]]]

3. Make note of the S3 bucket name for use below.

## Try It

To batch export log data to S3, you'll need to specify a time range, a search query and the name of the S3 bucket you created. 

The export process will run in the background, and if you specified an email address to be notified, you'll get a message 
when it completes.

To cancel a batch export in progress, click on the entry for it in the list, and click the Cancel button in the dialog.

###  Time Range
You can use the preset time links to quickly export recent data. To specify a custom time range, use the From and To fields, 
just as you do in Search.  

See the [Time Syntax Reference](/help/time-reference[[[emitSoleParamTeamTokenIfPhoenix]]]) for 
a complete list of options.

### Query
Enter the query you would like to filter for. To export all data, enter ``*``.

### S3 Bucket
Enter the name of the S3 bucket you created in the provisioning step, above.

### Label (optional)
Use the optional label to differentiate one batch from another in the list of recent batches.  

### S3 Filename Prefix (optional)
If you wish, you can specify a filename prefix to group logs into multiple directories, to avoid one gigantic directory in S3. For instance, if you specify **{yyyy}/**, then a separate directory will be created for each year. All of these directories will be in the same S3 bucket. Note that S3 supports only one level of directories in the bucket--multiple subdirectory levels are not supported.

You can use the following substitution tokens:

|||# Token              ||| Replacement
|||# ``{yyyy}``         ||| The four-digit year, e.g. ``2014``
|||# ``{yy}``           ||| The two-digit year, e.g. ``14``
|||# ``{mm}``           ||| The two-digit month, e.g. ``04`` for April
|||# ``{dd}``           ||| The two-digit date, e.g. ``09`` for April 9

### Email Notification (optional)
If you want to know when an batch export process is complete, enter an email address for the notification.

###  Results

A separate object will be created in the S3 bucket for each log file and each host. The logs will be plain text, compressed 
in gzip format, and named according to the following pattern:

    HOSTNAME_FILENAME_YYYYMMDD_HH.gz

Where YYYY, MM, DD, and HH give the year, month, date, and hour at the beginning of the time period covered by that
object, in UTC time. Special characters in the file name are replaced with dashes. For instance:

    my-server-1_-var-log-messages_20140924_22.gz

## Troubleshooting
Scalyr logs a brief message each time it exports a batch of logs to S3. You can view these messages to confirm that 
everything is working correctly, or to troubleshoot problems. To view them, go to the Search page 
and search for tag='s3-log-archive'.

If you haven't properly configured S3 permissions, you'll see an error like this:

    errorMessage=Amazon S3 error: Status Code: 403, AWS Service: Amazon S3, AWS Request ID: XXXXXXXXXXXXXXXX, AWS Error Code: AccessDenied, AWS Error Message: Access Denied

Review step 1 above ("Provision S3 Bucket"), and make sure that the bucket name is correct.
