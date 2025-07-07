import type { ReactNode } from 'react'
import { z } from 'zod/v4'

const fieldsSchema = z.object({
	body: z.string(),
	subject: z.string(),
	to: z.object({
		email: z.string(),
		id: z.string()
	})
})

type StatefullFields = {
	[K in keyof z.infer<typeof fieldsSchema>]: {
		react: ReactNode
		state: z.infer<typeof fieldsSchema>[K]
	}
}

export default function SendEmailForm({
	statefullFields,
	mutation
}: {
	statefullFields: StatefullFields
	mutation: (args: z.infer<typeof fieldsSchema>) => Promise<void>
}) {
	async function onSubmit() {
		const values = Object.fromEntries(
			Object.entries(statefullFields).map(([key, field]) => {
				return [key, (field as unknown as { getState: () => typeof field.state }).getState()]
			})
		) as {
			[K in keyof StatefullFields]: StatefullFields[K]['state']
		}

		await mutation(values)
	}

	const fields = Object.entries(statefullFields).map(([key, { react }]) => {
		return <div key={key}>{react}</div>
	})

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				onSubmit()
			}}
		>
			{fields}
			<button type={'submit'}>Submit</button>
		</form>
	)
}
