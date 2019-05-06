---
title: Saved Searches
notoc: true
---

If you often refer to a particular search or graph, you can save it for quick access. Just click the
Save button in the search page toolbar, and select Save Search.

Saved searches are organized into two lists, "Shared Searches" and "Saved Searches". As the name implies, the first is  shared by everyone on your team, and the second
for your personal use. 


## Managing Saved Searches

Shared searches are stored in a configuration file ([/file?path=/scalyr/searches](/file?path=%2Fscalyr%2Fsearches)), while your personal searches are at /file?path=/your_name/searches. 

Here is an example:

    {
      searches: [
        {
          url: "/events?filter=warn&startTime=24h",
          title: "Warnings (last 24 hours)"
        },
        {
          url: "/events?filter=status%3E%3D500",
          title: "Server errors (status >= 500)"
        },
      ]
    }

When editing the search list directly, you can paste any URL from the Scalyr web site, even URLs for non-search pages.
For instance, you could bookmark a dashboard, including a custom time range and other parameters.

An entry with an empty URL and empty title creates a section separator in the menu.

