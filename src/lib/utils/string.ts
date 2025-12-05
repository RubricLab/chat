/**
 * Strips excessive newlines from a string.
 * Replaces 3 or more consecutive newlines with 2 newlines.
 * Also trims leading/trailing whitespace.
 */
export const stripExcessiveNewlines = (text: string): string => {
	return text.replace(/\n{3,}/g, '\n\n').trim()
}
