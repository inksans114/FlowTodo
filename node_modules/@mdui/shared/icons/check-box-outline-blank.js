import { __decorate } from "tslib";
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { style } from './shared/style.js';
import { svgTag } from './shared/svg-tag.js';
let IconCheckBoxOutlineBlank = class IconCheckBoxOutlineBlank extends LitElement {
    render() {
        return svgTag('<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>');
    }
};
IconCheckBoxOutlineBlank.styles = style;
IconCheckBoxOutlineBlank = __decorate([
    customElement('mdui-icon-check-box-outline-blank')
], IconCheckBoxOutlineBlank);
export { IconCheckBoxOutlineBlank };
