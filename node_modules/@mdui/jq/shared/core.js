import { eachArray } from './helper.js';
/**
 * 为了使用模块扩充，这里不能使用默认导出
 */
export class JQ {
    constructor(arr) {
        this.length = 0;
        if (!arr) {
            return this;
        }
        eachArray(arr, (item, i) => {
            this[i] = item;
        });
        this.length = arr.length;
        return this;
    }
}
