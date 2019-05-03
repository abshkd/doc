---
title: "CloudWatch Metrics"
notoc: true
---

Scalyr can continuously import CloudWatch metrics for use in dashboards, alerts, and graphs.


## Before You Start

1. AWS provides a feature called IAM (Identity and Access Management), which gives you fine-grained control
over access to resources. You should create an IAM role account which can only be used to read your CloudWatch metrics.
For instructions, see the section [Create IAM Role](#createIAMRole).


## Steps

Scalyr uses "monitors" to fetch data from other services, including CloudWatch. These steps will guide you
through creating a monitor to fetch your CloudWatch metrics.

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

/// Eventually, document additional fields that can be defined at the monitor level: namespace, statistics, dimensions.
/// Could also document "logAttributes".

4. Add a stanza for your CloudWatch data. If you use multiple AWS regions, add one stanza for each region. For example:

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

Fill in the appropriate values for each field:

Field                       | Value
type                        | Always ``cloudwatch``
region                      | The AWS region in which your resources are located, e.g. ``us-east-1``
accessKey                   | The Access Key ID you obtained when creating your IAM role.
secretKey                   | The Secret Access Key you obtained when creating your IAM role.
executionIntervalMinutes    | How often to retrieve data from CloudWatch. Can range from 1 to 5. See [API Fees](#apiFees).
period                      | Time resolution of the retrieved data, in minutes. Can range from 1 to 5. You \
                                     can usually omit this field; the default is 1 minute.
metrics                     | Lists each CloudWatch metric to import. For each metric, specify the namespace, \
                                     metric name, and dimensions under which the metric is listed in CloudWatch. You \
                                     can also specify which statistics to import -- any or all of "Average", "Sum", \
                                     "Minimum", "Maximum", or "SampleCount". Finally, you can specify a period here, \
                                     to customize the time resolution on a metric-by-metric basis.
logAttributes               | Optional: a set of fields and values to be added to each event recorded by this \
                                     monitor. For example, specify ``logAttributes: { tier: 'frontend' }`` to indicate \
                                     that this measurement is from a frontend server. You may use any field names you \
                                     like. (Note that #variable# substitution is not supported in these fields.)

If you don't have the Access Key ID and Secret Access Key for your IAM role account, you can generate a new key. From the AWS console,
go to the IAM service and select the IAM account you're using for CloudWatch import. Choose the "Security Credentials" tab, click
Manage Access Keys, and then click Create Access Key. This will allow you to generate a new Access Key ID / Secret Access Key pair.

Don't use credentials from your primary AWS account; always use an IAM role account with limited permissions. If
you haven't already done so, follow the [Create IAM Role](#createIAMRole) instructions to create a special role
account which only has access to your database logs.

See [Further Reading](#furtherReading) for references to sample configuration for importing various metrics from
CloudWatch.

5. Click {{menuRef:Update File}} to save your changes. Scalyr will begin fetching new log data at the specified interval.

6. Wait a few minutes, for the initial batch of metrics to be retrieved.

7. In the top navigation bar, click Overview. In the list of servers, you should see an entry for each AWS region from
which you are importing metrics. For instance, if you are importing metrics from us-east-1, you should see a listing for
"cloudwatch-us-east-1".

Note that AWS only reports the "EstimatedCharges" billing metric occasionally, so if this is the only metric
you've listed, you may have to wait for it to appear. It is typically reported every four hours, but we have
observed gaps of as much as a day.


#### Graphing CloudWatch metrics

To generate a graph of a CloudWatch metric, go to the Overview page and click on the link to the "cloudwatch" log.
Switch to the {{menuRef:Facets}} tab. Find the "metric" field. If you are importing more than 10 metrics, click
the {{menuRef:(see all values)}} link below the listed values.

Next, click on the name of the specific metric you would like to graph. Find the list of values, and click the "graph"
link. This should display a graph of that metric.

Note that Scalyr does not import historical data, so when you set up your CloudWatch monitor, at first the graph will
only show a few minutes' data.


apiFees:
#### API Fees

Amazon charges a fee of $0.01 per 1000 Get requests to the CloudWatch API. When Scalyr retrieves metrics from CloudWatch
on your behalf, this fee will accumulate on your AWS bill (not your Scalyr bill). We recommend that you set
executionIntervalMinutes to 2 in your CloudWatch monitor configuration, meaning that Scalyr will perform a Get request
for each metric every 2 minutes. This will result in an AWS fee of $0.216 per metric every 30 days, or around $11/month
if you import 50 metrics.

You can save money by increasing executionIntervalMinutes to 5; the only downside is a slight delay in your CloudWatch
data appearing in Scalyr. Intervals greater than 5 minutes are not currently supported. If you have any concerns about
CloudWatch API fees, please let us know.


troubleshooting: <Troubleshooting>
## Troubleshooting

If your metrics don't appear, make sure you've waited at least 2 minutes since saving your changes to the Monitors
configuration (i.e. since clicking Update File), or longer if you specified a longer period in executionIntervalMinutes.
Then return to the Scalyr Overview page and refresh your browser.

If the metrics still don't appear, you may have a configuration error which is preventing Scalyr from retrieving your
metrics. To check for error messages, in Scalyr's top navigation bar, click {{menuRef:Search}}. In the {{menuRef:Expression}}
box, type ``tag='cloudwatchMonitor'`` and click the {{menuRef:Search}} button. Click {{menuRef:End}} to jump to the most recent log messages,
and click on an individual message to see details for that message. If the details page includes an "errorMessage" field, then
CloudWatch returned an error when Scalyr attempted to retrieve your metrics. Some common error messages:

Cause                       | errorMessage
Incorrect accessKey         | Status Code: 403, AWS Service: CloudWatch, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     InvalidClientTokenId, AWS Error Message: The security token included in the request is invalid.
Incorrect secretKey         | Status Code: 403, AWS Service: CloudWatch, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     SignatureDoesNotMatch, AWS Error Message: The request signature we calculated does not match \
                                     the signature you provided. Check your AWS Secret Access Key and signing method. [etc.]
Incorrect IAM configuration | Status Code: 403, AWS Service: CloudWatch, AWS Request ID: xxx-xxx-xxx-xxx, AWS Error Code: \
                                     AccessDenied, AWS Error Message: User: arn:aws:iam::nnnnnnnnnnnn:user/cloudwatch-reader is not \
                                     authorized to perform: [etc.] on resource: [etc.]

If you don't see any error messages, you may simply have entered an incorrect value in one of the fields in the Monitors
configuration, such as "namespace" or "metric". CloudWatch will not report an error for an incorrect metric namespace, name,
or dimension. Double-check your monitor configuration.


furtherReading:
## Further Reading

The [View Logs](/help/view) page describes the tools you can use to view and analyze 
log data, including CloudWatch metrics. [Query Language](/help/query-language) 
lists the operators you can use to select specific metrics and values.  You can also use metrics in 
[Dashboards](/help/dashboards) and [Alerts](/help/alerts).

To use CloudWatch to monitor your Amazon AWS usage fees, see [Alert on AWS Billing Spikes](/solutions/aws-billing-alert).




createIAMRole: <Create IAM Role>
## Appendix: Create IAM Role

You can use Amazon IAM to create a role account which can only be used to read your CloudWatch metrics. This allows
you to grant Scalyr the ability to import the metrics, without opening up any other access to your AWS resources.
Create the IAM role as follows:

N. Log into the Amazon AWS console. From the Services menu, choose "IAM".
N. Go to the Users list.
N. Click "Create New Users".
N. Enter a user name, such as "cloudwatch-reader".
N. Click "Create".
N. Click "Show User Security Credentials", and make a note of the Access Key ID and Secret Access Key.
N. Click "Close". Ignore the "You haven't downloaded the User security credentials" warning, and click "close" again.
N. In the user list, click on the newly created user.
N. In the "Permissions" section, click on the "Inline Policies" section, and then click the link to create an inline policy.
N. Click the "Select" button to use the Policy Generator.

N. Select the following values: ##
   ``  ``Effect: Allow                                              ##
   ``  ``AWS Service: Amazon CloudWatch                             ##
   ``  ``Actions: check GetMetricStatistics and ListMetrics
N. Click "Add Statement", "Next Step", and "Apply Policy".
