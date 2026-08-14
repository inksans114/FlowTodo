import '@mdui/jq/methods/attr.js';
import '@mdui/jq/methods/css.js';
import type { FormControl, FormControlValue } from '@mdui/jq/shared/form.js';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
/**
 * 在执行表单的 reset() 方法后，使用该 WeakMap 存储指定表单中所有的表单控件
 * 在表单控件中监听值变更后，需要从该 WeakMap 中判断是否存在该表单控件，
 * 若存在，则 invalid 设置为 false（不显示验证不通过样式），同时从 WeakMap 中移除该表单控件
 */
export declare const formResets: WeakMap<HTMLFormElement, Set<FormControl>>;
export interface FormControllerOptions {
    form: (control: FormControl) => HTMLFormElement | null;
    name: (control: FormControl) => string;
    value: (control: FormControl) => FormControlValue | undefined;
    defaultValue: (control: FormControl) => FormControlValue;
    setValue: (control: FormControl, value: FormControlValue) => void;
    disabled: (control: FormControl) => boolean;
    reportValidity: (control: FormControl) => boolean;
}
export declare class FormController implements ReactiveController {
    private host;
    private form?;
    private options;
    private definedController;
    constructor(host: ReactiveControllerHost & FormControl, options?: Partial<FormControllerOptions>);
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdated(): void;
    /**
     * 获取当前表单控件关联的 `<form>` 元素
     */
    getForm(): HTMLFormElement | null;
    /**
     * 重置整个表单，所有表单控件恢复成默认值
     */
    reset(invoker?: HTMLElement & {
        name: string;
        value: string;
    }): void;
    /**
     * 提交整个表单
     */
    submit(invoker?: HTMLElement & {
        name: string;
        value: string;
    }): void;
    private attachForm;
    private detachForm;
    private doAction;
    private onFormData;
    private onFormSubmit;
    private onFormReset;
    private reportFormValidity;
}
