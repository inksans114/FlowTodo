import { get, set, getAll, setAll } from '../shared/data.js';
import { isUndefined, isObjectLike } from '../shared/helper.js';
export function data(element, key, value) {
    // 根据键值对设置值
    // data(element, { 'key' : 'value' })
    if (isObjectLike(key)) {
        setAll(element, key);
        return key;
    }
    // 根据 key、value 设置值
    // data(element, 'key', 'value')
    if (!isUndefined(value)) {
        set(element, key, value);
        return value;
    }
    // 获取所有值
    // data(element)
    if (isUndefined(key)) {
        return getAll(element);
    }
    // 获取指定值
    // data(element, 'key')
    return get(element, key);
}
