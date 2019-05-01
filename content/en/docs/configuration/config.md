---
title: "Configuration Files"
---

# Configuration Files

Many Scalyr features involve some level of customization. You can design your own dashboards, create
custom alert rules, and so forth.

Most of this customization is done via configuration files. You don't always have to edit configuration
files directly. For instance, you can create alerts using the Save Search -> As Alert option in the graph view,
and manage alerts from the alert overview page, without ever seeing a configuration file. But behind
the scenes, your customizations are represented in configuration files.

From time to time, you may want to edit configuration files directly. Some advanced features can
only be accessed this way. In other situations, the editing the configuration file may be a
matter of convenience; you can quickly change multiple settings, or even use copy and paste to
clone a dashboard or a set of alerts for tweaking. You may also want to back up your configuration,
something that is not possible using conventional web-based tools.

You can access configuration files via the Scalyr web site, as well as the [HTTP API](/help/api),
[Java API](/help/java-api), and [command line](/help/command-line). 
Many configuration files are linked from the pages they control. For instance, the alert overview page 
has an "Edit Alerts" link which leads to the alerts configuration file; dashboards have a similar 
"Edit Dashboard" link. To list all of your configuration files, open the Settings menu in the navigation 
bar, and choose "Configuration". Then click on any file name to view or edit that file.

You may see the following files listed:

|||# Name                         ||| Use
|||# /dashboards/Foo              ||| Defines the "Foo" dashboard. There may be any number of dashboard \
                                      files. Note that some dashboards, like System, are built in to the \
                                      Scalyr service and won't be listed here. If you customize a built-in \
                                      dashboard, your customized version will appear in the list.
|||# /example                     ||| A simple example file, created automatically when you create your account.
|||# /logParsers/foo              ||| Rules for parsing log files tagged with ``parser: foo``. There may be any \
                                      number of parser files. Note that some parsers, like webAccess, are built \
                                      in to the Sclyr service and won't be listed here. If you customize a \
                                      built-in parser, your customized version will appear in the list.
|||# /datatables/foo              ||| A data table for use with the ``lookup`` command in a PowerQuery. \
                                      See [Lookup Command](/help/power-queries#lookup).
|||# /scalyr/alerts               ||| Lists all [alerting rules](/help/alerts).
|||# /scalyr/searches             ||| Lists all [shared searches](/help/saved-searches#shared).
|||# /scalyr/logs                 ||| Can be used to give additional users permission to access \
                                      your account (see [Multiple Users](/help/users)), or to set up linking \
                                      from search results (see [View Logs](/help/view)).
|||# /scalyr/monitors             ||| Lists all [HTTP monitors](/help/monitors).
|||# /foo_example.com/searches   ||| Lists all personal [saved searches](/help/saved-searches).


json: <Scalyr JSON>
## Scalyr JSON 

Scalyr configuration files are all expressed in JSON. For convenience and readability, we support
several extensions to the standard JSON format. Most of these extensions are part of standard
JavaScript, and were omitted from the JSON standard only to simplify parsing. The only Scalyr
extension that is not part of standard JavaScript is comma inference.

Scalyr JSON is supported in configuration files (including the Scalyr Agent's configuration file,
which resides on the server where the agent is installed). It is not guaranteed to be supported in
other uses of JSON at Scalyr, such as API request bodies. Scalyr API responses are standard JSON;
you can use a standard JSON parser for working with Scalyr APIs.

Scalyr's JSON extensions for configuration files are as follows:

- **Comments**. Both // and /*...*/ comments are supported. 
- **Optional quoting on field names**. In an object literal, the double-quotes around field
  names can be omitted (if the field name is a valid JavaScript identifier).  
- **String concatenation**. String constants can be split into several sections, joined by
  the + operator. 
- **Trailing commas**. An object or array may end with a trailing comma. 
- **Comma inference**. If you omit a comma in an object or array, the comma will be inferred,
  so long as a line break is present.

### Example

All of these extensions are illustrated in the following example, except comma inference
(which is covered in the next example):

    {
      /* Default time span to display for this dashboard. This can be overridden
       * on the fly using fields on the dashboard page.
       */
      // duration: "4h",
      
      // One entry per graph to display in this dashboard.
      graphs: [
        // Show free disk space on host1.
        {
          label: "Free disk space",
          facet: "value",
          filter: "source='tcollector' metric='df.1kblocks.free'" +
                    " host='host1'",
        },
        
        // Show CPU usage, broken down into user, system, and iowait time.
        {
          label: "CPU Usage",
          facet: "value",
          plots: [
            {
              label: "user",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='user'"
            }, {
              label: "system",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='system'"
            }, {
              label: "I/O",
              filter: "source='tcollector' metric='proc.stat.cpu_rate' type='iowait'"
            }
          ]
        }
      ]
    }

### Comma Inference Examples

Standard JSON:

    {"x": 1, "y": 2}  // has comma
    [1, 2]            // has comma

Nonstandard JSON, but accepted in Scalyr configuration files:

    {
      "x": 1  // comma inferred at line break
      "y": 2
    }
     
    [1  // comma inferred at line break
    2]

Incorrect JSON, not accepted in Scalyr configuration files:

    {
      "x": 1 "y": 2  // missing comma, no line break
    }                
     
    [1 2]            // missing comma, no line break
