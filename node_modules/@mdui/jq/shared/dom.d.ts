/**
 * DOM 是否已加载完成
 *
 * 在 Web Components 中操作组件外部的 DOM、或组件中的 slot 的 DOM 时，必须先判断 DOM 是否已加载完成。
 */
export declare const isDomReady: (document?: Document) => boolean;
export declare const createElement: (tagName: string) => HTMLElement;
export declare const appendChild: <T extends Node>(element: Node, child: T) => T;
export declare const removeChild: <T extends Node>(element: T) => T;
/**
 * 获取子节点组成的数组
 * @param target
 * @param parent
 */
export declare const getChildNodesArray: (target: string, parent: string) => Array<Node>;
