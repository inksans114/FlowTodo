import { __decorate } from "tslib";
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { style } from './shared/style.js';
import { svgTag } from './shared/svg-tag.js';
let IconIndeterminateCheckBox = class IconIndeterminateCheckBox extends LitElement {
    render() {
        return svgTag('<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>');
    }
};
IconIndeterminateCheckBox.styles = style;
IconIndeterminateCheckBox = __decorate([
    customElement('mdui-icon-indeterminate-check-box')
], IconIndeterminateCheckBox);
export { IconIndeterminateCheckBox };
