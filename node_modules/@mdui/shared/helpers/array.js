/**
 * 检查两个数组是否包含相同的元素，不考虑顺序
 * @param a
 * @param b
 */
export const arraysEqualIgnoreOrder = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((value, index) => value === sortedB[index]);
};
