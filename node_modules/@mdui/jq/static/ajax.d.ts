import type { Options } from '../shared/ajax.js';
declare module '../shared/core.js' {
    interface JQStatic {
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
        ajax<TResponse = any>(options: Options<TResponse>): Promise<TResponse>;
    }
}
