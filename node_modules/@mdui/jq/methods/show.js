import { getDocument } from 'ssr-window';
import { $ } from '../$.js';
import { getStyle } from '../shared/css.js';
import { createElement, appendChild, removeChild } from '../shared/dom.js';
import './each.js';
const elementDisplay = {};
/**
 * 获取元素的初始 display 值，用于 .show() 方法
 * @param nodeName
 */
const defaultDisplay = (nodeName) => {
    const document = getDocument();
    let element;
    let display;
    if (!elementDisplay[nodeName]) {
        element = createElement(nodeName);
        appendChild(document.body, element);
        display = getStyle(element, 'display');
        removeChild(element);
        if (display === 'none') {
            display = 'block';
        }
        elementDisplay[nodeName] = display;
    }
    return elementDisplay[nodeName];
};
/**
 * 显示指定元素
 * @returns {JQ}
 */
$.fn.show = function () {
    return this.each((_, element) => {
        if (element.style.display === 'none') {
            element.style.display = '';
        }
        if (getStyle(element, 'display') === 'none') {
            element.style.display = defaultDisplay(element.nodeName);
        }
    });
};
