export async function modulo({ dividend, divisor }: { dividend: number; divisor: number }) {
	if (divisor === 0) {
		throw new Error('Modulo by zero is not allowed')
	}
	return dividend % divisor
} 