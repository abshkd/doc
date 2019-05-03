---
title: "Import Logs via S3 Buckets"
notoc: true
---

Unlike the other guides in this section, this one describes how to import log files which are deposited in an Amazon S3 bucket.


## Before You Start

1. Set up an S3 bucket in which you periodically deposit log files. It's best to add a new file every few minutes.
If you use longer batches (e.g. one file per hour), that imposes a delay on the logs showing up in Scalyr.

2. Create an SQS queue, and configure your S3 bucket to publish new-object notifications to the queue.

3. Use Amazon's IAM (Identity and Access Management) tools to create an IAM role account which can only be
used to read this bucket and queue. For instructions, see the section [Create IAM Role](#createIAMRole).


## Steps

Scalyr offers a monitoring service that can continually fetch data via HTTP. These steps will guide you through creating a monitor to
fetch log files from an S3 bucket.

1. Click Dashboards &gt; Monitors &lpar;or just go to [/monitors](/monitors)&rpar;.

2. Click Settings &gt; Edit Monitors  to open the monitors configuration file.

3. Find the ``monitors`` section of the configuration file. If you have never edited this file before,
the monitors section will look like this:

     ```
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
     ```

4. Add a stanza for the SQS queue you created earlier. The section might now look like this:

     ```
      monitors: [
        {
          type: "s3Bucket",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          queueUrl: "https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/scalyr-s3-bucket-foo"
          fileFormat: "text_gzip",
          hostname: "foo",
          parser: "foo"
        }
      ]
     ```
   See [Field Values](#field-values) below for what to fill in these.
   
5. Save your changes, and Scalyr should begin checking for new data batches once per minute.

6. Wait for the initial batch of log data to be retrieved. It can take anywhere from minutes to hours for Amazon to publish the
first batch.

7. To verify the new monitor, go to the Scalyr homepage. In the list of servers, you should see an entry named according to the
``hostname`` you specified in the monitor configuration with a link to your bucket access logs.


## Field Values


Field                       | Value
---|---
type                        |  ``s3Bucket``
region                      | The AWS region in which your SQS queue is located, e.g. ``us-east-1``.
s3Region                    | The AWS region in which your S3 bucket instance is located, e.g. ``us-east-1``.  You can omit this unless it is different than ``region``.
accessKey<super>*</super>                   | The Access Key ID you obtained when creating your IAM role.
secretKey<super>*</super>                  | The Secret Access Key you obtained when creating your IAM role.
queueUrl                    | The name of the SQS queue to which your bucket sends new-object notices.
fileFormat                  | ``text_gzip`` if each file is compressed using gzip, ``text`` if not compressed.
objectKeyFilter             | Optional. If you specify a value, then S3 objects are ignored unless their name (object key) contains this substring. If you have multiple logs being published to the same S3 bucket, use this option to select the appropriate subset.
hostname                    | The server name under which your bucket access logs will appear in the Overview page.
logfile                     | The file name under which your bucket access log will appear in the Overview page.
parser                      | Name of a parser to apply to these logs.
logAttributes               | Optional. Specifies extra fields to attach to the messages imported from this log. 

<super>*</super> Don't use credentials from your primary AWS account &mdash; always use an IAM role account with limited permissions. If
you haven't already done so, follow the [Create IAM Role](#createIAMRole) instructions to create a special role
account which only has access to the S3 bucket and SQS queue.


## Troubleshooting

If your logs don't appear, make sure you've waited at least a few minutes since saving your changes to the Monitors
configuration (i.e. since clicking Update File), and that new file(s) have been added to your S3 bucket subsequent to
adding the Monitors configuration. Then return to the Scalyr homepage and refresh your browser.

If the logs still don't appear, you may have a configuration error which is preventing the Scalyr monitor from retrieving
your logs. To check for error messages, in Scalyr's top navigation bar, click {{menuRef:Search}}. In the
{{menuRef:Expression}} box, type ``tag='S3BucketMonitor'`` and click the {{menuRef:Search}} button. Click {{menuRef:Latest}}
to jump to the most recent log messages, and click on an individual message to see details for that message. If the details
page includes an "errorMessage" field, then AWS returned an error when Scalyr attempted to retrieve your logs. Some common error
messages:

Cause                       | errorMessage
---|---
Incorrect accessKey         | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: InvalidClientTokenId, AWS Error Message: The security token included in the request is invalid.
Incorrect secretKey         | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: SignatureDoesNotMatch, AWS Error Message: The request signature we calculated does not match the signature you provided. Check your AWS Secret Access Key and signing method. [etc.]
Incorrect IAM configuration | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: AccessDenied, AWS Error Message: Access to the resource https&colon;//sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/queue-name is denied.
Incorrect IAM configuration | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: AccessDenied, AWS Error Message: Access to the resource https&colon;//sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/queue-name is denied.


