import { createEventTypes } from '@rubriclab/events'
import { tableAgentEventTypes } from '~/table-agent/agent'

export const eventTypes = createEventTypes({
	...tableAgentEventTypes
})
