import { createEventTypes } from '@rubriclab/events'
import { researchAgentEventTypes } from '~/research-agent/agent'

export const eventTypes = createEventTypes({
	...researchAgentEventTypes
})
