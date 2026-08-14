/**
 * 获取元素的样式值
 * @param element
 * @param name
 */
export declare const getComputedStyleValue: (element: HTMLElement, name: string) => string;
/**
 * 检查元素的 box-sizing 是否是 border-box
 * @param element
 */
export declare const isBorderBox: (element: HTMLElement) => boolean;
/**
 * 获取元素的 padding, border, margin 宽度（两侧宽度的和，单位为px）
 * @param element
 * @param direction
 * @param extra
 */
export declare const getExtraWidth: (element: HTMLElement, direction: "width" | "height", extra: "padding" | "border" | "margin") => number;
/**
 * 获取元素的样式值，对 width 和 height 进行过处理
 * @param element
 * @param name
 */
export declare const getStyle: (element: HTMLElement, name: string) => string;
/**
 * 数值单位的 CSS 属性
 */
export declare const cssNumber: string[];
