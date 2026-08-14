import './css.js';
import './eq.js';
import './offset.js';
import './offsetParent.js';
interface Coordinates {
    left: number;
    top: number;
}
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 获取集合中第一个元素相对于父元素的偏移
         * @example
    ```js
    $('.box').position();
    // { top: 20, left: 30 }
    ```
         */
        position(): Coordinates;
    }
}
export {};
