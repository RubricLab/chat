import { createActionDocs } from '@rubriclab/actions'
import { createAgent } from '@rubriclab/agents'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { createBlocksDocs } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { actions } from '~/form-agent/actions'
import { blocks } from '~/form-agent/blocks'
import { chain, compatibilities, definitions } from './chains'

const fullstackRegistry = z.registry<{ id: string }>()

// Register definitions
for (const [id, { register }] of Object.entries(definitions)) {
	register(fullstackRegistry, { id })
}

// Register compatabilities
for (const [id, { register }] of Object.entries(compatibilities)) {
	register(fullstackRegistry, { id })
}
const responseFormat = createResponseFormat({
	name: 'chain',
	// Pass the registry to build the recursive schema.
	registry: fullstackRegistry,
	schema: z.object({
		chain
	})
})

// console.dir(responseFormat, { depth: null })

const systemPrompt = `You are a state of the art form building agent.
You will be tasked with building a UI to solve a use case.
This system is designed to be capable of building fullstack payloads - that include backend and frontend.
The system is rigid, using structured outputs to only allow for valid payloads, however it is also turing complete in the sense that deeply complex applications can be built in a single chain.
You have access to a set of Actions, Blocks and Generics which you will use to build a fullstack payload that acomplishes the entire lifecycle of the requested use case.

===== Actions =====
Actions are an abstraction of APIs. They have input and output schemas.
The following actions are available to you:
${createActionDocs({ actions })}

===== Blocks =====
Blocks are an abstraction of UI components. They have input and output schemas.
The following blocks are available to you:
${createBlocksDocs({ blocks })}

===== Chaining =====
Chaining is the process of combining actions and blocks to create a UI.
If a block or action has an output type that is compatible with an argument of another action or block input, then it can be chained.
To chain a block or action (referred to as a node), you can simply next a call to another node in the argument that you pass to the node.
You can do this as many times as you want, creating powerful fullstack payloads!

Your job is to create chains of nodes to create a fullstack payload.
First, consider any generic blocks that you need to instantiate. You can call tools to instantiate them.
When you are ready to generate the fullstack payload, output your final answer.

Thank you for your help, let's get started!`

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	responseFormat,
	systemPrompt,
	tools: {}
})

export { eventTypes as formAgentEventTypes }
export { executeAgent as executeFormAgent }

export type FormAgentToolEvent = typeof __ToolEvent
export type FormAgentResponseEvent = typeof __ResponseEvent
