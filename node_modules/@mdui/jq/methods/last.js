import { $ } from '../$.js';
import './eq.js';
$.fn.last = function () {
    return this.eq(-1);
};
