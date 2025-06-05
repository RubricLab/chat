import { createEventTypes } from '@rubriclab/events'
import { calculatorAgentEventTypes } from '~/calculator-agent/agent'

export const eventTypes = createEventTypes({
	...calculatorAgentEventTypes
})
