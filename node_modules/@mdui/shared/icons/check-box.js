import { __decorate } from "tslib";
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { style } from './shared/style.js';
import { svgTag } from './shared/svg-tag.js';
let IconCheckBox = class IconCheckBox extends LitElement {
    render() {
        return svgTag('<path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>');
    }
};
IconCheckBox.styles = style;
IconCheckBox = __decorate([
    customElement('mdui-icon-check-box')
], IconCheckBox);
export { IconCheckBox };
