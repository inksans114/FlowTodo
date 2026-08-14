import { $ } from '../$.js';
import { JQ } from '../shared/core.js';
$.fn.slice = function (...args) {
    return new JQ([].slice.apply(this, args));
};
