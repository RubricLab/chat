import { createEventTypes } from '@rubriclab/events'
import { z } from 'zod'

export const eventTypes = createEventTypes({
	hi: z.string()
})
