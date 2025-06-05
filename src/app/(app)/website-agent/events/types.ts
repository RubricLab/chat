import { createEventTypes } from '@rubriclab/events'
import { websiteAgentEventTypes } from '~/website-agent/agent'

export const eventTypes = createEventTypes({
	...websiteAgentEventTypes
})
