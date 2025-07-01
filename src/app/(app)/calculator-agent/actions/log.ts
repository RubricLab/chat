export async function log(value: number) {
	if (value <= 0) {
		throw new Error('Logarithm of non-positive number is not allowed')
	}
	return Math.log(value)
} 