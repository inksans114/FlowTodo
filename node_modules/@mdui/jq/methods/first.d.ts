import './eq.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 返回当前集合中第一个元素的集合。
         * @example
    ```js
    $('div').first()
    ```
         */
        first(): this;
    }
}
