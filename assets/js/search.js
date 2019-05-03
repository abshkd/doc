(function () {
    'use strict'

    console.log('search loading');

    if (!window.docsearch) {
        console.log('no docsearch');
        return
    }

    var inputElement = document.getElementById('search-input')
    var siteDocsVersion = inputElement.getAttribute('data-docs-version')

    function getOrigin() {
        var location = window.location
        var origin = location.origin

        if (!origin) {
            var port = location.port ? ':' + location.port : ''

            origin = location.protocol + '//' + location.hostname + port
        }

        return origin
    }

    window.docsearch({
        appId: "5PRFRAX4SB",
        apiKey: '632e51f7b8e364ad743d7ed9c9db4d96',
        indexName: 'docs',
        inputSelector: '#search-input',
        algoliaOptions: {
            facetFilters: ['version:' + siteDocsVersion]
        },
        transformData: function (hits) {
            return hits.map(function (hit) {
                console.log('transformData');

                var currentUrl = getOrigin()
                var liveUrl = 'https://getbootstrap.com'

                // When in production, return the result as is,
                // otherwise remove our url from it.
                // eslint-disable-next-line no-negated-condition
                hit.url = currentUrl.indexOf(liveUrl) !== -1 ?
                    hit.url :
                    hit.url.replace(liveUrl, '')

                // Prevent jumping to first header
                if (hit.anchor === 'content') {
                    hit.url = hit.url.replace(/#content$/, '')
                    hit.anchor = null
                }

                return hit
            })
        },
        // Set debug to `true` if you want to inspect the dropdown
        debug: false
    })
})();