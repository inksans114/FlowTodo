import { isUndefined } from '@mdui/jq/shared/helper.js';
const container = {};
export function queue(name, func) {
    if (isUndefined(container[name])) {
        container[name] = [];
    }
    if (isUndefined(func)) {
        return container[name];
    }
    container[name].push(func);
}
/**
 * 从队列中移除第一个函数，并执行该函数
 * @param name 队列名
 */
export function dequeue(name) {
    if (isUndefined(container[name])) {
        return;
    }
    if (!container[name].length) {
        return;
    }
    const func = container[name].shift();
    func();
}
