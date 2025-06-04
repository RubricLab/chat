'use server'

export async function add({ a, b }: { a: number; b: number }) {
	return a + b
}
