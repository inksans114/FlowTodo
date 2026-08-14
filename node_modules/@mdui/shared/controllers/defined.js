import { getDocument } from 'ssr-window';
import { unique } from '@mdui/jq/functions/unique.js';
import { isDomReady } from '@mdui/jq/shared/dom.js';
/**
 * 判断组件是否定义完成
 *
 * 如果需要在组件操作或读取组件外部、或组件 slot 中的原生 DOM 时，则需要在 DOM 就绪时，才能认为组件定义完成
 * 如果组件需要和其他组件配合使用，则需要等待其他组件定义完成后，才能认为组件定义完成
 */
export class DefinedController {
    constructor(host, options) {
        /**
         * 组件是否已定义完成
         */
        this.defined = false;
        (this.host = host).addController(this);
        this.relatedElements = options.relatedElements;
        this.needDomReady = options.needDomReady || !!options.relatedElements;
        this.onSlotChange = this.onSlotChange.bind(this);
    }
    hostConnected() {
        this.host.shadowRoot.addEventListener('slotchange', this.onSlotChange);
    }
    hostDisconnected() {
        this.host.shadowRoot.removeEventListener('slotchange', this.onSlotChange);
    }
    /**
     * 判断组件是否定义完成
     */
    isDefined() {
        if (this.defined) {
            return true;
        }
        this.defined =
            (!this.needDomReady || isDomReady()) &&
                !this.getUndefinedLocalNames().length;
        return this.defined;
    }
    /**
     * 在组件定义完成后，promise 被 resolve
     */
    async whenDefined() {
        if (this.defined) {
            return Promise.resolve();
        }
        const document = getDocument();
        if (this.needDomReady && !isDomReady(document)) {
            await new Promise((resolve) => {
                document.addEventListener('DOMContentLoaded', () => resolve(), {
                    once: true,
                });
            });
        }
        const undefinedLocalNames = this.getUndefinedLocalNames();
        if (undefinedLocalNames.length) {
            const promises = [];
            undefinedLocalNames.forEach((localName) => {
                promises.push(customElements.whenDefined(localName));
            });
            await Promise.all(promises);
        }
        this.defined = true;
        return;
    }
    /**
     * slot 中的未完成定义的相关 Web components 组件的 CSS 选择器
     */
    getScopeLocalNameSelector() {
        const localNames = this.relatedElements;
        if (!localNames) {
            return null;
        }
        if (Array.isArray(localNames)) {
            return localNames
                .map((localName) => `${localName}:not(:defined)`)
                .join(',');
        }
        return Object.keys(localNames)
            .filter((localName) => !localNames[localName])
            .map((localName) => `${localName}:not(:defined)`)
            .join(',');
    }
    /**
     * 整个页面中的未完成定义的相关 Web components 组件的 CSS 选择器
     */
    getGlobalLocalNameSelector() {
        const localNames = this.relatedElements;
        if (!localNames || Array.isArray(localNames)) {
            return null;
        }
        return Object.keys(localNames)
            .filter((localName) => localNames[localName])
            .map((localName) => `${localName}:not(:defined)`)
            .join(',');
    }
    /**
     * 获取未完成定义的相关 Web components 组件名
     */
    getUndefinedLocalNames() {
        const scopeSelector = this.getScopeLocalNameSelector();
        const globalSelector = this.getGlobalLocalNameSelector();
        const undefinedScopeElements = scopeSelector
            ? [...this.host.querySelectorAll(scopeSelector)]
            : [];
        const undefinedGlobalElements = globalSelector
            ? [...getDocument().querySelectorAll(globalSelector)]
            : [];
        const localNames = [
            ...undefinedScopeElements,
            ...undefinedGlobalElements,
        ].map((element) => element.localName);
        return unique(localNames);
    }
    /**
     * slot 变更时，若 slot 中包含未完成定义的相关 Web components 组件，则组件未定义完成
     */
    onSlotChange() {
        const selector = this.getScopeLocalNameSelector();
        if (selector) {
            const undefinedElements = this.host.querySelectorAll(selector);
            if (undefinedElements.length) {
                this.defined = false;
            }
        }
    }
}
