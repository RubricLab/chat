import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { createChain } from '@rubriclab/chains'
import { z } from 'zod/v4'
import { actions } from '~/actions'
import { blocks } from '~/blocks'

const uiRegistry = z.registry<{ id: string }>()

const blockSchemas = Object.fromEntries(
	Object.entries(blocks).map(([key, value]) => [key, value.schema])
) as { [K in keyof typeof blocks]: (typeof blocks)[K]['schema'] }

const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, value]) => [key, value.schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }

const { definitions, compatabilities } = createChain({
	...blockSchemas,
	...actionSchemas
})

for (const definition of definitions) {
	definition.register(uiRegistry, { id: definition.shape.node.value })
}

for (const input of Object.values(compatabilities)) {
	for (const { zod, shape } of Object.values(input)) {
		try {
			zod.register(uiRegistry, { id: JSON.stringify(shape) })
		} catch {}
	}
}

const responseFormat = createResponseFormat({
	name: 'chain',
	schema: z.object({
		chain: z.array(z.union(definitions)).min(1)
	}),
	registry: uiRegistry
})

console.dir(responseFormat, { depth: null })

export const {
	executeAgent: executeUIAgent,
	eventTypes: uiAgentEventTypes,
	__Event
} = createAgent({
	systemPrompt:
		'You are a helpful agent that creates chains of actions and blocks to create functional fullstack snippets of functionality. You can nest blocks and actions inside of other blocks and actions. EVERY payload must represent the ENTIRE lifecycle of the functionality, not just a part of it. Use recursive payloads to represent the entire lifecycle of the functionality including data fetching, mutations, transformations, and rendering. Never use hardcoded values unless specifically requested, rather, create chains that get, set, transform, display and request data in a nested manner.',
	tools: {},
	responseFormat
})

export type UIEventTypes = typeof __Event
