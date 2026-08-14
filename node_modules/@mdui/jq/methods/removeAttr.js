import { $ } from '../$.js';
import { removeAttribute } from '../shared/attributes.js';
import { eachArray } from '../shared/helper.js';
import './each.js';
$.fn.removeAttr = function (attributeName) {
    const names = attributeName.split(' ').filter((name) => name);
    return this.each(function () {
        eachArray(names, (name) => {
            removeAttribute(this, name);
        });
    });
};
