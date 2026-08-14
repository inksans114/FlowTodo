import '../methods/find.js';
import '../methods/get.js';
declare const CustomEvent: {
    new <T>(type: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>;
    prototype: CustomEvent;
};
interface MduiCustomEventInit<TData> extends CustomEventInit {
    /**
     * 事件监听参数
     */
    data: TData;
    /**
     * 命名空间
     */
    namespace: string;
}
/**
 * 封装 CustomEvent，使之支持 data:事件监听参数，namespace:命名空间
 */
export declare class MduiCustomEvent<TData = unknown> extends CustomEvent<unknown> {
    /**
     * 事件监听参数
     */
    data: TData;
    /**
     * 命名空间
     */
    namespace: string;
    constructor(type: string, options: MduiCustomEventInit<TData>);
}
export type EventCallback<TData = unknown, TElement = Element | Document | Window> = (this: TElement, event: MduiCustomEvent<TData>, data?: any, ...dataN: any[]) => void | false;
/**
 * 解析事件名中的命名空间
 */
export declare const parse: (type: string) => {
    type: string;
    namespace: string;
};
/**
 * 添加事件监听
 * @param element
 * @param types
 * @param func
 * @param data
 * @param selector
 */
export declare const add: (element: Element | Document | Window, types: string, func: EventCallback, data?: unknown, selector?: string) => void;
/**
 * 移除事件监听
 * @param element
 * @param types
 * @param func
 * @param selector
 */
export declare const remove: (element: Element | Document | Window, types?: string, func?: EventCallback, selector?: string) => void;
export {};
