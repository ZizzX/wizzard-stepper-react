/**
 * Retrieves a value from an object by path (dot notation or brackets)
 */
export function getByPath(obj: any, path: string, defaultValue?: any): any {
    if (!path) return obj;
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let result = obj;
    for (const key of keys) {
        if (result === undefined || result === null) return defaultValue;
        result = result[key];
    }
    return result !== undefined ? result : defaultValue;
}

/**
 * Immutably sets a value in an object by path
 */
export function setByPath<T extends object>(obj: T, path: string, value: any): T {
    if (!path) return value as unknown as T;
    if (!path.includes('.') && !path.includes('[') && !path.includes(']')) {
        return { ...obj, [path]: value };
    }
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);

    const update = (current: any, index: number): any => {
        if (index === keys.length) return value;

        const key = keys[index];
        const isKeyNumeric = !isNaN(Number(key)) && key.trim() !== '';

        let nextLevel = current;
        if (!nextLevel || typeof nextLevel !== 'object') {
            nextLevel = isKeyNumeric ? [] : {};
        } else {
            nextLevel = Array.isArray(nextLevel) ? [...nextLevel] : { ...nextLevel };
        }

        const nextKey = isKeyNumeric ? Number(key) : key;
        nextLevel[nextKey] = update(nextLevel[nextKey], index + 1);
        return nextLevel;
    };

    return update(obj, 0);
}
