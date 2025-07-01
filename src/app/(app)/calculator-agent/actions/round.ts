export async function round({ value, decimals }: { value: number; decimals: number | null }) {
	const decimalPlaces = decimals ?? 0
	const factor = Math.pow(10, decimalPlaces)
	return Math.round(value * factor) / factor
} 