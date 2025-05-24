import { createEventTypes } from '@rubriclab/events'
import { weatherAgentEventTypes } from '~/agents/weather'

export const eventTypes = createEventTypes({
	...weatherAgentEventTypes
})
