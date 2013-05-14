/**
 * oMG lOADing.
 */
(function(undefined) {
    define(function() {
        'use strict';
        var elOmgLoading = document.getElementById('omgLoading');
        return {
            show: function(text) {
                elOmgLoading.innerText = text || 'Loading...';
                elOmgLoading.classList.add('show');
            },
            hide: function() {
                elOmgLoading.classList.remove('show');
            },
            showOnEl: function(el) {
                el.classList.add('busy');
            },
            hideOnEl: function(el) {
                el.classList.remove('busy');
            }
        }
    });
})();