type Value = string | number | (string | number)[];
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 把表单元素的值转换为对象。
         *
         * 若存在相同的键名，则对应的值会转为数组。
         *
         * 该方法可对单独表单元素进行操作，也可以对整个 `<form>` 表单进行操作
         * @example
    ```js
    $('form').serializeObject()
    // { name: mdui, password: 123456 }
    ```
         */
        serializeObject(): Record<string, Value>;
    }
}
export {};
