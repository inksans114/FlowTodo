import type { PlainObject } from './helper.js';
type ElementTarget = Element | Document | Window;
/**
 * 获取元素上的所有数据
 * @param element
 */
export declare const getAll: (element: ElementTarget) => PlainObject;
/**
 * 获取元素上的的一个数据
 * @param element
 * @param keyOriginal
 */
export declare const get: (element: ElementTarget, keyOriginal: string) => unknown;
/**
 * 在上设置键值对数据
 * @param element
 * @param object
 */
export declare const setAll: (element: ElementTarget, object: PlainObject) => void;
/**
 * 在元素上设置一个数据
 * @param element
 * @param keyOriginal
 * @param value
 */
export declare const set: (element: ElementTarget, keyOriginal: string, value: unknown) => void;
/**
 * 移除元素上所有数据
 * @param element
 */
export declare const removeAll: (element: ElementTarget) => void;
/**
 * 移除元素上的多个数据
 * @param element
 * @param keysOriginal 键名组成的数组
 */
export declare const removeMultiple: (element: ElementTarget, keysOriginal: ArrayLike<string>) => void;
export declare const dataAttr: (element: HTMLElement, key: string, value?: unknown) => unknown;
export {};
