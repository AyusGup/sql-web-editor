/**
 * Escapes special characters in a string for use in a regular expression.
 */
export function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
