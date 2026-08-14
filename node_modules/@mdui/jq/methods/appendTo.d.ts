import './insertAfter.js';
import './insertBefore.js';
import './map.js';
import './remove.js';
import type { HTMLString, Selector, TypeOrArray } from '../shared/helper.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 把当前集合中的元素追加到指定元素内部的后面。
         * @param target CSS 选择器、HTML 字符串、DOM 元素、DOM 元素数组、或 JQ 对象
         * @returns 由新插入的元素组成的集合
         * @example
    ```js
    $('<p>Hello</p>').appendTo('<p>I would like to say: </p>')
    // <p>I would like to say: <p>Hello</p></p>
    ```
         */
        appendTo(target: Selector | HTMLString | TypeOrArray<Element> | JQ): this;
    }
}
