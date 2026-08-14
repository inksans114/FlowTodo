import { $ } from '../$.js';
import { JQ } from '../shared/core.js';
import './slice.js';
$.fn.eq = function (index) {
    const ret = index === -1 ? this.slice(index) : this.slice(index, +index + 1);
    return new JQ(ret);
};
