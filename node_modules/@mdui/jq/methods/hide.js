import { $ } from '../$.js';
import './each.js';
$.fn.hide = function () {
    return this.each((_, element) => {
        element.style.display = 'none';
    });
};
