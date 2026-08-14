import type { Options } from '../shared/ajax.js';
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
export declare const ajaxSetup: <TResponse = any>(options: Options<TResponse>) => Options<TResponse>;
