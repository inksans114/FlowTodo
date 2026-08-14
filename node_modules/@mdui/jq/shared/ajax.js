import { getWindow } from 'ssr-window';
import { extend } from '../functions/extend.js';
import { eachObject, isUndefined } from './helper.js';
// 全局事件名
export const ajaxStart = 'ajaxStart';
export const ajaxSuccess = 'ajaxSuccess';
export const ajaxError = 'ajaxError';
export const ajaxComplete = 'ajaxComplete';
// 全局配置参数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalOptions = {};
/**
 * 判断此请求方法是否通过查询字符串提交参数
 * @param method 请求方法，大写
 */
export const isQueryStringData = (method) => {
    return ['GET', 'HEAD'].includes(method);
};
/**
 * 添加参数到 URL 上，且 URL 中不存在 ? 时，自动把第一个 & 替换为 ?
 * @param url
 * @param query
 */
export const appendQuery = (url, query) => {
    return `${url}&${query}`.replace(/[&?]{1,2}/, '?');
};
/**
 * url 是否跨域
 * @param url
 */
export const isCrossDomain = (url) => {
    const window = getWindow();
    return (/^([\w-]+:)?\/\/([^/]+)/.test(url) && RegExp.$2 !== window.location.host);
};
/**
 * HTTP 状态码是否表示请求成功
 * @param status
 */
export const isHttpStatusSuccess = (status) => {
    return (status >= 200 && status < 300) || [0, 304].includes(status);
};
/**
 * 合并请求参数，参数优先级：options > globalOptions > defaults
 * @param options
 */
export const mergeOptions = (options) => {
    // 默认参数
    const defaults = {
        url: '',
        method: 'GET',
        data: '',
        processData: true,
        async: true,
        cache: true,
        username: '',
        password: '',
        headers: {},
        xhrFields: {},
        statusCode: {},
        dataType: '',
        contentType: 'application/x-www-form-urlencoded',
        timeout: 0,
        global: true,
    };
    // globalOptions 中的回调函数不合并
    eachObject(globalOptions, (key, value) => {
        const callbacks = [
            'beforeSend',
            'success',
            'error',
            'complete',
            'statusCode',
        ];
        if (!callbacks.includes(key) && !isUndefined(value)) {
            defaults[key] = value;
        }
    });
    return extend({}, defaults, options);
};
