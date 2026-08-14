/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Hct } from '../hct/hct.js';
import { TonalPalette } from '../palettes/tonal_palette.js';
import * as math from '../utils/math_utils.js';
import { MaterialDynamicColors } from './material_dynamic_colors.js';
/**
 * Constructed by a set of values representing the current UI state (such as
 * whether or not its dark theme, what the theme style is, etc.), and
 * provides a set of TonalPalettes that can create colors that fit in
 * with the theme style. Used by DynamicColor to resolve into a color.
 */
export class DynamicScheme {
    constructor(args) {
        this.sourceColorArgb = args.sourceColorArgb;
        this.variant = args.variant;
        this.contrastLevel = args.contrastLevel;
        this.isDark = args.isDark;
        this.sourceColorHct = Hct.fromInt(args.sourceColorArgb);
        this.primaryPalette = args.primaryPalette;
        this.secondaryPalette = args.secondaryPalette;
        this.tertiaryPalette = args.tertiaryPalette;
        this.neutralPalette = args.neutralPalette;
        this.neutralVariantPalette = args.neutralVariantPalette;
        this.errorPalette = TonalPalette.fromHueAndChroma(25.0, 84.0);
    }
    /**
     * Support design spec'ing Dynamic Color by schemes that specify hue
     * rotations that should be applied at certain breakpoints.
     * @param sourceColor the source color of the theme, in HCT.
     * @param hues The "breakpoints", i.e. the hues at which a rotation should
     * be apply.
     * @param rotations The rotation that should be applied when source color's
     * hue is >= the same index in hues array, and <= the hue at the next index
     * in hues array.
     */
    static getRotatedHue(sourceColor, hues, rotations) {
        const sourceHue = sourceColor.hue;
        if (hues.length !== rotations.length) {
            throw new Error(`mismatch between hue length ${hues.length} & rotations ${rotations.length}`);
        }
        if (rotations.length === 1) {
            return math.sanitizeDegreesDouble(sourceColor.hue + rotations[0]);
        }
        const size = hues.length;
        for (let i = 0; i <= size - 2; i++) {
            const thisHue = hues[i];
            const nextHue = hues[i + 1];
            if (thisHue < sourceHue && sourceHue < nextHue) {
                return math.sanitizeDegreesDouble(sourceHue + rotations[i]);
            }
        }
        // If this statement executes, something is wrong, there should have been a
        // rotation found using the arrays.
        return sourceHue;
    }
    getArgb(dynamicColor) {
        return dynamicColor.getArgb(this);
    }
    getHct(dynamicColor) {
        return dynamicColor.getHct(this);
    }
    get primaryPaletteKeyColor() {
        return this.getArgb(MaterialDynamicColors.primaryPaletteKeyColor);
    }
    get secondaryPaletteKeyColor() {
        return this.getArgb(MaterialDynamicColors.secondaryPaletteKeyColor);
    }
    get tertiaryPaletteKeyColor() {
        return this.getArgb(MaterialDynamicColors.tertiaryPaletteKeyColor);
    }
    get neutralPaletteKeyColor() {
        return this.getArgb(MaterialDynamicColors.neutralPaletteKeyColor);
    }
    get neutralVariantPaletteKeyColor() {
        return this.getArgb(MaterialDynamicColors.neutralVariantPaletteKeyColor);
    }
    get background() {
        return this.getArgb(MaterialDynamicColors.background);
    }
    get onBackground() {
        return this.getArgb(MaterialDynamicColors.onBackground);
    }
    get surface() {
        return this.getArgb(MaterialDynamicColors.surface);
    }
    get surfaceDim() {
        return this.getArgb(MaterialDynamicColors.surfaceDim);
    }
    get surfaceBright() {
        return this.getArgb(MaterialDynamicColors.surfaceBright);
    }
    get surfaceContainerLowest() {
        return this.getArgb(MaterialDynamicColors.surfaceContainerLowest);
    }
    get surfaceContainerLow() {
        return this.getArgb(MaterialDynamicColors.surfaceContainerLow);
    }
    get surfaceContainer() {
        return this.getArgb(MaterialDynamicColors.surfaceContainer);
    }
    get surfaceContainerHigh() {
        return this.getArgb(MaterialDynamicColors.surfaceContainerHigh);
    }
    get surfaceContainerHighest() {
        return this.getArgb(MaterialDynamicColors.surfaceContainerHighest);
    }
    get onSurface() {
        return this.getArgb(MaterialDynamicColors.onSurface);
    }
    get surfaceVariant() {
        return this.getArgb(MaterialDynamicColors.surfaceVariant);
    }
    get onSurfaceVariant() {
        return this.getArgb(MaterialDynamicColors.onSurfaceVariant);
    }
    get inverseSurface() {
        return this.getArgb(MaterialDynamicColors.inverseSurface);
    }
    get inverseOnSurface() {
        return this.getArgb(MaterialDynamicColors.inverseOnSurface);
    }
    get outline() {
        return this.getArgb(MaterialDynamicColors.outline);
    }
    get outlineVariant() {
        return this.getArgb(MaterialDynamicColors.outlineVariant);
    }
    get shadow() {
        return this.getArgb(MaterialDynamicColors.shadow);
    }
    get scrim() {
        return this.getArgb(MaterialDynamicColors.scrim);
    }
    get surfaceTint() {
        return this.getArgb(MaterialDynamicColors.surfaceTint);
    }
    get primary() {
        return this.getArgb(MaterialDynamicColors.primary);
    }
    get onPrimary() {
        return this.getArgb(MaterialDynamicColors.onPrimary);
    }
    get primaryContainer() {
        return this.getArgb(MaterialDynamicColors.primaryContainer);
    }
    get onPrimaryContainer() {
        return this.getArgb(MaterialDynamicColors.onPrimaryContainer);
    }
    get inversePrimary() {
        return this.getArgb(MaterialDynamicColors.inversePrimary);
    }
    get secondary() {
        return this.getArgb(MaterialDynamicColors.secondary);
    }
    get onSecondary() {
        return this.getArgb(MaterialDynamicColors.onSecondary);
    }
    get secondaryContainer() {
        return this.getArgb(MaterialDynamicColors.secondaryContainer);
    }
    get onSecondaryContainer() {
        return this.getArgb(MaterialDynamicColors.onSecondaryContainer);
    }
    get tertiary() {
        return this.getArgb(MaterialDynamicColors.tertiary);
    }
    get onTertiary() {
        return this.getArgb(MaterialDynamicColors.onTertiary);
    }
    get tertiaryContainer() {
        return this.getArgb(MaterialDynamicColors.tertiaryContainer);
    }
    get onTertiaryContainer() {
        return this.getArgb(MaterialDynamicColors.onTertiaryContainer);
    }
    get error() {
        return this.getArgb(MaterialDynamicColors.error);
    }
    get onError() {
        return this.getArgb(MaterialDynamicColors.onError);
    }
    get errorContainer() {
        return this.getArgb(MaterialDynamicColors.errorContainer);
    }
    get onErrorContainer() {
        return this.getArgb(MaterialDynamicColors.onErrorContainer);
    }
    get primaryFixed() {
        return this.getArgb(MaterialDynamicColors.primaryFixed);
    }
    get primaryFixedDim() {
        return this.getArgb(MaterialDynamicColors.primaryFixedDim);
    }
    get onPrimaryFixed() {
        return this.getArgb(MaterialDynamicColors.onPrimaryFixed);
    }
    get onPrimaryFixedVariant() {
        return this.getArgb(MaterialDynamicColors.onPrimaryFixedVariant);
    }
    get secondaryFixed() {
        return this.getArgb(MaterialDynamicColors.secondaryFixed);
    }
    get secondaryFixedDim() {
        return this.getArgb(MaterialDynamicColors.secondaryFixedDim);
    }
    get onSecondaryFixed() {
        return this.getArgb(MaterialDynamicColors.onSecondaryFixed);
    }
    get onSecondaryFixedVariant() {
        return this.getArgb(MaterialDynamicColors.onSecondaryFixedVariant);
    }
    get tertiaryFixed() {
        return this.getArgb(MaterialDynamicColors.tertiaryFixed);
    }
    get tertiaryFixedDim() {
        return this.getArgb(MaterialDynamicColors.tertiaryFixedDim);
    }
    get onTertiaryFixed() {
        return this.getArgb(MaterialDynamicColors.onTertiaryFixed);
    }
    get onTertiaryFixedVariant() {
        return this.getArgb(MaterialDynamicColors.onTertiaryFixedVariant);
    }
}
//# sourceMappingURL=dynamic_scheme.js.map