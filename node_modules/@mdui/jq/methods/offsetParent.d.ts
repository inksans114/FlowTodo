import './css.js';
import './map.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 返回集合中第一个元素的用于定位的父元素。
         *
         * 即父元素中第一个 `position` 为 `relative`, `absolute` 或 `fixed` 的元素。
         * @example
    ```js
    $('.box').offsetParent()
    ```
         */
        offsetParent(): this;
    }
}
