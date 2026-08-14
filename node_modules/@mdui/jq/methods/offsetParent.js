import { getDocument } from 'ssr-window';
import { $ } from '../$.js';
import './css.js';
import './map.js';
/**
 * 返回最近的用于定位的父元素
 */
$.fn.offsetParent = function () {
    const document = getDocument();
    return this.map(function () {
        let offsetParent = this.offsetParent;
        while (offsetParent && $(offsetParent).css('position') === 'static') {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || document.documentElement;
    });
};
