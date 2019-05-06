---
title: "CloudTrail Logs"
notoc: true
---

{{% note %}}
__Note__: CloudTrail makes records available in batches, so there can be a delay before
records show up in Scalyr. Amazon's documentation specifies a maximum delay of 24 hours, but this is
unusual in practice.
{{% /note %}}

## Before You Start

- Set up CloudTrail for the Amazon account and region you wish to monitor. 

- Use Amazon's IAM (Identity and Access Management) tools to create an IAM role account which can only be
used to read your CloudTrail logs. 


## Steps

Scalyr offers a monitoring service for fetching data from other services, including CloudTrail:

1. Open the [/file?path=/scalyr/monitors](/file?path=%2Fscalyr%2Fmonitors) JSON configuration file.

1. Find the ``monitors`` section of the configuration file -- see below.

1. Add a stanza for your CloudTrail data (see below). 

1. Save your changes, and Scalyr will begin fetching new log data at the specified interval.

1. Wait a few minutes, for the initial batch of metrics to be retrieved.

1. Click the Scalyr logo at to top of the page to navigate to the homepage. In the list of servers, you should see an entry named "CloudTrail".


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

Once you add your CloudTrail entry, it may look like this:

      monitors: [
        {
          type: "cloudtrail",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          queueUrl: "https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/scalyr-cloudtrail"
        }
      ]

## CloudTrail Monitor Settings

Field                       | Value
---|---
type                        | ``cloudtrail``
region                      | The AWS region in which your SQS queue is located, e.g. ``us-east-1``
s3Region                    | The AWS region in which your S3 bucket instance is located, e.g. ``us-east-1``.                                      You can omit this unless it is different than ``region``.
accessKey                   | The Access Key ID you obtained when creating your IAM role.
secretKey                   | The Secret Access Key you obtained when creating your IAM role.
queueUrl                    | The name of the SQS queue you created when setting up CloudTrail for Scalyr.
hostname                    | The server name under which your CloudTrail log will appear in the Overview page.                                      Defaults to "CloudTrail".
logfile                     | The file name under which your CloudTrail log will appear in the Overview page.                                      Defaults to "CloudTrail".
logAttributes               | Specifies extra fields to attach to the messages imported from this log. Optional.

If you don't have the Access Key ID and Secret Access Key for your IAM role account, you can generate a new key. From the AWS console,
go to the IAM service and select the IAM account you're using for CloudTrail log import. Choose the "Security Credentials" tab, click
Manage Access Keys, and then click Create Access Key. This will allow you to generate a new Access Key ID / Secret Access Key pair.

Don't use credentials from your primary AWS account; always use an IAM role account with limited permissions. If
you haven't already done so, follow the [Create IAM Role](#createIAMRole) instructions to create a special role
account which only has access to your CloudTrail logs.

5. Click {{menuRef:Update File}} to save your changes. Scalyr will begin fetching new log data once per minute.

6. Wait 5 to 10 minutes, for the initial batch of log data to be retrieved.

7. In the top navigation bar, click Overview. In the list of servers, you should see an entry named "CloudTrail". To the
right will be a link to your CloudTrail logs.


## Troubleshooting

If your metrics don't appear, make sure you've waited at least 2 minutes since saving your changes to the Monitors
configuration file, or longer if you specified a longer period in executionIntervalMinutes.
Then return to the Scalyr Overview page and refresh your browser.

If the metrics still don't appear, you may have a configuration error which is preventing Scalyr from retrieving your
metrics. If there are any error messages, they will be included as log entries in Scalyr, which you can search for as 
[tag=cloudtrailMonitor](/events?filter=tag%3D%27cloudtrailMonitor%27). 

Some common error messages are:

Cause                       | errorMessage
---|---
Incorrect accessKey         | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      InvalidClientTokenId, AWS Error Message: The security token included in the request is invalid.
Incorrect secretKey         | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      SignatureDoesNotMatch, AWS Error Message: The request signature we calculated does not match                                      the signature you provided. Check your AWS Secret Access Key and signing method. [etc.]
Incorrect IAM configuration | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      AccessDenied, AWS Error Message: Access to the resource https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/queue-name is denied.
