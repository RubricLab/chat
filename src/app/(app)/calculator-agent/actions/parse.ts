export async function parse(string: string) {
	const result = Number.parseFloat(string)
	if (Number.isNaN(result)) {
		throw new Error('Invalid number format')
	}
	return result
}
