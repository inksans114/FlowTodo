import { LitElement } from 'lit';
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class MduiElement extends LitElement {
    /**
     * 触发自定义事件。若返回 false，表示事件被取消
     * @param type
     * @param options 通常只用到 cancelable 和 detail；bubbles、composed 统一不用
     */
    emit(type, options) {
        const event = new CustomEvent(type, Object.assign({
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {},
        }, options));
        return this.dispatchEvent(event);
    }
}
