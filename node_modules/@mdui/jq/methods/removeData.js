import { $ } from '../$.js';
import { removeData } from '../functions/removeData.js';
import './each.js';
$.fn.removeData = function (name) {
    return this.each((_, element) => {
        removeData(element, name);
    });
};
