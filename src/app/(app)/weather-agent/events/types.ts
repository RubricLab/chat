import { createEventTypes } from '@rubriclab/events'
import { weatherAgentEventTypes } from '~/weather-agent/agent'

export const eventTypes = createEventTypes({
	...weatherAgentEventTypes
})
