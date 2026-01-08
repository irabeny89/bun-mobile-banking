/**
 * Generate a random reference of 10 characters with 3 characters prefix
 * @param prefix 3 characters
 * @returns 10 characters
 */
export function generateRef(prefix: string) {
    return `${prefix}_${Date.now().toString(36).toUpperCase().slice(0, 7)}`
}