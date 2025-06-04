import { createEventTypes } from '@rubriclab/events'
import { dbAgentEventTypes } from '~/db-agent/agent'

export const eventTypes = createEventTypes({
	...dbAgentEventTypes
})
