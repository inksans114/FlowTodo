import './each.js';
import './hide.js';
import './show.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 切换集合中所有元素的显示状态
         * @example
    ```js
    $('.box').toggle()
    ```
         */
        toggle(): this;
    }
}
