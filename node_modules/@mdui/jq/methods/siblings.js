import { $ } from '../$.js';
import './add.js';
import './nextAll.js';
import './prevAll.js';
/**
 * 取得同辈元素的集合
 * @param selector {String=}
 * @returns {JQ}
 */
$.fn.siblings = function (selector) {
    return this.prevAll(selector).add(this.nextAll(selector));
};
