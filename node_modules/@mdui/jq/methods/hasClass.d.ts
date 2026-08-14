declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 判断集合中的第一个元素是否含有指定 CSS 类。
         * @param className CSS 类名
         * @example
    ```js
    $('div').hasClass('item')
    ```
         */
        hasClass(className: string): boolean;
    }
}
export {};
