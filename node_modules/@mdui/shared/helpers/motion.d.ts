import '@mdui/jq/methods/css.js';
/**
 * 获取由 CSS 变量定义的缓动曲线值
 * @param element 在指定元素上获取值；若需要获取全局值，则传入 document.body
 * @param name 缓动曲线名称
 */
export declare const getEasing: (element: HTMLElement, name: "linear" | "standard" | "standard-accelerate" | "standard-decelerate" | "emphasized" | "emphasized-accelerate" | "emphasized-decelerate") => string;
/**
 * 获取由 CSS 变量定义的动画持续时间
 * @param element 在指定元素上获取值；若需要获取全局值，则传入 document.body
 * @param name 持续时间名称
 */
export declare const getDuration: (element: HTMLElement, name: "short1" | "short2" | "short3" | "short4" | "medium1" | "medium2" | "medium3" | "medium4" | "long1" | "long2" | "long3" | "long4" | "extra-long1" | "extra-long2" | "extra-long3" | "extra-long4") => number;
