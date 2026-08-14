import { $ } from '../$.js';
$.fn.hasClass = function (className) {
    return this[0].classList.contains(className);
};
