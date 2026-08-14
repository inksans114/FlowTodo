import { $ } from '@mdui/jq/$.js';
import '@mdui/jq/methods/css.js';
/**
 * 获取由 CSS 变量定义的缓动曲线值
 * @param element 在指定元素上获取值；若需要获取全局值，则传入 document.body
 * @param name 缓动曲线名称
 */
export const getEasing = (element, name) => {
    const cssVariableName = `--mdui-motion-easing-${name}`;
    return $(element).css(cssVariableName).trim();
};
/**
 * 获取由 CSS 变量定义的动画持续时间
 * @param element 在指定元素上获取值；若需要获取全局值，则传入 document.body
 * @param name 持续时间名称
 */
export const getDuration = (element, name) => {
    const cssVariableName = `--mdui-motion-duration-${name}`;
    const cssValue = $(element).css(cssVariableName).trim().toLowerCase();
    if (cssValue.endsWith('ms')) {
        return parseFloat(cssValue);
    }
    else {
        return parseFloat(cssValue) * 1000;
    }
};
