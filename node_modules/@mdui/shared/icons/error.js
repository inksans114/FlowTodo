import { __decorate } from "tslib";
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { style } from './shared/style.js';
import { svgTag } from './shared/svg-tag.js';
let IconError = class IconError extends LitElement {
    render() {
        return svgTag('<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>');
    }
};
IconError.styles = style;
IconError = __decorate([
    customElement('mdui-icon-error')
], IconError);
export { IconError };
