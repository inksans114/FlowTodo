/**
 * watch 装饰器。在 @property 或 @state 属性变更时，且在组件更新前触发
 * 若初始值为 undefined，则初始状态不会触发；否则初始状态就会先触发一次
 *
 * 如果要等属性变更后，且组件更新完成再执行，可以在函数中执行 `await this.updateComplete`
 * 如果要等组件首次渲染完后再监听属性，可以传入第二个参数 true。或者在函数中通过 `this.hasUpdated` 进行判断
 *
 * @watch('propName')
 * handlePropChange(oldValue, newValue) {
 *
 * }
 */
import type { LitElement } from 'lit';
/**
 * @param propName 监听的属性名
 * @param waitUntilFirstUpdate 是否等首次渲染完后再监听
 */
export declare function watch(propName: string, waitUntilFirstUpdate?: boolean): <T extends LitElement>(proto: T, functionName: string) => void;
