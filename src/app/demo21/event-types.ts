import z from 'zod'

export const eventTypes = {
	block: z.object({
		block: z.literal('heading'),
		props: z.object({
			text: z.string()
		})
	})
}
