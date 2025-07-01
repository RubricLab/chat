export async function divide({ dividend, divisor }: { dividend: number; divisor: number }) {
	if (divisor === 0) {
		throw new Error('Division by zero is not allowed')
	}
	return dividend / divisor
}
