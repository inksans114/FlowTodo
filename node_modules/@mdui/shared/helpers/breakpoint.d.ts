import '@mdui/jq/methods/innerWidth.js';
import type { JQ } from '@mdui/jq/shared/core.js';
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
/**
 * 获取断点对象，通过返回的对象可用于判断指定宽度、或指定元素的宽度、或当前窗口宽度与各个断点值的关系
 *
 * * 未传入参数时，获取的是 `window` 的宽度对应的断点对象
 * * 若传入数值，则获取的是该数值宽度对应的断点对象
 * * 若传入 CSS 选择器，则获取的是该选择器对应元素的宽度对应的断点对象
 * * 若传入 HTML 元素，则获取的是该元素的宽度对应的断点对象
 * * 若传入 JQ 对象，则获取的是该 JQ 对象中的元素的宽度对应的断点对象
 *
 * 返回的对象包含以下方法：
 *
 * * `up(breakpoint)`：判断当前宽度是否大于指定断点值
 * * `down(breakpoint)`：判断当前宽度是否小于指定断点值
 * * `only(breakpoint)`：判断当前宽度是否在指定断点值内
 * * `not(breakpoint)`：判断当前宽度是否不在指定断点值内
 * * `between(startBreakpoint, endBreakpoint)`：判断当前宽度是否在指定断点值之间
 */
export declare const breakpoint: (width?: number | string | HTMLElement | JQ<HTMLElement>) => {
    /**
     * 当前宽度是否大于指定断点值
     * @param breakpoint
     */
    up(breakpoint: Breakpoint): boolean;
    /**
     * 当前宽度是否小于指定断点值
     * @param breakpoint
     */
    down(breakpoint: Breakpoint): boolean;
    /**
     * 当前宽度是否在指定断点值内
     * @param breakpoint
     */
    only(breakpoint: Breakpoint): boolean;
    /**
     * 当前宽度是否不在指定断点值内
     * @param breakpoint
     */
    not(breakpoint: Breakpoint): boolean;
    /**
     * 当前宽度是否在指定断点值之间
     * @param startBreakpoint
     * @param endBreakpoint
     * @returns
     */
    between(startBreakpoint: Breakpoint, endBreakpoint: Breakpoint): boolean;
};
