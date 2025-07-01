export async function sqrt(value: number) {
	if (value < 0) {
		throw new Error('Square root of negative number is not allowed')
	}
	return Math.sqrt(value)
} 