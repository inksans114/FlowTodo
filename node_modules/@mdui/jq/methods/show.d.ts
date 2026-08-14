import './each.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 显示集合中的所有元素
         * @example
    ```js
    $('.box').show()
    ```
         */
        show(): this;
    }
}
