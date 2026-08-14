import { getDocument } from 'ssr-window';
/**
 * DOM 是否已加载完成
 *
 * 在 Web Components 中操作组件外部的 DOM、或组件中的 slot 的 DOM 时，必须先判断 DOM 是否已加载完成。
 */
export const isDomReady = (document = getDocument()) => {
    return /complete|interactive/.test(document.readyState);
};
export const createElement = (tagName) => {
    const document = getDocument();
    return document.createElement(tagName);
};
export const appendChild = (element, child) => {
    return element.appendChild(child);
};
export const removeChild = (element) => {
    return element.parentNode ? element.parentNode.removeChild(element) : element;
};
/**
 * 获取子节点组成的数组
 * @param target
 * @param parent
 */
export const getChildNodesArray = (target, parent) => {
    const tempParent = createElement(parent);
    tempParent.innerHTML = target;
    return [].slice.call(tempParent.childNodes);
};
