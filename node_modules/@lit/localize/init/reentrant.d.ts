/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import type { LocaleModule } from '../internal/types.js';
/**
 * Configuration parameters for lit-localize when in reentrant mode.
 */
export interface ReentrantConfiguration {
    /**
     * Required locale code in which source templates in this project are written,
     * and the active locale.
     */
    sourceLocale: string;
    /**
     * Required locale codes that are supported by this project. Should not
     * include the `sourceLocale` code.
     */
    targetLocales: string[];
    /**
     * Required function that determines the currently active locale, called
     * before every msg() call.
     */
    getLocale: () => string;
    /**
     * Required function that synchronously returns the localized templates for
     * the given locale code.
     *
     * This function will only ever be called with a `locale` that is contained by
     * `targetLocales`.
     */
    loadLocaleSync: (locale: string) => LocaleModule | undefined;
}
/**
 * Set configuration parameters for lit-localize when in reentrant mode.
 *
 * Throws if called more than once.
 */
export declare const configureReentrantLocalization: ((config: ReentrantConfiguration) => {}) & {
    _LIT_LOCALIZE_CONFIGURE_LOCALIZATION_?: never;
};
//# sourceMappingURL=reentrant.d.ts.map