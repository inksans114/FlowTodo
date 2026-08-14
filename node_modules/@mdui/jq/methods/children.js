import { $ } from '../$.js';
import { unique } from '../functions/unique.js';
import { JQ } from '../shared/core.js';
import { isElement, eachArray } from '../shared/helper.js';
import './each.js';
import './is.js';
$.fn.children = function (selector) {
    const children = [];
    this.each((_, element) => {
        eachArray(element.childNodes, (childNode) => {
            if (!isElement(childNode)) {
                return;
            }
            if (!selector || $(childNode).is(selector)) {
                children.push(childNode);
            }
        });
    });
    return new JQ(unique(children));
};
