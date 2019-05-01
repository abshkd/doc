---
title: Timeout Tips
---

# Is your Search or Graph Timing Out?

We know how frustrating it is when you're trying to track something down, and Scalyr is timing out. Unfortunately, sometimes log data can get very large making it difficult to search through quickly.

## Try searching a shorter time period

For example, if you are trying to search over the last three days, try searching them one day at a time. To search the first day:

[[[{type: "image", name: "nuiTimeDropdown3Day.png"}]]]

To search the second day, change the Start field to "2d", and so on. Take a look at our [Date/Time Reference](/help/time-reference) for further information.

## Try using a parsed field

Change a generic text search ("404") to a parsed field search (status=404), because they are much more efficient.

If you don't have a parsing rule set up for the field you're searching, or don't know how to use parsed fields, see [Parsing Logs](/help/parsing-logs) or just [contact us](/contact).

## Try running your search a second time.

Sometimes it will run faster on the second try once the data has been cached.

## If you’re willing to wait a little while for results

From the Search page, click Actions > Add To Dashboard to add your search or graph to a dashboard. Then open the dashboard.

The search may still time out, but by opening the dashboard, you'll trigger a background process to optimize loading the graph data. After about 20 minutes, the dashboard should load quickly even if you search a long time period. You can use the dashboard to narrow down the time period to something that's possible to search directly.

## Still not working?

Please [contact us](/contact)!

We can help you find a more efficient way to run your search.
