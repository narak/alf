'use strict';

var alsi = alsi || {};

require.config({
    baseUrl: "/static/js"
});

(function(window, document, undefined) {
    require(['alf', 'alert-box'], function (alf, AlertBox) {
        'use strict';

        var $form = document.forms[0],
            $loginLabel = document.getElementById('login-text');
        $form.username.focus();
        alf.event.on($form.password, 'focus', function(evt) {
            alf.animate($loginLabel, 'ani-fade-in');
        });
    });
})(window, document);