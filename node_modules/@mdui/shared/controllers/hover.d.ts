import '@mdui/jq/methods/off.js';
import '@mdui/jq/methods/on.js';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
/**
 * 检查当前鼠标是否放在指定元素上，及进入、离开元素执行对于的回调
 */
export declare class HoverController implements ReactiveController {
    /**
     * 当前鼠标是否放在元素上
     */
    isHover: boolean;
    private readonly host;
    private readonly elementRef;
    private readonly uniqueID;
    private readonly enterEventName;
    private readonly leaveEventName;
    private mouseEnterItems;
    private mouseLeaveItems;
    /**
     * @param host
     * @param elementRef 检查鼠标是否放在该元素上
     */
    constructor(host: ReactiveControllerHost & Element, elementRef: Ref<HTMLElement>);
    hostConnected(): void;
    hostDisconnected(): void;
    /**
     * 指定鼠标移入时的回调函数
     * @param callback 要执行的回调函数
     * @param one 是否仅执行一次
     */
    onMouseEnter(callback: () => void, one?: boolean): void;
    /**
     * 指定鼠标移出时的回调函数
     * @param callback 要执行的回调函数
     * @param one 是否仅执行一次
     */
    onMouseLeave(callback: () => void, one?: boolean): void;
}
