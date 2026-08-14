import './each.js';
import './get.js';
import type { Selector } from '../shared/helper.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 根据 CSS 选择器找到指定的后代节点的集合
         * @param selector CSS 选择器
         * @example
    ```js
    $('#box').find('.box')
    ```
         */
        find(selector: Selector): this;
    }
}
