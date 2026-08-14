import type { ReactiveController, ReactiveControllerHost } from 'lit';
interface Options {
    /**
     * 是否在整个页面的 DOM 就绪后，才认为组件已定义完成
     *
     * 如果需要操作或读取组件外部、或组件 slot 中的原生 DOM 时，需要设置为 true
     */
    needDomReady?: boolean;
    /**
     * 是否在指定 Web Components 注册完成后，才认为组件定义完成。则 needDomReady 将默认为 true
     *
     * 若值为数组，则监听当前组件 slot 中的组件，如 ['mdui-segmented-button']
     * 若值为对象，则监听对象键名指定的组件，键值为 true，则监听整个页面的组件；否则监听 slot 中的组件
     *
     * 可以在数组中设置空字符串，或在对象中设置空字符串键名，来表示等待所有 Web Components 注册完成
     */
    relatedElements?: string[] | {
        [localName: string]: boolean;
    };
}
/**
 * 判断组件是否定义完成
 *
 * 如果需要在组件操作或读取组件外部、或组件 slot 中的原生 DOM 时，则需要在 DOM 就绪时，才能认为组件定义完成
 * 如果组件需要和其他组件配合使用，则需要等待其他组件定义完成后，才能认为组件定义完成
 */
export declare class DefinedController implements ReactiveController {
    private host;
    /**
     * 组件是否已定义完成
     */
    private defined;
    /**
     * 是否在 DOM 就绪后，才算组件定义完成
     */
    private readonly needDomReady?;
    /**
     * 在哪些相关组件定义完成后，才算组件定义完成
     */
    private readonly relatedElements?;
    constructor(host: ReactiveControllerHost & Element, options: Options);
    hostConnected(): void;
    hostDisconnected(): void;
    /**
     * 判断组件是否定义完成
     */
    isDefined(): boolean;
    /**
     * 在组件定义完成后，promise 被 resolve
     */
    whenDefined(): Promise<void>;
    /**
     * slot 中的未完成定义的相关 Web components 组件的 CSS 选择器
     */
    private getScopeLocalNameSelector;
    /**
     * 整个页面中的未完成定义的相关 Web components 组件的 CSS 选择器
     */
    private getGlobalLocalNameSelector;
    /**
     * 获取未完成定义的相关 Web components 组件名
     */
    private getUndefinedLocalNames;
    /**
     * slot 变更时，若 slot 中包含未完成定义的相关 Web components 组件，则组件未定义完成
     */
    private onSlotChange;
}
export {};
