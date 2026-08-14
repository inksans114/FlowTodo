import { $ } from '../$.js';
import { getAttribute, setAttribute } from '../shared/attributes.js';
import { isElement, isFunction, eachArray } from '../shared/helper.js';
import './each.js';
eachArray(['add', 'remove', 'toggle'], (name) => {
    $.fn[`${name}Class`] = function (className) {
        if (name === 'remove' && !arguments.length) {
            return this.each((_, element) => {
                setAttribute(element, 'class', '');
            });
        }
        return this.each((i, element) => {
            if (!isElement(element)) {
                return;
            }
            const classes = (isFunction(className)
                ? className.call(element, i, getAttribute(element, 'class', ''))
                : className)
                .split(' ')
                .filter((name) => name);
            eachArray(classes, (cls) => {
                element.classList[name](cls);
            });
        });
    };
});
