import './each.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 删除集合中所有元素上指定的 JavaScript 属性值
         * @param name 属性名
         * @example
    ```js
    $('input').removeProp('disabled')
    ```
         */
        removeProp(name: string): this;
    }
}
