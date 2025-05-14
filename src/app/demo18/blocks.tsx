import type z from 'zod'

export function createBlock<I extends z.ZodType, O extends z.ZodType>({
	schema,
	render
}: {
	schema: { input: I; output: O }
	render: (input: z.infer<I>, { emit }: { emit: (output: z.infer<O>) => void }) => void
}) {
	return {
		type: 'block',
		schema,
		render
	}
}
