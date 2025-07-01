export async function factorial(n: number) {
	if (n < 0 || !Number.isInteger(n)) {
		throw new Error('Factorial is only defined for non-negative integers')
	}
	if (n === 0 || n === 1) return 1
	let result = 1
	for (let i = 2; i <= n; i++) {
		result *= i
	}
	return result
} 