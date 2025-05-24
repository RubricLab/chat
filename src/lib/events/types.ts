import { createEventTypes } from '@rubriclab/events'
import { uiAgentEventTypes } from '~/agents/ui'

export const eventTypes = createEventTypes({
	...uiAgentEventTypes
})
