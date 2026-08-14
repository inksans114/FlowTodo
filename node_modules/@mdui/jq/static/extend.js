import { $ } from '../$.js';
import { extend } from '../functions/extend.js';
import { eachObject } from '../shared/helper.js';
$.extend = function (target, ...objectN) {
    if (!objectN.length) {
        eachObject(target, (prop, value) => {
            this[prop] = value;
        });
        return this;
    }
    return extend(target, ...objectN);
};
