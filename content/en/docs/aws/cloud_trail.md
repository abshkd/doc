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

1. Set up CloudTrail for the Amazon account and region you wish to monitor. For instructions, see the section
[Enable CloudTrail](#enableCloudtrail).

2. Use Amazon's IAM (Identity and Access Management) tools to create an IAM role account which can only be
used to read your CloudTrail logs. For instructions, see the section [Create IAM Role](#createIAMRole).


## Steps

Scalyr uses "monitors" to fetch data from other services, including Amazon CloudTrail. These steps will guide you
through creating a monitor to fetch your CloudTrail logs.

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
          type: "cloudtrail",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          queueUrl: "https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/scalyr-cloudtrail"
        }
      ]

Fill in the appropriate values for each field:

Field                       | Value
type                        | Always ``cloudtrail``
region                      | The AWS region in which your SQS queue is located, e.g. ``us-east-1``
s3Region                    | The AWS region in which your S3 bucket instance is located, e.g. ``us-east-1``. \
                                     You can omit this unless it is different than ``region``.
accessKey                   | The Access Key ID you obtained when creating your IAM role.
secretKey                   | The Secret Access Key you obtained when creating your IAM role.
queueUrl                    | The name of the SQS queue you created when setting up CloudTrail for Scalyr.
hostname                    | The server name under which your CloudTrail log will appear in the Overview page. \
                                     Defaults to "CloudTrail".
logfile                     | The file name under which your CloudTrail log will appear in the Overview page. \
                                     Defaults to "CloudTrail".
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


troubleshooting: <Troubleshooting>
## Troubleshooting

If your logs don't appear, make sure you've waited at least 10 minutes since saving your changes to the Monitors
configuration (i.e. since clicking Update File). Also verify that there is fresh activity in your AWS account, e.g.
by navigating to the CloudTrail service in the AWS console. Then return to the Scalyr Overview page and refresh your
browser.

If the logs still don't appear, you may have a configuration error which is preventing the Scalyr monitor from retrieving
your logs from CloudTrail. To check for error messages, in Scalyr's top navigation bar, click {{menuRef:Search}}. In the
{{menuRef:Expression}} box, type ``tag='cloudtrailMonitor'`` and click the {{menuRef:Search}} button. Click {{menuRef:Latest}}
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


## Further Reading

To learn how to work with your imported logs, see [Exploring Data](/help/view).


enableCloudtrail: <Enable CloudTrail>
## Appendix: Enable CloudTrail

To retrieve data from CloudTrail, Amazon requires that you enable the CloudTrail service, configure it to publish messages
to an SNS topic, and then attach an SQS queue to the topic. Scalyr will then be able to receive messages via the SQS queue
and retrieve your CloudTrail logs from Amazon.

This section provides detailed setup instructions. If you are already using CloudTrail, you can skip some of these
steps, but you'll still need to create a new SQS queue for exclusive use by Scalyr.

N. Log into the AWS console, and go to the CloudTrail service.
N. If CloudTrail is already enabled, you should see a list of your "API Activity History". Skip to step 9.
N. If CloudTrail is not enabled, you should see a "Get Started Now" button. Click this button.
N. A "Turn on CloudTrail" form will appear. Click the "Advanced" link to reveal additional options.
N. In the "S3 bucket" field, enter a unique bucket name -- for instance, "cloudtrail-YourCompanyName".
N. Click "Yes" for "SNS notification for every log file delivery".
N. In the "SNS topic (new)" field, enter a topic name. It can be the same as your S3 bucket name.
N. Click "Turn On" to enable CloudTrail.
N. Switch to the console for the SQS service.
N. Click Create New Queue.
N. Enter a queue name. It can be the same as your S3 bucket name.
N. Click Create Queue.
N. You should now be back to the SQS service home page, viewing a list of your SQS queues. Right-click on your newly-
   created queue, and select "Subscribe Queue to SNS Topic".
N. From the "Choose a Topic" dropdown, select the topic you created in step 7.
N. Click "Subscribe".
N. You should now be back to the SQS service home page again. If your newly-created queue is not selected, click on it
    to select it.
N. From the Details section at the bottom of the window, copy the queue URL
   (e.g. “https://sqs.us-east-1.amazonaws.com/nnnnnnnnnnnn/cloudtrail-YourCompanyName”).
   You'll need it when configuring Scalyr to import your CloudTrail logs.


createIAMRole: <Create IAM Role>
## Appendix: Create IAM Role

You can use Amazon IAM to create a role account which can only be used to read your CloudTrail logs. This allows you
to grant Scalyr the ability to import the logs, without opening up any other access to your AWS resources. Create
the IAM role as follows:

N. Make a note of your AWS account ID (a 12-digit number). You can find it near the top of the AWS
   [My Account](https://portal.aws.amazon.com/gp/aws/manageYourAccount) page.
N. Log into the Amazon AWS console. From the Services menu, choose "IAM".
N. Go to the Users list.
N. Click "Create New Users".
N. Enter a user name, such as "cloudtrail-reader".
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
  Replace ``bucket-name`` with the name of the S3 bucket you specified when setting up CloudTrail.
N. Click "Add Statement".
N. Update the form with the following values: ##
   ``  ``Effect: Allow                                              ##
   ``  ``AWS Service: Amazon SQS                                    ##
   ``  ``Actions: check GetQueueAttributes, DeleteMessage, and ReceiveMessage            ##
   ``  ``Amazon Resource Name: ``arn:aws:sqs:us-east-1:***account-id***:***queue-name***`` ##
  Replace ``account-id`` with your 12-digit AWS account ID, without hyphens. Replace ``bucket-name`` with the name of
  the SQS queue you recently created.
N. Click "Add Statement".
N. Click "Next Step".
N. Click "Apply Policy".
