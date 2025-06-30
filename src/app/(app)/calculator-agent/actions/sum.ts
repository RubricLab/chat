'use server'

export async function sum({ numbers }: { numbers: number[] }) {
	return numbers.reduce((sum, num) => sum + num, 0)
}
