---
title: "CloudWatch Metrics"
notoc: true
---

Scalyr can continuously import CloudWatch metrics for use in dashboards, alerts, and graphs.


## Before You Start

Create an IAM role account which, for security purposes, can only be used to read your CloudWatch metrics.


## Steps

Scalyr offers a monitoring service for fetching data from other services, including CloudWatch:

1. Open the [/file?path=/scalyr/monitors](/file?path=%2Fscalyr%2Fmonitors) JSON configuration file.

1. Find the ``monitors`` section of the configuration file -- see below.

1. Add a stanza for your CloudWatch data (see below). If you use multiple AWS regions, add one stanza for each region.

1. Save your changes, and Scalyr will begin fetching new log data at the specified interval.

1. Wait a few minutes, for the initial batch of metrics to be retrieved.

1. Click the Scalyr logo at to top of the page to navigate to the homepage. In the list of servers, you should see an entry for each AWS region from
which you are importing metrics. For instance, if you are importing metrics from us-east-1, you should see a listing for
"cloudwatch-us-east-1".

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

Once you add your monitors, it will look like this (see settings values below):


````
      ...

      monitors: [
        {
          type: "cloudwatch",
          region: "us-east-1",
          accessKey: "XXX",
          secretKey: "YYY",
          executionIntervalMinutes: 2,
          period: 1,
          metrics: [
            {namespace: "AWS/Billing", metric: "EstimatedCharges", dimensions: {Currency: "USD"}, statistics: "Maximum"},

            {namespace: "AWS/EC2", metric: "CPUUtilization", dimensions: {InstanceId: "i-20e126ce"}, statistics: "Minimum, Maximum"},
            {namespace: "AWS/EC2", metric: "StatusCheckFailed", dimensions: {InstanceId: "i-20e126ce"}},
            {namespace: "AWS/EC2", metric: "StatusCheckFailed_Instance", dimensions: {InstanceId: "i-20e126ce"}},
            {namespace: "AWS/EC2", metric: "StatusCheckFailed_System", dimensions: {InstanceId: "i-20e126ce"}}
          ]
        },
        {
          type: "cloudwatch",
          region: "us-west-1",
          accessKey: "XXX",
          secretKey: "YYY",
          executionIntervalMinutes: 2,
          period: 1,
          metrics: [
            {namespace: "AWS/EC2", metric: "CPUUtilization", dimensions: {InstanceId: "i-35a646bb"}, statistics: "Minimum, Maximum"},
            {namespace: "AWS/EC2", metric: "StatusCheckFailed", dimensions: {InstanceId: "i-35a646bb"}},
            {namespace: "AWS/EC2", metric: "StatusCheckFailed_Instance", dimensions: {InstanceId: "i-35a646bb"}},
            {namespace: "AWS/EC2", metric: "StatusCheckFailed_System", dimensions: {InstanceId: "i-35a646bb"}}
          ]
        }
      ]

      ...
````

## CloudWatch Monitor Settings

Field                       | Value
---|---
type                        | ``cloudwatch``
region                      | The AWS region in which your resources are located, e.g. ``us-east-1``
accessKey                   | The Access Key ID you obtained when creating your IAM role.
secretKey                   | The Secret Access Key you obtained when creating your IAM role.
executionIntervalMinutes    | How often to retrieve data from CloudWatch. Can range from 1 to 5. See [API Fees](#apiFees).
period                      | Time resolution of the retrieved data, in minutes. Can range from 1 to 5. You                                      can usually omit this field; the default is 1 minute.
metrics                     | Lists each CloudWatch metric to import. For each metric, specify the namespace,                                      metric name, and dimensions under which the metric is listed in CloudWatch. You                                      can also specify which statistics to import -- any or all of "Average", "Sum",                                      "Minimum", "Maximum", or "SampleCount". Finally, you can specify a period here,                                      to customize the time resolution on a metric-by-metric basis.
logAttributes               | Optional: a set of fields and values to be added to each event recorded by this                                      monitor. For example, specify ``logAttributes: { tier: 'frontend' }`` to indicate                                      that this measurement is from a frontend server. You may use any field names you                                      like. (Note that #variable# substitution is not supported in these fields.)

If you don't have the Access Key ID and Secret Access Key for your IAM role account, you can generate a new key. From the AWS console,
go to the IAM service and select the IAM account you're using for CloudWatch import. Choose the "Security Credentials" tab, click
Manage Access Keys, and then click Create Access Key. This will allow you to generate a new Access Key ID / Secret Access Key pair.

Don't use credentials from your primary AWS account; always use an IAM role account with limited permissions. If
you haven't already done so, follow the [Create IAM Role](#createIAMRole) instructions to create a special role
account which only has access to your database logs.


Note that AWS only reports the "EstimatedCharges" billing metric occasionally, so if this is the only metric
you've listed, you may have to wait for it to appear. It is typically reported every four hours, but we have
observed gaps of as much as a day.


#### API Fees

Amazon charges a fee of $0.01 per 1000 Get requests to the CloudWatch API. When Scalyr retrieves metrics from CloudWatch
on your behalf, this fee will accumulate on your AWS bill (not your Scalyr bill). We recommend that you set
executionIntervalMinutes to 2 in your CloudWatch monitor configuration, meaning that Scalyr will perform a Get request
for each metric every 2 minutes. This will result in an AWS fee of $0.216 per metric every 30 days, or around $11/month
if you import 50 metrics.

You can save money by increasing executionIntervalMinutes to 5; the only downside is a slight delay in your CloudWatch
data appearing in Scalyr. Intervals greater than 5 minutes are not currently supported. If you have any concerns about
CloudWatch API fees, please let us know.


## Troubleshooting

If your metrics don't appear, make sure you've waited at least 2 minutes since saving your changes to the Monitors
configuration file, or longer if you specified a longer period in executionIntervalMinutes.
Then return to the Scalyr Overview page and refresh your browser.

If the metrics still don't appear, you may have a configuration error which is preventing Scalyr from retrieving your
metrics. If there are any error messages, they will be included as log entries in Scalyr, which you can search for as 
[tag=cloudwatchMonitor](/events?filter=tag%3D%27cloudwatchMonitor%27). 

Some common error messages are:

Cause                       | errorMessage
---|---
Incorrect accessKey         | Status Code: 403, AWS Service: CloudWatch, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      InvalidClientTokenId, AWS Error Message: The security token included in the request is invalid.
Incorrect secretKey         | Status Code: 403, AWS Service: CloudWatch, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      SignatureDoesNotMatch, AWS Error Message: The request signature we calculated does not match                                      the signature you provided. Check your AWS Secret Access Key and signing method. [etc.]
Incorrect IAM configuration | Status Code: 403, AWS Service: CloudWatch, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code:                                      AccessDenied, AWS Error Message: User: arn:aws:iam::nnnnnnnnnnnn:user/cloudwatch-reader is not                                      authorized to perform: [etc.] on resource: [etc.]

If you don't see any error messages, you may simply have entered an incorrect value in one of the fields in the Monitors
configuration, such as "namespace" or "metric". CloudWatch will not report an error for an incorrect metric namespace, name,
or dimension. Double-check your monitor configuration.
