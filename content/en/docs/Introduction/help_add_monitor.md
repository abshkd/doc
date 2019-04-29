---
title: "Add an HTTP Monitor"
---

Scalyr can check your servers from the outside, by periodically fetching web pages that you specify.
For each page you'd like to fetch, you create an "HTTP Monitor". This page provides streamlined
instructions to get you up and running quickly. For other options, skip down to the Further Reading
section.


## Defining a Monitor

Open the [/scalyr/monitors](/file?path=%2Fscalyr%2Fmonitors[[[emitAddlParamTeamTokenIfPhoenix]]]) configuration file. This 
file lists all of the URLs you're monitoring. To create a new monitor, just add an entry to the "monitors" list. The
result might look something like this:

    monitors: [
      {
        type: "http",
        url: "https://www.google.com" // fetch the Google home page
      },
      {
        type: "http",
        url: "https://www.bing.com" // and the Bing home page
      }
    ]

Then click {{menuRef:Update File}} to save your changes. Scalyr will fetch each URL once per minute, on a
staggered schedule. You can see the results in the [Monitors dashboard](/dash?page=monitors[[[emitAddlParamTeamTokenIfPhoenix]]]). 
Note that it will take up to one minute for each new monitor to execute for the first time. 


## That's It!

Hopefully, that was easy. If you've had any trouble, please [let us know](mailto:support@scalyr.com).
Otherwise, if this is your first time using Scalyr, this would be an excellent time to head on to the
[Getting Started guide](/help/getting-started).

Note that an HTTP Monitor does not, by itself, notify you of problems with your site. The monitor simply
records data. You can use this data to generate notifications, graph site performance, and more. Monitors
also support a variety of advanced features, such as monitoring many servers with a single template, and scraping fields from the monitored page. For complete documentation, see the [Monitors reference](/help/monitors).
For step-by-step instructions for alerting when a monitored URL exhibits problems, see the
[Alert When Site is Unavailable](/solutions/alert-site-unavailable) solution.
