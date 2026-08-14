import '../methods/trigger.js';
import type { Options } from '../shared/ajax.js';
/**
 * 发送 ajax 请求
 * @param options
 * @example
```js
ajax({
  method: "POST",
  url: "some.php",
  data: { name: "John", location: "Boston" }
}).then(function( msg ) {
  alert( "Data Saved: " + msg );
});
```
 */
export declare const ajax: <TResponse = any>(options: Options<TResponse>) => Promise<TResponse>;
