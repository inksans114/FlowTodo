/**
 * 键名为字符串的对象
 */
export type PlainObject<T = any> = Record<string, T>;
/**
 * HTML 字符串类型
 */
export type HTMLString = string;
/**
 * CSS 选择器类型
 */
export type Selector = string;
/**
 * 一个类型、或该类型组成的数组
 */
export type TypeOrArray<T> = T | ArrayLike<T>;
/**
 * 获取指定元素的标签名（小写），不存在元素的返回空字符串
 * @param element
 */
export declare const getNodeName: (element: Element | null | undefined) => string;
/**
 * 判断元素是否为指定的标签名（不区分大小写）
 * @param element
 * @param name
 */
export declare const isNodeName: (element: Element | null | undefined, name: string) => boolean;
export declare const isFunction: (target: unknown) => target is Function;
export declare const isString: (target: unknown) => target is string;
export declare const isNumber: (target: unknown) => target is number;
export declare const isBoolean: (target: unknown) => target is boolean;
export declare const isUndefined: (target: unknown) => target is undefined;
export declare const isNull: (target: unknown) => target is null;
export declare const isWindow: (target: unknown) => target is Window;
export declare const isDocument: (target: unknown) => target is Document;
export declare const isElement: (target: unknown) => target is Element;
export declare const isNode: (target: unknown) => target is Node;
export declare const isArrayLike: (target: unknown) => target is ArrayLike<unknown>;
export declare const isObjectLike: (target: unknown) => target is PlainObject;
export declare const toElement: (target: Element | Document) => Element;
/**
 * 把用 - 分隔的字符串转为驼峰（如 box-sizing 转换为 boxSizing）
 * @param string
 */
export declare const toCamelCase: (string: string) => string;
/**
 * 把驼峰法转为用 - 分隔的字符串（如 boxSizing 转换为 box-sizing）
 * @param string
 */
export declare const toKebabCase: (string: string) => string;
/**
 * 始终返回 false 的函数
 */
export declare const returnFalse: () => false;
/**
 * 始终返回 true 的函数
 */
export declare const returnTrue: () => true;
/**
 * 遍历数组
 * @param target
 * @param callback
 */
export declare const eachArray: <T>(target: ArrayLike<T>, callback: (this: T, value: T, index: number) => unknown) => ArrayLike<T>;
/**
 * 遍历对象
 * @param target
 * @param callback
 */
export declare const eachObject: <T extends PlainObject, K extends keyof T>(target: T, callback: (this: T[K], key: K, value: T[K]) => unknown | void) => T;
