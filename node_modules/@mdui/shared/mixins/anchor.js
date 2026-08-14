import { __decorate } from "tslib";
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
export const AnchorMixin = (superclass) => {
    class AnchorMixinClass extends superclass {
        renderAnchor({ id, className, part, content = html `<slot></slot>`, refDirective, tabIndex, }) {
            return html `<a ${refDirective} id="${ifDefined(id)}" class="_a ${className ? className : ''}" part="${ifDefined(part)}" href="${ifDefined(this.href)}" download="${ifDefined(this.download)}" target="${ifDefined(this.target)}" rel="${ifDefined(this.rel)}" tabindex="${ifDefined(tabIndex)}">${content}</a>`;
        }
    }
    __decorate([
        property({ reflect: true })
    ], AnchorMixinClass.prototype, "href", void 0);
    __decorate([
        property({ reflect: true })
    ], AnchorMixinClass.prototype, "download", void 0);
    __decorate([
        property({ reflect: true })
    ], AnchorMixinClass.prototype, "target", void 0);
    __decorate([
        property({ reflect: true })
    ], AnchorMixinClass.prototype, "rel", void 0);
    return AnchorMixinClass;
};
