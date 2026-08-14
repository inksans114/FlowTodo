import { __decorate } from "tslib";
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { style } from './shared/style.js';
import { svgTag } from './shared/svg-tag.js';
let IconClear = class IconClear extends LitElement {
    render() {
        return svgTag('<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>');
    }
};
IconClear.styles = style;
IconClear = __decorate([
    customElement('mdui-icon-clear')
], IconClear);
export { IconClear };
