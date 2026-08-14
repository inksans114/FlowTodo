type ThrottledFunc<T extends (...args: any) => any> = (...args: Parameters<T>) => ReturnType<T>;
/**
 * 创建一个节流函数
 * @param func 要执行的函数
 * @param wait 最多多少毫秒执行一次
 * @example
```js
window.addEventListener('scroll', throttle(() => {
  console.log('这个函数最多 100ms 执行一次');
}, 100));
```
 */
export declare const throttle: <T extends (...args: any) => any>(func: T, wait?: number) => ThrottledFunc<T>;
export {};
