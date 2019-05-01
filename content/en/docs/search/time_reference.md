---
title: Date/Time Reference
---

# Date/Time Reference

When searching or graphing, you can view data from any period of time. Use a large time range to view 
long-term trends, or a narrow range to focus on current status or investigate a specific incident.

By default, the last four hours are displayed. You can
[customize this default](/help/tips#defaultSearchTimeSpan).

The time range is specified by the From and To fields:

[[[{type: "image", name: "nuiTimeDropdown-plain.png"}]]]

You can specify dates and times in almost any format, including shortcuts such as "4 hours" to indicate
four hours ago. You can leave the To box blank to include events up to the present time. You can also
enter a To value beginning with a "+" to indicate a time span, e.g. "+1 day" is 1 day after the From
time. The following examples illustrate the full array of date options:

||| From                     ||| To                       ||| Meaning
||| 4 hours                  |||                          ||| The last four hours
||| 6 days                   ||| 5 days                   ||| From six days (144 hours) to five days (120 hours) ago
||| 10:30 AM                 ||| 2 PM                     ||| 10:30 AM to 2:00 PM today
||| 10:30                    ||| 14:00                    ||| 24-hour format is also supported
|||#10:30:14.106 AM          |||#10:30:18.904 AM          ||| As are seconds and fractional seconds
||| Monday                   ||| Thu                      ||| From midnight Monday until midnight Thursday. \
                                                              You can abbreviate day names.
||| March 3                  ||| 4 Mar 2014               ||| From midnight March 3 until midnight March 4. \
                                                              Month and date can be in either order, and year is optional.
||| Oct 11 11:45:00 AM       ||| Friday 6 AM              ||| Any date format can be combined with any time format.
||| 2017-10-11T10:45:00+0800 ||| 2017-10-11T11:45:00+0800 ||| ISO format.
||| Jan. 10 11:00 AM         ||| +4 hours                 ||| From 11:00 AM to 3:00 PM on January 10th.
||| 1346261004000 ms         ||| +30s                     ||| A 30-second period, beginning the specified number of \
                                                              milliseconds after January 1, 1970.
|||#1346261004000000000 ns   ||| +30s                     ||| Similarly, but using nanoseconds.
||| 1346261004000            ||| +30s                     ||| The "ms" or "ns" tag is optional.

For relative times, you can use any of the following units and abbreviations:

      seconds, second, secs, sec, s
      minutes, minute, mins, min, m
      hours, hour, hrs, hr, h
      days, day, d
