import z from 'zod'

export function createBlock<I extends Record<string, z.ZodType>, O extends z.ZodType>({
	schema,
	render
}: {
	schema: { input: I; output: O }
	render: (
		input: { [K in keyof I]: z.infer<I[K]> },
		{ emit }: { emit: (output: z.infer<O>) => void }
	) => void
}) {
	return {
		type: 'block',
		schema,
		render
	}
}

export type AnyBlock = ReturnType<typeof createBlock<Record<string, z.ZodType>, z.ZodType>>

export type BlockMap = Record<string, AnyBlock>

export function createBlockProxy<Name extends string, Input extends AnyBlock['schema']['input']>({
	name,
	input
}: {
	name: Name
	input: Input
}) {
	return z.strictObject({
		block: z.literal(`block_${name}` as const),
		props: z.object(input)
	})
}

export function createGenericTypeProviderBlock<
	TypeOptions extends Record<string, z.ZodType>,
	Input extends Record<string, z.ZodType>,
	Output extends z.ZodType
>({
	typeOptions,
	instantiate
}: {
	typeOptions: TypeOptions
	instantiate: ({
		type
	}: { type: keyof TypeOptions }) => ReturnType<typeof createBlock<Input, Output>>
}) {
	type Keys = keyof TypeOptions & string
	const keys = Object.keys(typeOptions) as Keys[]
	return {
		type: 'action' as const,
		schema: {
			input: {
				type: z.enum(keys)
			},
			output: z.void()
		},
		instantiate
	}
}

// export function createGenericActionExecutorBlock<>

// export function createGenericActionMapperBlock<>
