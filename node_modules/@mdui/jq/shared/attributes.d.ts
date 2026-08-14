/**
 * 获取属性值
 * @param element
 * @param key 属性键名
 * @param defaultValue 当 element.getAttribute 为 null 时，默认返回 undefined
 */
export declare const getAttribute: (element: Element, key: string, defaultValue?: unknown) => unknown;
/**
 * 移除属性
 * @param element
 * @param key 属性键名
 */
export declare const removeAttribute: (element: Element, key: string) => void;
/**
 * 设置属性值
 * @param element
 * @param key 属性键名
 * @param value 值，若为 null，则调用 removeAttribute
 */
export declare const setAttribute: (element: Element, key: string, value: string | null) => void;
