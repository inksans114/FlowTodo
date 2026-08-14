import '@mdui/jq/methods/css.js';
import { DefinedController } from '../controllers/defined.js';
import type { Constructor } from '@lit/reactive-element/decorators/base.js';
import type { JQ } from '@mdui/jq/shared/core.js';
import type { LitElement } from 'lit';
type ScrollBehavior = 'hide' | 'shrink' | 'elevate';
export type ScrollPaddingPosition = 'top' | 'bottom';
export declare class ScrollBehaviorMixinInterface {
    scrollTarget?: string | HTMLElement | JQ<HTMLElement>;
    scrollBehavior?: ScrollBehavior;
    scrollThreshold?: number;
    protected scrollBehaviorDefinedController: DefinedController;
    protected setContainerPadding(action: 'add' | 'update' | 'remove', scrollTarget?: string | HTMLElement | JQ<HTMLElement>): void;
    protected hasScrollBehavior(behavior: ScrollBehavior | ScrollBehavior[]): boolean;
}
/**
 * 滚动行为
 *
 * 父类需要实现
 * @property() public scrollBehavior
 * protected runScrollThreshold(isScrollingUp: boolean, scrollTop: number): void;
 * protected runScrollNoThreshold(isScrollingUp: boolean, scrollTop: number): void;
 * protected get scrollPaddingPosition(): ScrollPaddingPosition
 */
export declare const ScrollBehaviorMixin: <T extends Constructor<LitElement>>(superclass: T) => Constructor<ScrollBehaviorMixinInterface> & T;
export {};
