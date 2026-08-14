import { isUndefined, eachObject, eachArray } from '../shared/helper.js';
export function extend(target, ...objectN) {
    eachArray(objectN, (object) => {
        eachObject(object, (prop, value) => {
            if (!isUndefined(value)) {
                target[prop] = value;
            }
        });
    });
    return target;
}
