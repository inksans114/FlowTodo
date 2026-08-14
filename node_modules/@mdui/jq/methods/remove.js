import { $ } from '../$.js';
import { removeChild } from '../shared/dom.js';
import './each.js';
import './is.js';
$.fn.remove = function (selector) {
    return this.each((_, element) => {
        if (!selector || $(element).is(selector)) {
            removeChild(element);
        }
    });
};
