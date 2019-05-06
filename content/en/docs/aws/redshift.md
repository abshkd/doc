---
title: "Redshift Logs"
notoc: true
---

{{% note %}}
__Note__: Redshift makes logs available in batches, so there can be a delay before
log messages show up in Scalyr. Amazon's documentation specifies a maximum delay of 24 hours, but this is
unusual in practice.
{{% /note %}}



## Before You Start

- Enable audit logs for your Redshift instance(s). 

- Create an SQS queue, and configure your S3 bucket to publish new-object notifications to the queue.

- Use Amazon's IAM (Identity and Access Management) tools to create an IAM role account which can only be
used to read this bucket and queue.


## Steps

Scalyr offers a monitoring service for fetching data from other services, including Redshift:

1. Open the [/file?path=/scalyr/monitors](/file?path=%2Fscalyr%2Fmonitors) JSON configuration file.

1. Find the ``monitors`` section of the configuration file -- see below.

1. Add a stanza for your SQS queue (see below). 

1. Save your changes, and Scalyr will begin fetching new log data at the specified interval.

1. Wait a few minutes, for the initial batch of metrics to be retrieved.

1. Click the Scalyr logo at to top of the page to navigate to the homepage. In the list of servers, you should see an entry ``hostName`` you enter for this monitor.

## Configuration File

If you have never edited it before, the monitor configuration file will look like this:

````
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
````

Once you add your monitor, it will look like this (see settings values below):

````
      monitors: [
        {
          type: "s3Bucket",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          queueUrl: "https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/scalyr-redshift-logs"
          fileFormat: "redshift",
          hostname: "redshift"
        }
      ]
````

## Redshift Monitor Settings

Field                       | Value
---|---
type                        | ``s3Bucket``
region                      | The AWS region in which your SQS queue is located, e.g. ``us-east-1``.
s3Region                    | The AWS region in which your S3 bucket instance is located, e.g. ``us-east-1``.                                      You can omit this unless it is different than ``region``.
accessKey                   | The Access Key ID you obtained when creating your IAM role.
secretKey                   | The Secret Access Key you obtained when creating your IAM role.
queueUrl                    | The name of the SQS queue to which your bucket sends new-object notices.
fileFormat                  | ``redshift``
objectKeyFilter             | Optional. If you specify a value, then S3 objects are ignored unless their name                                      (object key) contains this substring. If you have multiple logs being published                                      to the same S3 bucket, use this option to select the appropriate subset.
hostname                    | The server name under which your Redshift logs will appear in the Overview page.                                      Defaults to "S3Bucket".
logfile                     | The file name under which your Redshift log will appear in the Overview page.                                      Defaults to "S3Bucket".
logAttributes               | Specifies extra fields to attach to the messages imported from this log. Optional.

If you don't have the Access Key ID and Secret Access Key for your IAM role account, you can generate a new key. Don't use
credentials from your primary AWS account; always use an IAM role account with limited permissions.

## Troubleshooting

If your logs don't appear, make sure you've waited at least a few hours since saving your changes to the Monitors
configuration (i.e. since clicking Update File). Also verify that there is fresh activity in your Redshift instance.
Then return to the Scalyr Overview page and refresh your browser.

If the logs still don't appear, you may have a configuration error which is preventing the Scalyr monitor from retrieving
your logs. If there are any error messages, they will be included as log entries in Scalyr, which you can search for as 
[tag=S3BucketMonitor](/events?filter=tag%3D%27S3BucketMonitor%27). 

Some common error messages are:
           
Cause                       | errorMessage
---|---
Incorrect accessKey         | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      InvalidClientTokenId, AWS Error Message: The security token included in the request is invalid.
Incorrect secretKey         | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      SignatureDoesNotMatch, AWS Error Message: The request signature we calculated does not match                                      the signature you provided. Check your AWS Secret Access Key and signing method. [etc.]
Incorrect IAM configuration | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      AccessDenied, AWS Error Message: Access to the resource https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/queue-name is denied.
Incorrect IAM configuration | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      AccessDenied, AWS Error Message: Access to the resource https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/queue-name is denied.
