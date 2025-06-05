'use client'

import type { ReactNode } from 'react'
import type { z } from 'zod/v4'

export function GenericForm<Input extends Record<string, z.ZodType>>({
	fields,
	onSubmit
}: {
	fields: {
		[key in keyof Input]: z.infer<Input[key]> | { react: ReactNode; value: z.infer<Input[key]> }
	}
	onSubmit: (input: { [key in keyof Input]: z.infer<Input[key]> }) => void
}) {
	const values = Object.fromEntries(
		Object.entries(fields).map(([key, { value }]) => [key, value])
	) as {
		[K in keyof Input]: z.infer<Input[K]>
	}

	const react = Object.entries(fields).map(([key, react]) => <div key={key}>{react}</div>)

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				onSubmit(values)
			}}
		>
			{react}
			<button type="submit" onClick={() => onSubmit(values)}>
				Send
			</button>
		</form>
	)
}
