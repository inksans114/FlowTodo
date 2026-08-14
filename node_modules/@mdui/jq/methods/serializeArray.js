import { $ } from '../$.js';
import { getFormControls } from '../shared/form.js';
import './each.js';
import './val.js';
/**
 * 表单控件的 name、value 组成的数组。其中 value 为原始值
 */
export const getFormControlsValue = ($elements) => {
    const result = [];
    $elements.each((_, element) => {
        const elements = (element instanceof HTMLFormElement ? getFormControls(element) : [element]);
        $(elements).each((_, element) => {
            const $element = $(element);
            const type = element.type;
            const nodeName = element.nodeName.toLowerCase();
            if (nodeName !== 'fieldset' &&
                element.name &&
                !element.disabled &&
                [
                    'input',
                    'select',
                    'textarea',
                    'keygen',
                    'mdui-checkbox',
                    'mdui-radio-group',
                    'mdui-switch',
                    'mdui-text-field',
                    'mdui-select',
                    'mdui-slider',
                    'mdui-range-slider',
                    'mdui-segmented-button-group',
                ].includes(nodeName) &&
                !['submit', 'button', 'image', 'reset', 'file'].includes(type) &&
                (!['radio', 'checkbox'].includes(type) || element.checked) &&
                (!['mdui-checkbox', 'mdui-switch'].includes(nodeName) ||
                    element.checked)) {
                result.push({
                    name: element.name,
                    value: $element.val(),
                });
            }
        });
    });
    return result;
};
/**
 * 将表单元素的值组合成键值对数组
 *
 * 包含哪些表单元素，参考：https://www.w3.org/TR/html401/interact/forms.html#h-17.13.2
 * 其中不包含 type="submit"，因为表单不是通过点击按钮提交的
 *
 * @returns {Array}
 */
$.fn.serializeArray = function () {
    return getFormControlsValue(this)
        .map((element) => {
        if (!Array.isArray(element.value)) {
            return element;
        }
        return element.value.map((value) => ({
            name: element.name,
            value,
        }));
    })
        .flat();
};
