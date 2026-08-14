import { __decorate } from "tslib";
import { property } from 'lit/decorators.js';
import { getDocument } from 'ssr-window';
import { $ } from '@mdui/jq/$.js';
import '@mdui/jq/methods/attr.js';
import '@mdui/jq/methods/css.js';
import '@mdui/jq/methods/each.js';
import '@mdui/jq/methods/removeAttr.js';
import { DefinedController } from '../controllers/defined.js';
import { booleanConverter } from '../helpers/decorator.js';
let isClick = true;
const document = getDocument();
document.addEventListener('pointerdown', () => {
    isClick = true;
});
document.addEventListener('keydown', () => {
    isClick = false;
});
/**
 * 参考：https://github.com/adobe/spectrum-web-components/blob/main/tools/shared/src/focusable.ts
 */
export const FocusableMixin = (superclass) => {
    class FocusableMixinClass extends superclass {
        constructor() {
            super(...arguments);
            /**
             * 是否在页面加载完成后自动获取焦点
             */
            this.autofocus = false;
            /**
             * 是否获得了焦点，不管是鼠标点击，还是键盘切换获得的焦点，都会添加该属性
             * 添加到 :host 元素上，供 CSS 选择器添加样式
             */
            this.focused = false;
            /**
             * 是否通过键盘切换获得了焦点
             * 添加到 :host 元素上，供 CSS 选择器添加样式
             */
            this.focusVisible = false;
            this.focusableDefinedController = new DefinedController(this, { relatedElements: [''] });
            this._manipulatingTabindex = false;
            this._tabIndex = 0;
        }
        /**
         * 元素在使用 Tab 键切换焦点时的顺序
         */
        get tabIndex() {
            const $this = $(this);
            if (this.focusElement === this) {
                return Number($this.attr('tabindex') || -1);
            }
            const tabIndexAttribute = Number($this.attr('tabindex') || 0);
            if (this.focusDisabled || tabIndexAttribute < 0) {
                return -1;
            }
            if (!this.focusElement) {
                return tabIndexAttribute;
            }
            return this.focusElement.tabIndex;
        }
        set tabIndex(tabIndex) {
            if (this._manipulatingTabindex) {
                this._manipulatingTabindex = false;
                return;
            }
            const $this = $(this);
            if (this.focusElement === this) {
                if (tabIndex !== null) {
                    this._tabIndex = tabIndex;
                }
                $this.attr('tabindex', this.focusDisabled ? null : tabIndex);
                return;
            }
            const onPointerDown = () => {
                if (this.tabIndex === -1) {
                    this.tabIndex = 0;
                    this.focus({ preventScroll: true });
                }
            };
            if (tabIndex === -1) {
                this.addEventListener('pointerdown', onPointerDown);
            }
            else {
                this._manipulatingTabindex = true;
                this.removeEventListener('pointerdown', onPointerDown);
            }
            if (tabIndex === -1 || this.focusDisabled) {
                $this.attr('tabindex', -1);
                if (tabIndex !== -1) {
                    this.manageFocusElementTabindex(tabIndex);
                }
                return;
            }
            if (!this.hasAttribute('tabindex')) {
                this._manipulatingTabindex = false;
            }
            this.manageFocusElementTabindex(tabIndex);
        }
        /**
         * 父类要实现该属性，表示是否禁用 focus 状态
         */
        get focusDisabled() {
            throw new Error('Must implement focusDisabled getter!');
        }
        /**
         * 最终获得焦点的元素
         */
        get focusElement() {
            throw new Error('Must implement focusElement getter!');
        }
        connectedCallback() {
            super.connectedCallback();
            this.updateComplete.then(() => {
                requestAnimationFrame(() => {
                    this.manageAutoFocus();
                });
            });
        }
        /**
         * 模拟鼠标点击元素
         */
        click() {
            if (this.focusDisabled) {
                return;
            }
            if (this.focusElement !== this) {
                this.focusElement.click();
            }
            else {
                HTMLElement.prototype.click.apply(this);
            }
        }
        /**
         * 将焦点设置到当前元素。
         *
         * 可以传入一个对象作为参数，该对象的属性包括：
         *
         * * `preventScroll`：默认情况下，元素获取焦点后，页面会滚动以将该元素滚动到视图中。如果不希望页面滚动，可以将此属性设置为 `true`。
         */
        focus(options) {
            if (this.focusDisabled || !this.focusElement) {
                return;
            }
            if (this.focusElement !== this) {
                this.focusElement.focus(options);
            }
            else {
                HTMLElement.prototype.focus.apply(this, [options]);
            }
        }
        /**
         * 移除当前元素的焦点
         */
        blur() {
            if (this.focusElement !== this) {
                this.focusElement.blur();
            }
            else {
                HTMLElement.prototype.blur.apply(this);
            }
        }
        firstUpdated(changedProperties) {
            super.firstUpdated(changedProperties);
            this.focusElement.addEventListener('focus', () => {
                this.focused = true;
                this.focusVisible = !isClick;
            });
            this.focusElement.addEventListener('blur', () => {
                this.focused = false;
                this.focusVisible = false;
            });
        }
        update(changedProperties) {
            if (this._lastFocusDisabled === undefined ||
                this._lastFocusDisabled !== this.focusDisabled) {
                this._lastFocusDisabled = this.focusDisabled;
                const $this = $(this);
                if (this.focusDisabled) {
                    $this.removeAttr('tabindex');
                }
                else {
                    if (this.focusElement === this) {
                        this._manipulatingTabindex = true;
                        $this.attr('tabindex', this._tabIndex);
                    }
                    else if (this.tabIndex > -1) {
                        $this.removeAttr('tabindex');
                    }
                }
            }
            super.update(changedProperties);
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            if (this.focused && this.focusDisabled) {
                this.blur();
            }
        }
        async manageFocusElementTabindex(tabIndex) {
            if (!this.focusElement) {
                await this.updateComplete;
            }
            if (tabIndex === null) {
                this.focusElement.removeAttribute('tabindex');
            }
            else {
                this.focusElement.tabIndex = tabIndex;
            }
        }
        manageAutoFocus() {
            if (this.autofocus) {
                this.dispatchEvent(new KeyboardEvent('keydown', {
                    code: 'Tab',
                }));
                this.focusElement.focus();
            }
        }
    }
    __decorate([
        property({
            type: Boolean,
            /**
             * 哪些属性需要 reflect: true？
             * 一般所有属性都需要 reflect，但以下情况除外：
             * 1. 会频繁变更的属性
             * 2. 属性同步会造成较大性能开销的属性
             * 3. 复杂类型属性（数组、对象等，仅提供 property，不提供 attribute）
             */
            reflect: true,
            converter: booleanConverter,
        })
    ], FocusableMixinClass.prototype, "autofocus", void 0);
    __decorate([
        property({
            type: Boolean,
            reflect: true,
            converter: booleanConverter,
        })
    ], FocusableMixinClass.prototype, "focused", void 0);
    __decorate([
        property({
            type: Boolean,
            reflect: true,
            converter: booleanConverter,
            attribute: 'focus-visible',
        })
    ], FocusableMixinClass.prototype, "focusVisible", void 0);
    __decorate([
        property({ type: Number, attribute: 'tabindex' })
    ], FocusableMixinClass.prototype, "tabIndex", null);
    return FocusableMixinClass;
};
