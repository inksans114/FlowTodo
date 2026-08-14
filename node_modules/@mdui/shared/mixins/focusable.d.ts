import '@mdui/jq/methods/attr.js';
import '@mdui/jq/methods/css.js';
import '@mdui/jq/methods/each.js';
import '@mdui/jq/methods/removeAttr.js';
import type { Constructor } from '@lit/reactive-element/decorators/base.js';
import type { LitElement } from 'lit';
export declare class FocusableMixinInterface {
    autofocus: boolean;
    tabIndex: number;
    protected get focusDisabled(): boolean;
    protected get focusElement(): HTMLElement | null | undefined;
    focus(options?: FocusOptions): void;
    blur(): void;
    click(): void;
}
/**
 * 参考：https://github.com/adobe/spectrum-web-components/blob/main/tools/shared/src/focusable.ts
 */
export declare const FocusableMixin: <T extends Constructor<LitElement>>(superclass: T) => Constructor<FocusableMixinInterface> & T;
