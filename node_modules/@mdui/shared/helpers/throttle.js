import { getWindow } from 'ssr-window';
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = (func, wait = 0) => {
    const window = getWindow();
    let timer;
    let result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (...args) {
        if (timer === undefined) {
            timer = window.setTimeout(() => {
                result = func.apply(this, args);
                timer = undefined;
            }, wait);
        }
        return result;
    };
};
