import { $ } from '@mdui/jq/$.js';
import '@mdui/jq/methods/each.js';
import { uniqueId } from './uniqueId.js';
let weakMap;
// ResizeObserver 实例，所有 resizeObserver 函数内部共用一个 ResizeObserver 实例
let observer;
/**
 * 监听元素的尺寸变化
 * @param target 监听该元素的尺寸变化
 * @param callback 尺寸变化时执行的回调函数，`this` 指向监听的元素
 */
export const observeResize = (target, callback) => {
    const $target = $(target);
    const key = uniqueId();
    // 取消监听函数
    const result = {
        unobserve: () => {
            $target.each((_, target) => {
                const options = weakMap.get(target);
                const index = options.coArr.findIndex((co) => co.key === key);
                if (index !== -1) {
                    options.coArr.splice(index, 1);
                }
                if (!options.coArr.length) {
                    observer.unobserve(target);
                    weakMap.delete(target);
                }
                else {
                    weakMap.set(target, options);
                }
            });
        },
    };
    // 初始化
    if (!weakMap) {
        weakMap = new WeakMap();
        observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const target = entry.target;
                const options = weakMap.get(target);
                options.entry = entry;
                options.coArr.forEach((co) => {
                    co.callback.call(result, entry, result);
                });
            });
        });
    }
    // 添加监听
    $target.each((_, target) => {
        const options = weakMap.get(target) ?? { coArr: [] };
        // 同一个元素已添加过监听后，再次添加新的监听时，不会立即执行回调函数，所以这里手动调用一次回调函数
        if (options.coArr.length && options.entry) {
            callback.call(result, options.entry, result);
        }
        options.coArr.push({ callback, key });
        weakMap.set(target, options);
        observer.observe(target);
    });
    return result;
};
