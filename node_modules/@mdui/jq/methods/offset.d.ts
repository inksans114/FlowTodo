import './css.js';
import './each.js';
import './position.js';
import type { PlainObject } from '../shared/helper.js';
/**
 * 坐标值
 */
interface Coordinates extends PlainObject {
    left: number;
    top: number;
}
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 设置集合中所有元素相对于 `document` 的坐标。
         * @param value
         * 包含 `top` 和 `left` 属性的对象；或返回此对象的回调函数。
         *
         * 回调函数的第一个参数为元素的索引位置，第二个参数为元素的原有坐标，`this`指向当前元素
         *
         * `top`, `left` 的值为 `undefined` 时，不修改对应的值。
         * @example
    ```js
    $('.box').offset({ top: 20, left: 30 });
    ```
         * @example
    ```js
    $('.box').offset(function () {
      return { top: 20, left: 30 };
    });
    ```
         */
        offset(value: Partial<Coordinates> | ((this: T, index: number, oldOffset: Coordinates) => Partial<Coordinates>)): this;
        /**
         * 获取当前集合中第一个元素相对于 `document` 的坐标
         * @example
    ```js
    $('.box').offset();
    // { top: 20, left: 30 }
    ```
         */
        offset(): Coordinates;
    }
}
export {};
