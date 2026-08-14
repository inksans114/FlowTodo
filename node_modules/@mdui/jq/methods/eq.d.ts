import './slice.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 返回仅包含指定索引位置的元素的集合。
         * @param index 元素的索引位置
         * @example
    ```js
    // 返回第一个元素的集合
    $('div').eq(0);
    ```
         * @example
    ```js
    // 返回最后一个元素的集合
    $('div').eq(-1);
    ```
         */
        eq(index: number): this;
    }
}
