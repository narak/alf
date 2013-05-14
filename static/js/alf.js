/**
 * Alf framework.
 */
(function(document, window, require, undefined) {
    'use strict';
    var alf = {}, util = {}, dom = {}, event = {};
    alf.util = util;
    alf.dom = dom;
    alf.event = event;

    /**
     * Extends the dest object with the properties of the src object.
     */
    util.extend = function(dest, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                dest[key] = src[key];
            }
        }
        return dest;
    };

    /**
     * Truncates the string if it excedes the maxLen without breaking words.
     */
    util.ellipsis = function(str, maxLen) {
        maxLen = maxLen || 90;
        if (!str) return '';
        // Adding ellipsis logically.
        str = str.replace(/[\r\n]/g, ' ');
        if (str.length > maxLen) {
            return str.substring(0, str.substring(0, maxLen-3)
                .lastIndexOf(' ')) + '...';
        } else {
            return str;
        }
    };

    /**
     * Get all the data-props from the passed DOM Element.
     */
    util.getDataProps = function(elPee) {
        var model = {}, els;
        els = elPee.querySelectorAll('[data-prop]');
        for (var j = 0, len = els.length; j < len; j++) {
            var el = els[j],
                prop = el.dataset.prop;

            // If property name starts with [] its a collection, look for items.
            if (prop.indexOf('[]') === 0) {
                var items = el.querySelectorAll('[data-item]'),
                    collection = {};

                for (var k = 0, itemLen = items.length; k < itemLen; k++) {
                    var item = items[k],
                        itemKey = item.dataset.item;

                    collection[itemKey] = item.dataset.value || item.innerText;
                }
                model[prop.substring(2)] = collection;

            } else {
                model[prop] = el.dataset.value || el.innerText;
            }
        }
        return model;
    };

    /**
     * Simple method that executes the test code and calculates the time
     * it took to execute it X number of times.
     */
    util.bench = function(test, X) {
        var x_st, x_et, i=0;
        X = X || 100;
        x_st = new Date();
        for (; i < X; i++) {
            test();
        }
        x_et = new Date();
        return x_et.getTime() - x_st.getTime();
    };

    /**
     * Loads google fonts asynchronously.
     */
    util.loadWebFontAsync = function(fonts) {
        window.WebFontConfig = { google: { families: fonts } };
        (function() {
            var wf = document.createElement('script');
            wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
                '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
            wf.type = 'text/javascript';
            wf.async = 'true';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(wf, s);
        })();
    };

    /**
     * Creates DOM elements from an HTML string efficiently.
     * From SO (http://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro)
     */
    dom.parseHTML = function(html, parentEl) {
        var parent = document.createElement(parentEl || 'div');
        parent.innerHTML = html.trim();
        return parent.children;
    };

    /**
     * Checks if element is part of the DOM tree or is an orphan.
     */
    dom.elementInDocument = function(element) {
        while (element = element.parentNode) {
            if (element == document) {
                return true;
            }
        }
        return false;
    };

    /**
     * Operate on the siblings of the el.
     */
    dom.siblings = function(el, callback) {
        var children = el.parentNode.children,
            len = children.length,
            i, child;
        for (i = 0; i < len; i++) {
            child = children[i];
            if (child !== el) {
                callback(child);
            }
        }
    };

    /**
     * Loop over an array of Elements.
     */
    dom.each = function(els, callback) {
        var e = 0, len = els.length;
        // Tricksy way to convert a LiveNodeList to static, just in case.
        els = Array.prototype.slice.call(els);
        for (; e < len; e++) {
            callback(els[e]);
        }
    };

    /**
     * Remove all contents of an Element.
     */
    dom.empty = function(el) {
        el.innerHTML = '';
    };

    /**
     * Simple class removal using wildcards.
     */
    dom.removeClass = function(el, expr) {
        if (!el) return;
        expr = expr.replace('*', '\\b[^\\s]*\\b');
        var re = new RegExp(expr, 'g'),
            classes = el.className;
        classes = classes.replace(re, '');
        el.className = classes;
    };

    /**
     * Parse css selector string.
     * Eg.
     * selector: "#id-attrib tbody li.active"
     * result: [
     *     {
     *         id: big-detail
     *     },
     *     {
     *         tagName: TBODY
     *     },
     *     {
     *         tagName: LI,
     *         className: ['active']
     *     }
     * ]
     */
    dom.parseSelector = function(selector) {
        var tokens = selector.split(/\s/),
            parsed = [];
        for (var t = 0, tLen = tokens.length; t < tLen; t++) {
            var token = tokens[t];
            // Ignore class/tag selectors if it is an ID selector.
            var hashIndex = token.indexOf('#');
            if (hashIndex >= 0) {
                parsed.push({
                    id: token.substring(hashIndex + 1)
                });
            } else if (token.indexOf('.') >= 0) {
                var classes = token.split('.'),
                    tagName = classes[0],
                    tagAndClass = {};
                classes = classes.slice(1);
                if (tagName)
                    tagAndClass.tagName = tagName;
                tagAndClass.className = classes;
                parsed.push(tagAndClass);
            } else {
                parsed.push({
                    tagName: token.toUpperCase()
                });
            }
        }
        return parsed;
    };

    (function() {
        /**
         * Add dom event listener.
         */
        event.on = function(attachTo, type, selector, listener) {
            var parsedSelector, listenerWrapper;
            if (!attachTo || !type || !selector)
                throw new Error('Insufficient parameters for alf.event.on()');
            // Adjust params for (attachTo, type, listener) call.
            if (!listener) {
                listener = selector;
                selector = undefined;
            }
            if (selector) {
                parsedSelector = dom.parseSelector(selector);
                listenerWrapper = function(evt) {
                    var target = evt.target,
                        el = target,
                        elPrev, elTarget, found, lastSelector, i;
                    i = lastSelector = parsedSelector.length - 1;
                    // Loop over selectors.
                    while (i >= 0) {
                        var currSelector = parsedSelector[i];
                        // Loop through child till last parent i.e. attachTo.
                        while(el !== attachTo) {
                            // One selector can have multiple values. eg, li.active
                            for (var type in currSelector) {
                                if (type === 'id' && el.id === currSelector[type]) {
                                    found = true;
                                } else if (type === 'className') {
                                    var classes = currSelector[type];
                                    for (var c = 0, cLen = classes.length; c < cLen; c++) {
                                        if (!el.classList.contains(classes[c]))
                                            break;
                                    }
                                    // If c === cLen, all classes matched.
                                    if (c === cLen)
                                        found = true;
                                    else
                                        found = false;
                                } else if (type === 'tagName' &&
                                    el.tagName === currSelector[type].toUpperCase()) {
                                    found = true;
                                } else {
                                    found = false;
                                }
                            }

                            elPrev = el;
                            // Go to next parent.
                            el = el.parentNode;
                            // If found, breaks out of Element traversing and moves
                            // to the next selector.
                            if (found) {
                                if (i === lastSelector) {
                                    elTarget = elPrev;
                                }
                                break;
                            }
                        }
                        // If all selectors matched, calls event handler.
                        if (i === 0 && found) {
                            listener.call(elTarget, evt);
                            break;
                        // If all selectors didn't not match but we have reached
                        // the root element, this event should be skipped.
                        } else if (el === this) {
                            break;
                        }
                        i--;
                    }
                };
            } else {
                listenerWrapper = listener;
            }

            var capture = false;
            type = type.toLowerCase();
            if (selector &&
                (type === 'focus' || type === 'blur' || type === 'change')) {
                capture = true;
            }
            attachTo.addEventListener(type, listenerWrapper, capture);
        };
    })();

    /**
     * Alf Animate. YEAH!!!!
     */
    (function() {
        var animationEnd = (function() {
            var t;
            var el = document.createElement('div');
            var animations = {
              'animation':'animationend',
              'OAnimation':'oAnimationEnd',
              'MozAnimation':'animationend',
              'WebkitAnimation':'webkitAnimationEnd'
            }

            for (t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        })();

        /**
         * Does animation based on keyframes and handling their classes.
         * @options {
         *          afterAnimated: true|false - If true, animation will happen
         *                         only if the element was previously animated.
         * }
         */
        alf.animate = function(el, options, callback) {
            var doAnimation = true, handler, effect;
            if (typeof options !== 'string') {
                effect = options.effect;
                doAnimation = options.afterAnimated && !el.dataset.wasAnimated ?
                    false :
                    true;
            } else {
                effect = options;
            }
            if (doAnimation) {
                handler = function(evt) {
                    el.removeEventListener(animationEnd, handler, false);
                    el.dataset.wasAnimated = true;
                    if (callback) callback(evt);
                };
                dom.removeClass(el, 'ani-*');
                el.classList.add(effect);
                el.addEventListener(animationEnd, handler, false);
            } else {
                if (callback) callback();
            }
        };
    })();

    (function() {
        // Simple JavaScript Templating
        // John Resig - http://ejohn.org/ - MIT Licensed
        var cache = {};
        alf.template = function template(str, data) {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ?
                cache[str] = cache[str] || template(document.getElementById(str).innerHTML) :
                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                new Function("obj",
                "var p=[],print=function() {p.push.apply(p,arguments);};" +
                // Introduce the data as local variables using with() {}
                "with(obj) {p.push('" +
                // Convert the template into pure JavaScript
                str.replace(/[\r\t\n]/g, " ")
                  .split("<%").join("\t")
                  .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                  .replace(/\t=(.*?)%>/g, "',$1,'")
                  .split("\t").join("');")
                  .split("%>").join("p.push('")
                  .split("\r").join("\\'")
                + "');}return p.join('');");
            // Provide some basic currying to the user
            return data ? fn( data ) : fn;
        };
    })();

    /**
     * Alf javascript inheritance.
     * (http://ejohn.org/blog/simple-javascript-inheritance/)
     * MIT Licensed.
     */
    (function() {
        var initializing = false,
            fnTest = (/xyz/.test(function() {xyz;})) ? /\b_super\b/ : /.*/;

        // The base Class implementation (does nothing)
        alf.Class = function() {};

        /**
         * Create a new Class that inherits from this class
         * @param  {String} _id  Used to identify the class.
         * @param  {Object} prop Properties to be added to the class.
         * @return New class.
         */
        alf.Class.extend = function(_id, prop) {
            var _super = this.prototype;

            if (_id === undefined ||
                typeof _id !== 'string')
                throw new Error('Cannot instantiate class without _id.');
            prop._id = _id;
            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            var prototype = new this();
            initializing = false;

            // Copy the properties over onto the new prototype
            for (var name in prop) {
                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] === 'function' &&
                    typeof _super[name] === 'function' &&
                    fnTest.test(prop[name]) ?
                        (function(name, fn) {
                            return function() {
                                var tmp = this._super;
                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this._super = _super[name];
                                // The method only need to be bound temporarily, so we
                                // remove it when we're done executing
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;
                                return ret;
                            };
                        })(name, prop[name]) :
                        prop[name];
            }

            // The dummy class constructor
            var alfObj = function(options) {
                if (this.defaults)
                    util.extend(this, this.defaults);
                util.extend(this, options);
                // All construction is actually done in the init method
                if (!initializing && this.init)
                    this.init.apply(this, [options]);
            };

            // Populate our constructed prototype object
            alfObj.prototype = prototype;

            // Enforce the constructor to be what we expect
            alfObj.prototype.constructor = alfObj;

            // And make this class extendable
            alfObj.extend = alf.Class.extend;
            return alfObj;
        };
    })();

    /**
     * View Class.
     */
    alf.View = alf.Class.extend('znV', {
        init: function() {
            if (this.el === undefined)
                throw new Error(this._id + ' View: DOM Element not specified.');
            // If events exist, do the subs.
            if (this.events !== undefined)
                this._doEventSubs();
        },
        // If set to true, requires event handlers to call release() when event
        // is complete.
        blockRapidEvents: false,

        _doEventSubs: function() {
            var eventEl, that = this;
            if (that.eventEl !== undefined) {
                eventEl = that.eventEl;
            } else {
                eventEl = that.el;
            }
            for (var key in this.events) {
                var eventInProgress = false;
                // IIFE for maintaining closure.
                (function(key) {
                    var eventSelect = key.split(':');
                    var callback = that[that.events[key]];
                    event.on(eventEl, eventSelect[0], eventSelect[1], function(evt) {
                        if (!eventInProgress) {
                            if (that.blockRapidEvents) {
                                eventInProgress = true;
                                setTimeout(function() {
                                    eventInProgress = false;
                                }, 5000);
                            }
                            var retVal = callback.call(that, this, evt, function() {
                                eventInProgress = false;
                            });
                            if (retVal !== undefined) {
                                return retVal;
                            } else {
                                evt.preventDefault();
                                evt.stopPropagation();
                            }
                        }
                        return false;
                    });
                })(key);
            }
        }
    });

    // Make it available globally, for console experimentation purposes.
    window.alf = alf;
    // Make AMD compatible.
    if (typeof define === 'function' && define.amd)
        define(function() { return alf; });
})(document, window, require);