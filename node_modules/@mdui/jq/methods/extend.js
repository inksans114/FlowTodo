import { $ } from '../$.js';
import { eachObject } from '../shared/helper.js';
$.fn.extend = function (obj) {
    eachObject(obj, (prop, value) => {
        // 在 JQ 对象上扩展方法时，需要自己添加 typescript 的类型定义
        $.fn[prop] = value;
    });
    return this;
};
