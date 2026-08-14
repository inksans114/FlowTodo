/**
 * watch 装饰器。在 @property 或 @state 属性变更时，且在组件更新前触发
 * 若初始值为 undefined，则初始状态不会触发；否则初始状态就会先触发一次
 *
 * 如果要等属性变更后，且组件更新完成再执行，可以在函数中执行 `await this.updateComplete`
 * 如果要等组件首次渲染完后再监听属性，可以传入第二个参数 true。或者在函数中通过 `this.hasUpdated` 进行判断
 *
 * @watch('propName')
 * handlePropChange(oldValue, newValue) {
 *
 * }
 */
/**
 * @param propName 监听的属性名
 * @param waitUntilFirstUpdate 是否等首次渲染完后再监听
 */
export function watch(propName, waitUntilFirstUpdate = false) {
    return (proto, functionName) => {
        // @ts-ignore
        const { update } = proto;
        if (propName in proto) {
            // @ts-ignore
            proto.update = function (changedProperties) {
                if (changedProperties.has(propName)) {
                    const oldValue = changedProperties.get(propName);
                    const newValue = this[propName];
                    if (oldValue !== newValue) {
                        if (!waitUntilFirstUpdate || this.hasUpdated) {
                            // @ts-ignore
                            this[functionName](oldValue, newValue);
                        }
                    }
                }
                update.call(this, changedProperties);
            };
        }
    };
}
