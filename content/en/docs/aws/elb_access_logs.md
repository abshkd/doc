---
title: "ELB Access Logs"
notoc: true
---

{{% note %}}
__Note__: ELBs make logs available in batches, so there can be a delay before
log messages show up in Scalyr. Amazon's documentation specifies a maximum delay of 24 hours, but this is
unusual in practice.
{{% /note %}}


## Before You Start

1. Enable access logs for your load balancer(s). See
http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/enable-access-logs.html. It's best to create a new
S3 bucket just for these logs.

2. Create an SQS queue, and configure your S3 bucket to publish new-object notifications to the queue.

3. Use Amazon's IAM (Identity and Access Management) tools to create an IAM role account which can only be
used to read this bucket and queue. For instructions, see the section [Create IAM Role](#createIAMRole).


## Steps

Scalyr uses "monitors" to fetch data from other services. These steps will guide you through creating a monitor to
fetch your ELB access logs.

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

4. Add a stanza for the SQS queue you created earlier. The section might now look like this:

      monitors: [
        {
          type: "s3Bucket",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          queueUrl: "https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/scalyr-elb-access-logs"
          fileFormat: "elb_access",
          hostname: "elb_access"
        }
      ]

Fill in the appropriate values for each field:

Field                       | Value
type                        | Always ``s3Bucket``.
region                      | The AWS region in which your SQS queue is located, e.g. ``us-east-1``.
s3Region                    | The AWS region in which your S3 bucket instance is located, e.g. ``us-east-1``. \
                                     You can omit this unless it is different than ``region``.
accessKey                   | The Access Key ID you obtained when creating your IAM role.
secretKey                   | The Secret Access Key you obtained when creating your IAM role.
queueUrl                    | The name of the SQS queue to which your bucket sends new-object notices.
fileFormat                  | Always ``elb_access``.
objectKeyFilter             | Optional. If you specify a value, then S3 objects are ignored unless their name \
                                     (object key) contains this substring. If you have multiple logs being published \
                                     to the same S3 bucket, use this option to select the appropriate subset.
hostname                    | The server name under which your ELB access logs will appear in the Overview page. \
                                     Defaults to "S3Bucket".
logfile                     | The file name under which your ELB access log will appear in the Overview page. \
                                     Defaults to "S3Bucket".
logAttributes               | Specifies extra fields to attach to the messages imported from this log. Optional.
objectKeyParser             | See below. Optional.

If you don't have the Access Key ID and Secret Access Key for your IAM role account, you can generate a new key. From the AWS console,
go to the IAM service and select the IAM account you're using for ELB access log import. Choose the "Security Credentials" tab, click
Manage Access Keys, and then click Create Access Key. This will allow you to generate a new Access Key ID / Secret Access Key pair.

Don't use credentials from your primary AWS account; always use an IAM role account with limited permissions. If
you haven't already done so, follow the [Create IAM Role](#createIAMRole) instructions to create a special role
account which only has access to the S3 bucket and SQS queue.

The ``objectKeyParser`` field allows you to extract portions of the S3 object key (file name) as log attributes. It
uses the same syntax as the ``format`` field of a log parsing rule. The following value typically works well for ELB
access logs:

    objectKeyParser:
        "$awsAccountNumber$_$awsServiceName$_$awsRegionName$_$elbName$_$elbAccessLogExportTime$_$elbNodeIP$_$randomUniqueValues$.log"

5. Click {{menuRef:Update File}} to save your changes. Scalyr will begin checking for new data batches once per minute.

6. Wait for the initial batch of log data to be retrieved. It may take minutes to hours for Amazon to publish the
first batch.

7. In the top navigation bar, click Overview. In the list of servers, you should see an entry named according to the
``hostname`` you specified in the monitor configuration. To the right will be a link to your ELB access logs.


troubleshooting: <Troubleshooting>
## Troubleshooting

If your logs don't appear, make sure you've waited at least a few hours since saving your changes to the Monitors
configuration (i.e. since clicking Update File). Also verify that there is fresh activity in your load balancer.
Then return to the Scalyr Overview page and refresh your browser.

If the logs still don't appear, you may have a configuration error which is preventing the Scalyr monitor from retrieving
your logs. To check for error messages, in Scalyr's top navigation bar, click {{menuRef:Search}}. In the
{{menuRef:Expression}} box, type ``tag='S3BucketMonitor'`` and click the {{menuRef:Search}} button. Click {{menuRef:Latest}}
to jump to the most recent log messages, and click on an individual message to see details for that message. If the details
page includes an "errorMessage" field, then AWS returned an error when Scalyr attempted to retrieve your logs. Some common error
messages:

Cause                       | errorMessage
Incorrect accessKey         | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     InvalidClientTokenId, AWS Error Message: The security token included in the request is invalid.
Incorrect secretKey         | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     SignatureDoesNotMatch, AWS Error Message: The request signature we calculated does not match \
                                     the signature you provided. Check your AWS Secret Access Key and signing method. [etc.]
Incorrect IAM configuration | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     AccessDenied, AWS Error Message: Access to the resource https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/queue-name is denied.
Incorrect IAM configuration | Status Code: 403, AWS Service: AmazonSQS, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     AccessDenied, AWS Error Message: Access to the resource https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/queue-name is denied.


## Further Reading

To learn how to work with your imported logs, see [Exploring Data](/help/view).


createIAMRole: <Create IAM Role>
## Appendix: Create IAM Role

You can use Amazon IAM to create a role account which can only be used to read your ELB access logs. This allows you
to grant Scalyr the ability to import the logs, without opening up any other access to your AWS resources. Create
the IAM role as follows:

N. Make a note of your AWS account ID (a 12-digit number). You can find it near the top of the AWS
   [My Account](https://portal.aws.amazon.com/gp/aws/manageYourAccount) page.
N. Log into the Amazon AWS console. From the Services menu, choose "IAM".
N. Go to the Users list.
N. Click "Create New Users".
N. Enter a user name, such as "elb-access-log-reader".
N. Click "Create".
N. Click "Show User Security Credentials", and make a note of the Access Key ID and Secret Access Key.
N. Click "Close". Ignore the "You haven't downloaded the User security credentials" warning, and click "close" again.
N. In the user list, click on the newly created user.
N. In the "Permissions" section, click on the "Inline Policies" section, and then click the link to create an inline policy.
N. Click the "Select" button to use the Policy Generator.
N. Select the following values: ##
   ``  ``Effect: Allow                                              ##
   ``  ``AWS Service: Amazon S3                                     ##
   ``  ``Actions: check GetObject                                   ##
   ``  ``Amazon Resource Name: ``arn:aws:s3:::***bucket-name***/*`` ##
  Replace ``bucket-name`` with the name of the S3 bucket you specified when setting up ELB access logging.
N. Click "Add Statement".
N. Update the form with the following values: ##
   ``  ``Effect: Allow                                              ##
   ``  ``AWS Service: Amazon SQS                                    ##
   ``  ``Actions: check GetQueueAttributes, DeleteMessage, and ReceiveMessage            ##
   ``  ``Amazon Resource Name: ``arn:aws:sqs:us-east-1:***account-id***:***queue-name***`` ##
  Replace ``account-id`` with your 12-digit AWS account ID, without hyphens. Replace ``bucket-name`` with the name of
  the SQS queue you subscribed to the S3 bucket.
N. Click "Add Statement".
N. Click "Next Step".
N. Click "Apply Policy".
