import './eq.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 返回当前集合中最后一个元素的集合。
         * @example
    ```js
    $('div').last()
    ```
         */
        last(): this;
    }
}
