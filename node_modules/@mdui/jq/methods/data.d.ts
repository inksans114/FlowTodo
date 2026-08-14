import './each.js';
import type { PlainObject } from '../shared/helper.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 在当前元素上存储数据
         *
         * `value` 为 `undefined` 时，不设置数据，直接返回原对象
         *
         * @param key 数据键名
         * @param value 数据值
         * @example
    ```js
    $('.box').data('type', 'image')
    ```
         */
        data(key: string, value: unknown): this;
        /**
         * 在当前元素上存储数据
         * @param data 键值对数据
         * @example
    ```js
    $('.box').data({
      width: 1020,
      height: 680,
    })
    ```
         */
        data(data: PlainObject): this;
        /**
         * 获取在当前元素上存储的数据
         * @param key 数据键名
         * @example
    ```js
    $('.box').data('height')
    // 680
    ```
         */
        data(key: string): unknown;
        /**
         * 获取在当前元素上存储的所有数据
         * @example
    ```js
    $('.box').data()
    // { 'type': 'image', 'width': 1020, 'height': 680 }
    ```
         */
        data(): PlainObject;
    }
}
