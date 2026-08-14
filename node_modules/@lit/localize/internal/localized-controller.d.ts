/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import type { ReactiveControllerHost } from 'lit';
/**
 * Re-render the given LitElement whenever a new active locale has loaded.
 *
 * See also {@link localized} for the same functionality as a decorator.
 *
 * When using lit-localize in transform mode, calls to this function are
 * replaced with undefined.
 *
 * Usage:
 *
 *   import {LitElement, html} from 'lit';
 *   import {msg, updateWhenLocaleChanges} from '@lit/localize';
 *
 *   class MyElement extends LitElement {
 *     constructor() {
 *       super();
 *       updateWhenLocaleChanges(this);
 *     }
 *
 *     render() {
 *       return html`<b>${msg('Hello World')}</b>`;
 *     }
 *   }
 */
declare const _updateWhenLocaleChanges: (host: ReactiveControllerHost) => void;
export declare const updateWhenLocaleChanges: typeof _updateWhenLocaleChanges & {
    _LIT_LOCALIZE_CONTROLLER_FN_?: never;
};
export {};
//# sourceMappingURL=localized-controller.d.ts.map