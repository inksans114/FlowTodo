/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import type { ReactiveControllerHost } from 'lit';
/**
 * Generates a public interface type that removes private and protected fields.
 * This allows accepting otherwise incompatible versions of the type (e.g. from
 * multiple copies of the same package in `node_modules`).
 */
export type Interface<T> = {
    [K in keyof T]: T[K];
};
type ReactiveElementClass = {
    addInitializer(initializer: (element: ReactiveControllerHost) => void): void;
    new (...args: any[]): ReactiveControllerHost;
};
export type LocalizedDecorator = {
    (cls: ReactiveElementClass): void;
    (target: ReactiveElementClass, context: ClassDecoratorContext<ReactiveElementClass>): void;
};
/**
 * Class decorator to enable re-rendering the given LitElement whenever a new
 * active locale has loaded.
 *
 * See also {@link updateWhenLocaleChanges} for the same functionality without
 * the use of decorators.
 *
 * When using lit-localize in transform mode, applications of this decorator are
 * removed.
 *
 * Usage:
 *
 *   import {LitElement, html} from 'lit';
 *   import {customElement} from 'lit/decorators.js';
 *   import {msg, localized} from '@lit/localize';
 *
 *   @localized()
 *   @customElement('my-element')
 *   class MyElement extends LitElement {
 *     render() {
 *       return html`<b>${msg('Hello World')}</b>`;
 *     }
 *   }
 */
export declare const localized: Localized;
type Localized = (() => LocalizedDecorator) & {
    _LIT_LOCALIZE_DECORATOR_?: never;
};
export {};
//# sourceMappingURL=localized-decorator.d.ts.map