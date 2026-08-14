import './each.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 隐藏集合中所有元素
         * @example
    ```js
    $('.box').hide();
    ```
         */
        hide(): this;
    }
}
