export async function log10(value: number) {
	if (value <= 0) {
		throw new Error('Logarithm of non-positive number is not allowed')
	}
	return Math.log10(value)
}
