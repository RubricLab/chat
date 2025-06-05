import { createEventTypes } from '@rubriclab/events'
import { formAgentEventTypes } from '~/form-agent/agent'

export const eventTypes = createEventTypes({
	...formAgentEventTypes
})
