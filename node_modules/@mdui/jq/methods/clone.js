import { $ } from '../$.js';
import './map.js';
$.fn.clone = function () {
    return this.map(function () {
        return this.cloneNode(true);
    });
};
