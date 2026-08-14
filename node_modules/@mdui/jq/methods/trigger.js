import { $ } from '../$.js';
import { parse, MduiCustomEvent } from '../shared/event.js';
import './each.js';
$.fn.trigger = function (name, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
detail = null, options) {
    const { type, namespace } = parse(name);
    const event = new MduiCustomEvent(type, {
        detail,
        data: null,
        namespace,
        bubbles: true,
        cancelable: false,
        composed: true,
        ...options,
    });
    return this.each((_, element) => {
        element.dispatchEvent(event);
    });
};
