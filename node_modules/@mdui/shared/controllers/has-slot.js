import { $ } from '@mdui/jq/$.js';
import { isDomReady } from '@mdui/jq/shared/dom.js';
/**
 * 检查指定的 slot 是否存在
 */
export class HasSlotController {
    constructor(host, ...slotNames) {
        this.slotNames = [];
        (this.host = host).addController(this);
        this.slotNames = slotNames;
        this.onSlotChange = this.onSlotChange.bind(this);
    }
    hostConnected() {
        this.host.shadowRoot.addEventListener('slotchange', this.onSlotChange);
        if (!isDomReady()) {
            $(() => {
                this.host.requestUpdate();
            });
        }
    }
    hostDisconnected() {
        this.host.shadowRoot.removeEventListener('slotchange', this.onSlotChange);
    }
    test(slotName) {
        return slotName === '[default]'
            ? this.hasDefaultSlot()
            : this.hasNamedSlot(slotName);
    }
    hasDefaultSlot() {
        return [...this.host.childNodes].some((node) => {
            if (node.nodeType === node.TEXT_NODE && node.textContent.trim() !== '') {
                return true;
            }
            if (node.nodeType === node.ELEMENT_NODE) {
                const el = node;
                if (!el.hasAttribute('slot')) {
                    return true;
                }
            }
            return false;
        });
    }
    hasNamedSlot(name) {
        return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
    }
    onSlotChange(event) {
        const slot = event.target;
        if ((this.slotNames.includes('[default]') && !slot.name) ||
            (slot.name && this.slotNames.includes(slot.name))) {
            this.host.requestUpdate();
        }
    }
}
