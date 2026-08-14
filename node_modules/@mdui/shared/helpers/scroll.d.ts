import '@mdui/jq/methods/addClass.js';
import '@mdui/jq/methods/append.js';
import '@mdui/jq/methods/appendTo.js';
import '@mdui/jq/methods/css.js';
import '@mdui/jq/methods/remove.js';
import '@mdui/jq/methods/removeClass.js';
import '@mdui/jq/methods/width.js';
/**
 * 获取滚动条宽度
 * @param fresh 是否重新计算
 */
export declare const getScrollBarSize: (fresh?: boolean) => number;
/**
 * 判断指定元素当前是否有滚动条
 */
export declare const hasScrollbar: (target: HTMLElement) => boolean;
/**
 * 锁定指定元素，禁止滚动。对同一个元素多次调用此方法，只会锁定一次
 * @param source 由该元素触发锁定
 * @param target 锁定该元素的滚动状态，默认为 html
 */
export declare const lockScreen: (source: HTMLElement, target?: HTMLElement) => void;
/**
 * 解除指定元素的滚动状态锁定。
 * @param source 由该元素触发锁定
 * @param target 锁定该元素的滚动状态，默认为 html
 */
export declare const unlockScreen: (source: HTMLElement, target?: HTMLElement) => void;
