import { $ } from '../$.js';
import { merge } from '../functions/merge.js';
import { JQ } from '../shared/core.js';
import './each.js';
import './get.js';
$.fn.find = function (selector) {
    const foundElements = [];
    this.each((_, element) => {
        merge(foundElements, $(element.querySelectorAll(selector)).get());
    });
    return new JQ(foundElements);
};
