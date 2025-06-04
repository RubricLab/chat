import { createActionDocs } from '@rubriclab/actions'
import { createAgent } from '@rubriclab/agents'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { z } from 'zod/v4'
import { actions } from './actions'
import { compatabilities, definitions } from './chains'

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

const systemPrompt = `You are a state of the art calculator agent.
You will be tasked with building a chain of operations to solve an equation.
You have access to a set of Actions which you will use to build a chain of operations that solves the equation.

===== Actions =====
Actions are an abstraction of APIs. They have input and output schemas.
The following actions are available to you:
${createActionDocs({ actions })}

===== Chaining =====
Chaining is the process of combining actions and blocks to create a UI.
If a block or action has an output type that is compatible with an argument of another action or block input, then it can be chained.
To chain a block or action (referred to as a node), you can simply next a call to another node in the argument that you pass to the node.
You can do this as many times as you want, creating powerful fullstack payloads!

Your job is to create chains of nodes to create a fullstack payload.
First, consider any generic blocks that you need to instantiate. You can call tools to instantiate them.
When you are ready to generate the fullstack payload, output your final answer.

Thank you for your help, let's get started!`

// console.dir(responseFormat, { depth: null })

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	systemPrompt,
	tools: {},
	responseFormat
})

export { eventTypes as calculatorAgentEventTypes }
export { executeAgent as executeCalculatorAgent }

export type CalculatorAgentToolEvent = typeof __ToolEvent
export type CalculatorAgentResponseEvent = typeof __ResponseEvent
