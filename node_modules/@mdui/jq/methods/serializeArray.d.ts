import './each.js';
import './val.js';
import type { JQ } from '../shared/core.js';
interface NameValuePair {
    name: string;
    value: string | number;
}
interface NameValuePairOriginal {
    name: string;
    value: string | number | (string | number)[];
}
/**
 * 表单控件的 name、value 组成的数组。其中 value 为原始值
 */
export declare const getFormControlsValue: ($elements: JQ) => NameValuePairOriginal[];
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 把表单元素的值组合成由 `name` 和 `value` 的键值对组成的数组
         *
         * 该方法可对单独表单元素进行操作，也可以对整个 `<form>` 表单进行操作
         * @example
    ```js
    $('form').serializeArray()
    // [ {"name":"name","value":"mdui"}, {"name":"password","value":"123456"} ]
    ```
         */
        serializeArray(): NameValuePair[];
    }
}
export {};
