# Scalyr's Documentation Repository

Welcome to Scalyr's documentation [source repository](https://github.com/scalyr/doc). The site was forked from Google's 
[docsy theme](https://github.com/google/docsy) and runs on the [hugo](https://gohugo.io/) static website tool.       

__We appreciate your contributions and issue submissions__, as Scalyr changes quickly and we sometimes miss things.
To contribute, just follow the setup instructions below to fork, clone and test locally. Once your changes are ready,
just submit a pull request. 

You can create issues directly from [Scalyr's Online Documantation](https://www.scalyr.com/docs/).

## Install Hugo

You need a recent version of Hugo to build the documentation locally (preferably 0.45+). If you install from 
the [release page](https://github.com/gohugoio/hugo/releases), make sure to get the _extended_ Hugo version 
which supports SCSS. Alternatively, on macOS you can install Hugo via Brew.

If you want to do stylesheet changes, you will also need _PostCSS_ to create the final assets. You can also 
install it locally with `npm install`.

## Setup

1. [Fork](https://help.github.com/articles/fork-a-repo/#fork-an-example-repository) the source
 
1. [Clone](https://help.github.com/articles/fork-a-repo/#step-2-create-a-local-clone-of-your-fork) it to 
your dev machine

1. Add the repository as an upstream remote:<br>
`git remote add upstream git@github.com:scalyr/doc.git`
<br>
`git remote set-url --push upstream no_push`
   

## Run Locally

1. cd doc

1. npm install

1. hugo server

If all goes well, the documentation should be running at [http://localhost:1313/](http://localhost:1313/). 
Hugo watches for changes, so edits should automatically appear.

## Edit &amp; Submit

1. Create a branch for your changes:<br>`git checkout -b my_branch_name`

1. Edit the documentation (only changes in the `/content` folder will be accepted)

1. Keep your branch in sync:<br>
`git fetch upstream`
<br>`git rebase upstream/master`

## Request Review

1. Commit and push your edits:<br>
`git commit -m "Add notes to explain changes"`
<br>`git push -f ${your_remote_name} myfeature`

1. Push the changes:<br>
`git push -f ${your_remote_name} my_branch_name`

1. Request the review by visiting your fork from [https://github.com/scalyr/doc](https://github.com/scalyr/doc)

If any of this is new to you, the good folks over at Kubernetes have created a nice writeup on this type of
[Github workflow](https://github.com/kubernetes/community/blob/master/contributors/guide/github-workflow.md).

## 

__Thank you from the Scalyr team!__
