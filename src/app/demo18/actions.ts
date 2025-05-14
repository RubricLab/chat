import type z from 'zod'

export function createAction<I extends z.ZodType, O extends z.ZodType>({
	schema,
	execute
}: {
	schema: { input: I; output: O }
	execute: (input: z.infer<I>) => z.infer<O>
}) {
	return {
		type: 'action' as const,
		schema,
		execute
	}
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnyZodType = z.ZodType<any, any>

export type AnyAction = ReturnType<typeof createAction<AnyZodType, AnyZodType>>

export type ActionMap = Record<string, AnyAction>
