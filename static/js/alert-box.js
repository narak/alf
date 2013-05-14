/**
 * Alert box basic functionalities.
 */
(function(window, undefined) {
    define(function() {
        'use strict';
        var AlertBox = function(el) {
            this.el = el;
            this.el.style.display = 'none';
            this.el.classList.remove('hide');
        };

        AlertBox.prototype.hide = function(text) {
            var that = this;
            alf.animate(this.el, 'ani-fade-out');
        };

        AlertBox.prototype.info = function(msg) {
            this.show(msg, function() {
                alf.dom.removeClass(this.el, 'alert-*');
                this.el.classList.add('alert-info');
            });
        };

        AlertBox.prototype.error = function(msg) {
            this.show(msg, function() {
                alf.dom.removeClass(this.el, 'alert-*');
                this.el.classList.add('alert-error');
            });
        };

        AlertBox.prototype.success = function(msg) {
            this.show(msg, function() {
                alf.dom.removeClass(this.el, 'alert-*');
                this.el.classList.add('alert-success');
            });
        };

        AlertBox.prototype.show = function(msg, process) {
            var that = this;
            this.el.style.display = '';
            alf.animate(that.el, {
                effect: 'ani-fade-out',
                afterAnimated: true
            }, function(evt) {
                if (process !== undefined)
                    process.apply(that);
                if (msg !== undefined)
                    that.el.innerHTML = msg;
                alf.animate(that.el, 'ani-fade-in');
            });
        };

        return AlertBox;
    });
})(window);