import { createAgent } from '@rubriclab/agents'
import { createResponseFormat } from '@rubriclab/agents'
import { createBlocksDocs } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { blocks } from '~/website-agent/blocks'
import { compatabilities, definitions } from '~/website-agent/chains'

const actionsRegistry = z.registry<{ id: string }>()

// Register definitions
for (const definition of definitions) {
	definition.register(actionsRegistry, { id: definition.shape.node.value })
}

// Register compatabilities
for (const { shape, schema } of compatabilities) {
	schema.register(actionsRegistry, { id: JSON.stringify(shape) })
}

const responseFormat = createResponseFormat({
	name: 'chain',
	schema: z.object({
		chain: z.union(definitions)
	}),
	// Pass the registry to build the recursive schema.
	registry: actionsRegistry
})

const systemPrompt = `You are a state of the art website building agent.
You will be tasked with building a website.
You have access to a set of Blocks which you will use to build a website.

===== Blocks =====
Blocks are an abstraction of UI components. They have input and output schemas.
The following blocks are available to you:
${createBlocksDocs({ blocks })}

===== Chaining =====
Chaining is the process of combining blocks to create a UI.
If a block has an output type that is compatible with an argument of another block input, then it can be chained.
To chain a block, you can simply next a call to another block in the argument that you pass to the block.
You can do this as many times as you want, creating powerful fullstack payloads!

Your job is to create chains of nodes to create a fullstack payload.
When you are ready to generate the fullstack payload, output your final answer.

Thank you for your help, let's get started!`

console.dir(responseFormat, { depth: null })

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	systemPrompt,
	tools: {},
	responseFormat
})

export { eventTypes as websiteAgentEventTypes }
export { executeAgent as executeWebsiteAgent }

export type WebsiteAgentToolEvent = typeof __ToolEvent
export type WebsiteAgentResponseEvent = typeof __ResponseEvent
