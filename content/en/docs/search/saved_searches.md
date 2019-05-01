---
title: Saved Searches
---

# Saved Searches

If you often refer to a particular search, you can save that search for quick access. Just click the
{{menuRef:Save Search}} dropdown, and select {{menuRef:In Personal Searches}} or {{menuRef:In Shared Searches}}.
You can save any sort of search, including log, graph, facet, and histogram views. All fields of the search
form are preserved. (If you make changes in the search form, you must click Search to refresh the view before
saving the search.)

Saved searches are available in the {{menuRef:Search}} menu in the navigation bar. Each time you select a saved
search, Scalyr performs a fresh search and displays the current results.

When you save a search, you'll be prompted to select a name. You may choose any name you like. You'll use the name
to locate your search in the Search menu.


shared: <Shared Searches>
## Shared Searches

Saved searches are organized into two lists, "Saved Searches" and "Shared Searches". The first list contains
searches that you have saved for your personal use. The second list is shared by all users in your Scalyr account.
Your personal list is associated with the e-mail address you use to log into Scalyr, so if you are sharing a login
with co-workers, you'll share the saved search list as well. (Multiple logins are an [Enterprise](/pricing[[[emitSoleParamTeamTokenIfPhoenix]]])
feature; if you're on a smaller pricing plan, you won't be able to create separate login addresses.)


managing: <Managing Saved Searches>
## Managing Saved Searches

Saved searches are stored in a configuration file. To edit your personal Saved Searches list, choose {{menuRef:Saved Searches...}}
from the {{menuRef:Search}} menu in the navigation bar. To edit the Shared Searches list, choose {{menuRef:Shared Searches...}}.

Here is a sample file:

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
        { url: "", title: "" },
        {
          url: "/dash?page=system&param_serverHost=%27server-1%27",
          title: "System dashboard: server 1"
        },
        {
          url: "/dash?page=system&param_serverHost=%27server-2%27",
          title: "System dashboard: server 2"
        }
      ]
    }

Each search has a URL and a title. All URLs refer to the [[[publicDomain]]] domain. The {{menuRef:Save Search}}
dropdown simply records the URL of the page you're currently viewing, which captures all aspects of your search.

When editing the search list directly, you can paste any URL from the Scalyr web site, even URLs for non-search pages.
For instance, you could bookmark a dashboard, including a custom time range and other parameters.

An entry with an empty URL and empty title creates a section separator in the {{menuRef:Search}} menu.

Your personal Saved Searches list is stored in a configuration file whose name depends on your e-mail address. If
you log into Scalyr as foo@example.com, your searches will be in stored in ``/foo_example.com/searches``. The
Shared Searches list is stored in ``/scalyr/searches``. See the [Configuration Files](/help/config) 
page for more information on editing configuration files.