import './each.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 移除当前元素中所有的子元素
         * @example
    ```js
    $('.box').empty()
    ```
         */
        empty(): this;
    }
}
