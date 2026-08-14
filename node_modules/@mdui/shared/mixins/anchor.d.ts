import { nothing } from 'lit';
import type { Constructor } from '@lit/reactive-element/decorators/base.js';
import type { LitElement, TemplateResult } from 'lit';
import type { DirectiveResult } from 'lit/directive.js';
import type { RefDirective } from 'lit/directives/ref.js';
type RenderAnchorOptions = {
    id?: string;
    className?: string;
    part?: string;
    content?: TemplateResult | typeof nothing | (TemplateResult | typeof nothing)[];
    tabIndex?: number;
    refDirective?: DirectiveResult<typeof RefDirective>;
};
export declare class AnchorMixinInterface {
    href?: string;
    download?: string;
    target?: '_blank' | '_parent' | '_self' | '_top';
    rel?: 'alternate' | 'author' | 'bookmark' | 'external' | 'help' | 'license' | 'me' | 'next' | 'nofollow' | 'noreferrer' | 'opener' | 'prev' | 'search' | 'tag';
    protected renderAnchor(options: RenderAnchorOptions): TemplateResult;
}
export declare const AnchorMixin: <T extends Constructor<LitElement>>(superclass: T) => Constructor<AnchorMixinInterface> & T;
export {};
