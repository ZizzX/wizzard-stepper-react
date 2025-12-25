/**
 * Cache for parsed path strings to avoid repetitive regex/split operations.
 * Key: path string (e.g., "users[0].name")
 * Value: array of keys (e.g., ["users", "0", "name"])
 */
const pathCache = new Map<string, string[]>();

/**
 * Parses a string path into an array of keys using a cache.
 * Handles dot notation "a.b" and bracket notation "a[0].b".
 */
export function toPath(path: string): string[] {
    if (!path) return [];
    if (pathCache.has(path)) {
        return pathCache.get(path)!;
    }

    // Optimization: Regex only if brackets exist, otherwise fast split
    let keys: string[];
    if (path.includes('[')) {
        keys = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    } else {
        keys = path.split('.').filter(Boolean);
    }

    pathCache.set(path, keys);
    return keys;
}

/**
 * Retrieves a value from an object by path using cached key parsing.
 * Optimized for frequent access.
 */
export function getByPath(obj: any, path: string, defaultValue?: unknown): unknown {
    if (!path || obj === undefined || obj === null) return defaultValue ?? obj;

    // Fast path for direct property access (no dots/brackets)
    if (!path.includes('.') && !path.includes('[')) {
        const val = obj[path];
        return val !== undefined ? val : defaultValue;
    }

    const keys = toPath(path);
    let result = obj;

    for (let i = 0; i < keys.length; i++) {
        if (result === undefined || result === null) return defaultValue;
        result = result[keys[i]];
    }

    return result !== undefined ? result : defaultValue;
}

/**
 * Immutably sets a value in an object by path.
 * iterative implementation (stack-safe and usually faster).
 */
export function setByPath<T extends object>(obj: T, path: string, value: unknown): T {
    if (!path) return value as unknown as T;

    // Fast path: simple property set
    if (!path.includes('.') && !path.includes('[')) {
        // Optimization: Shallow copy mostly sufficient for root
        // If obj is Array, we must be careful, but typings say T extends object
        if (Array.isArray(obj)) {
            const copy = [...obj] as any;
            copy[path] = value;
            return copy;
        }
        return { ...obj, [path]: value };
    }

    const keys = toPath(path);
    if (keys.length === 0) return value as unknown as T;

    // Shallow clone root
    const root = Array.isArray(obj) ? [...obj] : { ...obj };
    let current: any = root;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];

        // Determine if next level should be array or object
        // If key exists, we clone it. If not, we create based on nextKey type (numeric -> array)
        const existing = current[key];
        let nextLevel;

        if (existing && typeof existing === 'object') {
            nextLevel = Array.isArray(existing) ? [...existing] : { ...existing };
        } else {
            // Predict type based on next key: is it an integer?
            const isNumeric = /^\d+$/.test(nextKey);
            nextLevel = isNumeric ? [] : {};
        }

        current[key] = nextLevel;
        current = nextLevel;
    }

    // Set final value
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    return root as T;
}

/**
 * Simple shallow equality check for objects and arrays.
 * Useful for preventing re-renders in selectors.
 */
export function shallowEqual(a: any, b: any): boolean {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
        const key = keysA[i];
        if (!Object.prototype.hasOwnProperty.call(b, key) || !Object.is(a[key], b[key])) {
            return false;
        }
    }

    return true;
}
