/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { updateWhenLocaleChanges } from './localized-controller.js';
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
export const localized = () => (clazz, _context) => {
    clazz.addInitializer(updateWhenLocaleChanges);
    return clazz;
};
//# sourceMappingURL=localized-decorator.js.map