import { __decorate } from "tslib";
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { style } from './shared/style.js';
import { svgTag } from './shared/svg-tag.js';
let IconArrowRight = class IconArrowRight extends LitElement {
    render() {
        return svgTag('<path d="m10 17 5-5-5-5v10z"/>');
    }
};
IconArrowRight.styles = style;
IconArrowRight = __decorate([
    customElement('mdui-icon-arrow-right')
], IconArrowRight);
export { IconArrowRight };
