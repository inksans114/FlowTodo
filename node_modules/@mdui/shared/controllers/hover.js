import { $ } from '@mdui/jq/$.js';
import '@mdui/jq/methods/off.js';
import '@mdui/jq/methods/on.js';
import { uniqueId } from '../helpers/uniqueId.js';
/**
 * 检查当前鼠标是否放在指定元素上，及进入、离开元素执行对于的回调
 */
export class HoverController {
    /**
     * @param host
     * @param elementRef 检查鼠标是否放在该元素上
     */
    constructor(host, elementRef) {
        /**
         * 当前鼠标是否放在元素上
         */
        this.isHover = false;
        this.uniqueID = uniqueId();
        this.enterEventName = `mouseenter.${this.uniqueID}.hoverController`;
        this.leaveEventName = `mouseleave.${this.uniqueID}.hoverController`;
        this.mouseEnterItems = [];
        this.mouseLeaveItems = [];
        (this.host = host).addController(this);
        this.elementRef = elementRef;
    }
    hostConnected() {
        this.host.updateComplete.then(() => {
            $(this.elementRef.value)
                .on(this.enterEventName, () => {
                this.isHover = true;
                for (let i = this.mouseEnterItems.length - 1; i >= 0; i--) {
                    const item = this.mouseEnterItems[i];
                    item.callback();
                    if (item.one) {
                        this.mouseEnterItems.splice(i, 1);
                    }
                }
            })
                .on(this.leaveEventName, () => {
                this.isHover = false;
                for (let i = this.mouseLeaveItems.length - 1; i >= 0; i--) {
                    const item = this.mouseLeaveItems[i];
                    item.callback();
                    if (item.one) {
                        this.mouseLeaveItems.splice(i, 1);
                    }
                }
            });
        });
    }
    hostDisconnected() {
        $(this.elementRef.value).off(this.enterEventName).off(this.leaveEventName);
    }
    /**
     * 指定鼠标移入时的回调函数
     * @param callback 要执行的回调函数
     * @param one 是否仅执行一次
     */
    onMouseEnter(callback, one = false) {
        this.mouseEnterItems.push({ callback, one });
    }
    /**
     * 指定鼠标移出时的回调函数
     * @param callback 要执行的回调函数
     * @param one 是否仅执行一次
     */
    onMouseLeave(callback, one = false) {
        this.mouseLeaveItems.push({ callback, one });
    }
}
