---
title: "Alert on AWS Billing Spikes"
---

This Solution describes how to use Scalyr to monitor your Amazon AWS usage fees, and notify you if there is an
unexpected jump in spending. Amazon's CloudWatch service can notify you if your total bill for a month exceeds a
specified level, but by the time that happens, damage may already have been done. For instance, if your typical
spending is $100/day, you might set a CloudWatch alert at $3500. If your usage jumps to $200/day on May 2nd, the
alert wouldn't fire until May 18th, by which time $1700 in unexpected spending would already have occurred.

Scalyr can alert you to usage spikes much sooner, before excessive damage is done.


## Prerequisites

1. Configure Scalyr to [import metrics from Amazon CloudWatch](/solutions/import-cloudwatch). 
Make sure to include "EstimatedCharges" as one of the metrics to import, as shown in the sample configuration.

If you're not sure whether you included the EstimatedCharges, then from the navigation bar, click
{{menuRef:Dashboards}}, and select {{menuRef:Monitors}}. Click {{menuRef:Edit Monitors}} to open the monitors
configuration file. Verify that a line like this appears in the ``metrics`` list of your CloudWatch monitor:

    {namespace: "AWS/Billing", metric: "EstimatedCharges", dimensions: {Currency: "USD"}, statistics: "Maximum"},

If this line isn't present, add it. Make sure to import this metric from the ``us-east-1`` region, even if your
AWS resources are in other regions: Amazon always records fee data in us-east-1.

2. Log into the AWS console, and follow
[Amazon's instructions](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/monitor_estimated_charges_with_cloudwatch.html)
to turn on "Receive Billing Alerts". This is necessary for Amazon to report usage fees via CloudWatch. You are not
required to actually receive alerts from Amazon.


## Steps

1. From the navigation bar, select {{menuRef:Alerts}}, and then click the {{menuRef:Edit Alerts}} link. At the end
of the alert list, paste in two new alerts, as shown below:

    {
      alerts: [
        ...

        ***>>> insert these lines***
        {
          description: "No AWS billing data in last 24 hours",
          trigger: "count:24 hours($serverHost='cloudwatch-us-east-1' metric == 'EstimatedCharges') < 1",
          gracePeriodMinutes: ""
        },
        {
          description: "Elevated AWS billing rate",
          trigger: "min:4 hours($serverHost='cloudwatch-us-east-1' metric == 'EstimatedCharges') - min:28 hours($serverHost='cloudwatch-us-east-1' metric == 'EstimatedCharges') > 100",
          gracePeriodMinutes: ""
        }
        ***<<< end of added lines***
      ]
    }

Leave the region as "us-east-1", even if you don't use that AWS region.

2. Edit the threshold for the billing alert, according to your expected AWS charges. The code shown above will alert
if your AWS charges jump by more than $100 in approximately 24 hours. You should replace "100" by an estimate of your
own maximum daily AWS usage, plus a little padding.

3. Click {{menuRef:Update File}} to save your changes and launch the new alerts.

The first alert will trigger if no billing data is reported by Amazon for 24 hours. This will warn you if your
CloudWatch monitor is not properly configured to collect billing data. **It is normal for this alert to
immediately trigger** when first configured. Scalyr doesn't import old data from CloudWatch, so you won't have any
billing data until the first time AWS reports data after you've set up your CloudWatch monitor. This often happens
within four hours, but may take up to 24 hours. According to
[Amazon's documentation](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/monitor_estimated_charges_with_cloudwatch.html),
"estimated charges are calculated and sent several times daily to Amazon CloudWatch". In practice, we have observed
gaps of as much as 16 hours between updates.

The second alert is a bit tricky. It will trigger if the smallest billing estimate in the last four hours, is at
least $100 more than the smallest billing estimate in the 24 hours before that. This is roughly equivalent to triggering
if you spend more than $100 in one day; where "$100" of course is replaced by whatever number you substitute at the end
of the trigger rule.