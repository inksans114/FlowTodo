import { $ } from '../$.js';
import './each.js';
$.fn.empty = function () {
    return this.each((_, element) => {
        element.innerHTML = '';
    });
};
