import '@mdui/jq/methods/each.js';
import type { JQ } from '@mdui/jq/shared/core.js';
export interface ObserveResize {
    /**
     * 取消监听
     */
    unobserve: () => void;
}
type Callback = (this: ObserveResize, entry: ResizeObserverEntry, observer: ObserveResize) => void;
/**
 * 监听元素的尺寸变化
 * @param target 监听该元素的尺寸变化
 * @param callback 尺寸变化时执行的回调函数，`this` 指向监听的元素
 */
export declare const observeResize: (target: string | HTMLElement | JQ<HTMLElement>, callback: Callback) => ObserveResize;
export {};
