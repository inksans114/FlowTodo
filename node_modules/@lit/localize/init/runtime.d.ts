/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import type { LocaleModule } from '../internal/types.js';
/**
 * Configuration parameters for lit-localize when in runtime mode.
 */
export interface RuntimeConfiguration {
    /**
     * Required locale code in which source templates in this project are written,
     * and the initial active locale.
     */
    sourceLocale: string;
    /**
     * Required locale codes that are supported by this project. Should not
     * include the `sourceLocale` code.
     */
    targetLocales: Iterable<string>;
    /**
     * Required function that returns the localized templates for the given locale
     * code.
     *
     * This function will only ever be called with a `locale` that is contained by
     * `targetLocales`.
     */
    loadLocale: (locale: string) => Promise<LocaleModule>;
}
/**
 * Set configuration parameters for lit-localize when in runtime mode. Returns
 * an object with functions:
 *
 * - `getLocale`: Return the active locale code.
 * - `setLocale`: Set the active locale code.
 *
 * Throws if called more than once.
 */
export declare const configureLocalization: ((config: RuntimeConfiguration) => {
    getLocale: typeof getLocale;
    setLocale: typeof setLocale;
}) & {
    _LIT_LOCALIZE_CONFIGURE_LOCALIZATION_?: never;
};
/**
 * Return the active locale code.
 */
declare const getLocale: (() => string) & {
    _LIT_LOCALIZE_GET_LOCALE_?: never;
};
/**
 * Set the active locale code, and begin loading templates for that locale using
 * the `loadLocale` function that was passed to `configureLocalization`. Returns
 * a promise that resolves when the next locale is ready to be rendered.
 *
 * Note that if a second call to `setLocale` is made while the first requested
 * locale is still loading, then the second call takes precedence, and the
 * promise returned from the first call will resolve when second locale is
 * ready. If you need to know whether a particular locale was loaded, check
 * `getLocale` after the promise resolves.
 *
 * Throws if the given locale is not contained by the configured `sourceLocale`
 * or `targetLocales`.
 */
declare const setLocale: ((newLocale: string) => Promise<void>) & {
    _LIT_LOCALIZE_SET_LOCALE_?: never;
};
export {};
//# sourceMappingURL=runtime.d.ts.map