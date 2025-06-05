import { createEventsClient } from '@rubriclab/events/client'
import { eventTypes } from './types'

export const { useEvents } = createEventsClient({
	url: '/website-agent/events',
	eventTypes
})
