import './each.js';
import type { PlainObject } from '../shared/helper.js';
declare module '../shared/core.js' {
    interface JQ<T = HTMLElement> {
        /**
         * 设置集合中所有元素的 HTML 属性值
         * @param name 属性名
         * @param value
         * 属性值，可以为字符串或数值。
         *
         * 也可以是一个返回字符串或数值的回调函数。函数的第一个参数为元素的索引位置，第二个参数为该元素上原有的属性值，`this` 指向当前元素
         *
         * 若属性值或函数返回 `null`，则删除指定属性
         *
         * 若属性值或函数返回 `undefined`，则不修改当前属性
         * @example
    ```js
    $('div').attr('title', 'mdui');
    ```
         * @example
    ```js
    $('img').attr('src', function() {
      return '/resources/' + this.title;
    });
    ```
         */
        attr(name: string, value: string | number | null | undefined | ((this: T, index: number, oldAttrValue: string) => string | number | null | void | undefined)): this;
        /**
         * 设置集合中所有元素的多个 HTML 属性值
         * @param attributes
         * 键值对数据。键名为属性名，键值为属性值或回调函数。
         *
         * 回调函数的第一个参数为元素的索引位置，第二个参数为该元素上原有的属性值，`this` 指向当前元素
         *
         * 若属性值或函数返回 `null`，则删除指定属性
         *
         * 若属性值或函数返回 `undefined`，则不修改对应属性
         * @example
    ```js
    $('img').attr({
      src: '/resources/hat.gif',
      title: 'mdui',
      alt: 'mdui Logo'
    });
    ```
         @example
    ```js
    $('img').attr({
      src: function () {
        return '/resources/' + this.title;
      },
      title: 'mdui',
      alt: 'mdui Logo'
    });
    ```
         */
        attr(attributes: PlainObject<string | number | null | undefined | ((this: T, index: number, oldAttrValue: string) => string | number | null | void | undefined)>): this;
        /**
         * 获取集合中第一个元素的 HTML 属性值
         * @param name 属性名
         * @example
    ```js
    $('div').attr('title');
    ```
         */
        attr(name: string): string | undefined;
    }
}
