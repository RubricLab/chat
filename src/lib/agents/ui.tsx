import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { z } from 'zod/v4'
import { blocks } from '~/blocks'
import { uiRegistry } from '~/blocks'

const responseFormat = createResponseFormat({
	name: 'ui',
	schema: z.object({ ui: blocks }),
	registry: uiRegistry
})

console.dir(responseFormat, { depth: null })

export const {
	executeAgent: executeUIAgent,
	eventTypes: uiAgentEventTypes,
	__Event
} = createAgent({
	systemPrompt: 'You are a helpful agent that tells us the weather in new york.',
	tools: {},
	responseFormat
})

export type UIEventTypes = typeof __Event
