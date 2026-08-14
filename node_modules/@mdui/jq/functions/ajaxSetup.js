import { globalOptions } from '../shared/ajax.js';
import { extend } from './extend.js';
/**
 * 为 ajax 请求设置全局配置参数
 * @param options 键值对参数
 * @example
```js
ajaxSetup({
  dataType: 'json',
  method: 'POST',
});
```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ajaxSetup = (options) => {
    return extend(globalOptions, options);
};
