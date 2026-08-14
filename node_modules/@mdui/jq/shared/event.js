import { getWindow } from 'ssr-window';
import { $ } from '../$.js';
import { contains } from '../functions/contains.js';
import '../methods/find.js';
import '../methods/get.js';
import { isObjectLike } from './helper.js';
// 直接使用 CustomEvent 在 ssr 环境下会报错
const CustomEvent = getWindow().CustomEvent;
/**
 * 封装 CustomEvent，使之支持 data:事件监听参数，namespace:命名空间
 */
export class MduiCustomEvent extends CustomEvent {
    constructor(type, options) {
        super(type, options);
        this.data = options.data;
        this.namespace = options.namespace;
    }
}
const elementIdMap = new WeakMap();
let elementId = 1;
/**
 * 为元素赋予一个唯一的ID
 */
const getElementId = (element) => {
    if (!elementIdMap.has(element)) {
        elementIdMap.set(element, ++elementId);
    }
    return elementIdMap.get(element);
};
// 存储唯一ID及事件处理
const handlersMap = new Map();
/**
 * 获取元素上的事件处理器数组
 * @param element
 */
const getHandlers = (element) => {
    const id = getElementId(element);
    return handlersMap.get(id) || handlersMap.set(id, []).get(id);
};
/**
 * 解析事件名中的命名空间
 */
export const parse = (type) => {
    const parts = type.split('.');
    return {
        type: parts[0],
        namespace: parts.slice(1).sort().join(' '),
    };
};
/**
 * 命名空间匹配规则
 */
const matcherFor = (namespace) => {
    return new RegExp('(?:^| )' + namespace.replace(' ', ' .* ?') + '(?: |$)');
};
/**
 * 获取匹配的事件
 * @param element
 * @param type
 * @param func
 * @param selector
 */
const getMatchedHandlers = (element, type, func, selector) => {
    const event = parse(type);
    return getHandlers(element).filter((handler) => {
        return (handler &&
            (!event.type || handler.type === event.type) &&
            (!event.namespace ||
                matcherFor(event.namespace).test(handler.namespace)) &&
            (!func || getElementId(handler.func) === getElementId(func)) &&
            (!selector || handler.selector === selector));
    });
};
/**
 * 添加事件监听
 * @param element
 * @param types
 * @param func
 * @param data
 * @param selector
 */
export const add = (element, types, func, data, selector) => {
    // 传入 data.useCapture 来设置 useCapture: true
    let useCapture = false;
    if (isObjectLike(data) && data.useCapture) {
        useCapture = true;
    }
    types.split(' ').forEach((type) => {
        if (!type) {
            return;
        }
        const event = parse(type);
        const callFn = (e, elem) => {
            const result = func.apply(elem, 
            // @ts-ignore
            e.detail === null ? [e] : [e].concat(e.detail));
            if (result === false) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        const proxyFn = (e) => {
            if (e.namespace && !matcherFor(e.namespace).test(event.namespace)) {
                return;
            }
            e.data = data;
            if (selector) {
                // 事件代理
                $(element)
                    .find(selector)
                    .get()
                    .reverse()
                    .forEach((elem) => {
                    if (elem === e.target || contains(elem, e.target)) {
                        callFn(e, elem);
                    }
                });
            }
            else {
                // 不使用事件代理
                callFn(e, element);
            }
        };
        const handler = {
            type: event.type,
            namespace: event.namespace,
            func,
            selector,
            id: getHandlers(element).length,
            proxy: proxyFn,
        };
        getHandlers(element).push(handler);
        // @ts-ignore
        element.addEventListener(handler.type, proxyFn, useCapture);
    });
};
/**
 * 移除事件监听
 * @param element
 * @param types
 * @param func
 * @param selector
 */
export const remove = (element, types, func, selector) => {
    const handlersInElement = getHandlers(element);
    const removeEvent = (handler) => {
        delete handlersInElement[handler.id];
        // @ts-ignore
        element.removeEventListener(handler.type, handler.proxy, false);
    };
    if (!types) {
        handlersInElement.forEach((handler) => {
            removeEvent(handler);
        });
    }
    else {
        types.split(' ').forEach((type) => {
            if (type) {
                getMatchedHandlers(element, type, func, selector).forEach((handler) => {
                    removeEvent(handler);
                });
            }
        });
    }
};
