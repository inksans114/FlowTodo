import { $ } from '../$.js';
import { contains } from '../functions/contains.js';
import { isString } from '../shared/helper.js';
import './find.js';
import './map.js';
$.fn.has = function (selector) {
    const $targets = isString(selector) ? this.find(selector) : $(selector);
    const { length } = $targets;
    return this.map(function () {
        for (let i = 0; i < length; i += 1) {
            if (contains(this, $targets[i])) {
                return this;
            }
        }
        return;
    });
};
