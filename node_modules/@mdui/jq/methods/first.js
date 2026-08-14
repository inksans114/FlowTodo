import { $ } from '../$.js';
import './eq.js';
$.fn.first = function () {
    return this.eq(0);
};
