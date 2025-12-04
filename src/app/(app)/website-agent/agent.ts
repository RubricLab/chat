import { createAgent, createResponseFormat, noTabs } from '@rubriclab/agents'
import { createBlocksDocs } from '@rubriclab/blocks'
import { z } from 'zod'
import { blocks } from '~/website-agent/blocks'
import { chain, compatibilities, definitions } from '~/website-agent/chains'

const registry = z.registry<{ id: string }>()

// Register definitions
// @ts-expect-error union overflow
for (const [id, { register }] of Object.entries(definitions)) register(registry, { id })

// Register compatabilities
for (const [id, { register }] of Object.entries(compatibilities)) register(registry, { id })

const responseFormat = createResponseFormat({
	name: 'chain',
	// Pass the registry to build the recursive schema.
	registry,
	schema: z.object({
		chain
	})
})

const systemPrompt = noTabs`
	You are a state of the art website building agent.
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

	Thank you for your help, let's get started!
`

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	model: 'gpt-5.1',
	responseFormat,
	systemPrompt,
	tools: {}
})

export { eventTypes as websiteAgentEventTypes }
export { executeAgent as executeWebsiteAgent }

export type WebsiteAgentToolEvent = typeof __ToolEvent
export type WebsiteAgentResponseEvent = typeof __ResponseEvent
