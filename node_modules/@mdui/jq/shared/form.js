/**
 * 使用该 WeakMap 来存储指定表单中所有的 mdui 表单控件
 * 在每个表单控件的 hostConnected 中添加、hostDisconnected 中移除对应表单的 mdui 表单控件，
 * 然后在 getFormControls 方法中就能获取到表单中所有的 mdui 表单控件
 */
export const formCollections = new WeakMap();
/**
 * 获取表单中的所有表单控件，包含原生和 mdui 表单控件
 * 原生的 `HTMLFormElement.elements` 仅返回原生表单控件，不包含 mdui 表单控件
 */
export const getFormControls = (form) => {
    const nativeFormControls = [...form.elements];
    const formControls = formCollections.get(form) || [];
    const comparePosition = (a, b) => {
        const position = a.compareDocumentPosition(b);
        return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    };
    // 按 DOM 元素的顺序排序
    return [...nativeFormControls, ...formControls].sort(comparePosition);
};
