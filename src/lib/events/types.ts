import { createEventTypes } from '@rubriclab/events'
import { z } from 'zod/v4'

export const eventTypes = createEventTypes({
	message: z.object({
		role: z.enum(['user', 'assistant']),
		content: z.string()
	})
})
