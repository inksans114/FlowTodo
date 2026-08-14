/**
 * defaultValue 装饰器。在 attribute 属性变更时，若值和 property 值不一致，则会保存新的 attribute 值
 *
 * 用于在调用表单的 reset() 方法时，还原成初始值
 *
 * @property({ reflect: true }) value = '';
 * @defaultValue() defaultValue = '';
 *
 * @property({ type: Boolean, reflect: true }) checked = false;
 * @defaultValue('checked') defaultChecked = false;
 */
import type { ReactiveElement } from 'lit';
/**
 * @param propertyName 对应的属性名
 */
export declare function defaultValue(propertyName?: string): (proto: ReactiveElement, key: string) => void;
