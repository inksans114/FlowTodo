import { __decorate } from "tslib";
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { style } from './shared/style.js';
import { svgTag } from './shared/svg-tag.js';
let IconCheck = class IconCheck extends LitElement {
    render() {
        return svgTag('<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>');
    }
};
IconCheck.styles = style;
IconCheck = __decorate([
    customElement('mdui-icon-check')
], IconCheck);
export { IconCheck };
