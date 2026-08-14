import { $ } from '../$.js';
import { param } from '../functions/param.js';
import './serializeArray.js';
$.fn.serialize = function () {
    return param(this.serializeArray());
};
