import xss from "xss";

/**
 * Sanitizes data by removing XSS attacks in strings, arrays and objects.
 * @param data data to sanitize eg string, array or objects
 * @returns cleaned data
 */
export function sanitize<T>(data: T): T {
    if (typeof data === "string") {
        return xss(data) as unknown as T;
    }
    if (Array.isArray(data)) {
        return data.map((item) => sanitize(item)) as unknown as T;
    }
    if (data !== null && typeof data === 'object') {
        const sanitizedObject = {} as Record<string, any>;
        for (const [key, value] of Object.entries(data)) {
            sanitizedObject[key] = sanitize(value);
        }
        return sanitizedObject as T;
    }
    return data;
}
