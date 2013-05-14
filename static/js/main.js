/**
 * Main.js file which is used as a bootstrapper/router for loading the widgets
 * and their dependencies.
 */
'use strict';
var zn = zn || {};

// Require.js config.
require.config({
    paths: {
        'bootstrap': 'bootstrap/bootstrap',
        'jquery': 'jquery/jquery-2.0.0',
        'znf': 'zopnow_framework',
        'text': 'require/text'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: "$.fn.popover"
        },
        'znf': {
            deps: ['jquery']
        }
    },
    config: {
        text: {
            useXhr: function (url, protocol, hostname, port) {
                return true;
            }
        }
    }
});

(function (window, undefined) {
    'use strict';
    require(['znf', 'widget', 'router', 'bootstrap'],
            function (znf, Widget, Router) {
        znf.util.loadWebFontAsync([ 'Open+Sans:300,400,600' ]);

        /**
         * Configurations for znf.
         */
        znf.config = {
            widget: {
                srcPath: 'widgets/',
                rendererPath: 'widget.php'
            },
            api: {
                url: document.body.dataset.api
            },
            dialog: {
                container: document.getElementById('modal-container')
            }
        };

        /**
         * Not using document.ready() because the script is loaded at the bottom
         * of the page.
         */

        // *Order matters here.
        // Set container so widget class knows where to append/replace
        // widgets.
        Widget.setContainer(document.getElementById('main-container'));
        // Start router for listening to .ajaxify links and tracking history.
        Router.start(true);
    });
})(window);
