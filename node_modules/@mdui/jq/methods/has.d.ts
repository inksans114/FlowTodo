import './find.js';
import './map.js';
import type { Selector } from '../shared/helper.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 在当前集合的所有元素中，筛选出含有指定子元素的元素。
         * @param selector CSS 选择器或 DOM 元素
         * @example
    ```js
    // 给含有 ul 的 li 加上背景色
    $('li').has('ul').css('background-color', 'red');
    ```
         */
        has(selector: Selector | Element): this;
    }
}
