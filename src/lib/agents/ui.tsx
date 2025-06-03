import { createActionDocs } from '@rubriclab/actions'
import { createAgent } from '@rubriclab/agents/lib/agent2'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { createTool } from '@rubriclab/agents/lib/tool'
import { createBlocksDocs } from '@rubriclab/blocks'
import { createChain } from '@rubriclab/chains'
import { z } from 'zod/v4'
import { actions as __actions } from '~/actions'
import { blocks as __blocks } from '~/blocks'
import { genericBlocks } from '~/blocks/generics'

const systemPrompt = `You are a state of the art UI builder for Rubric Labs.
You will be tasked with building a UI to solve a use case.
This system is designed to be capable of building fullstack payloads - that include backend and frontend.
The system is rigid, using structured outputs to only allow for valid payloads, however it is also turing complete in the sense that deeply complex applications can be built in a single chain.
You have access to a set of Actions, Blocks and Generics which you will use to build a fullstack payload that acomplishes the entire lifecycle of the requested use case.

===== Actions =====
Actions are an abstraction of APIs. They have input and output schemas.
The following actions are available to you:
${createActionDocs({ actions: __actions })}

===== Blocks =====
Blocks are an abstraction of UI components. They have input and output schemas.
The following blocks are available to you:
${createBlocksDocs({ blocks: __blocks })}

===== Chaining =====
Chaining is the process of combining actions and blocks to create a UI.
If a block or action has an output type that is compatible with an argument of another action or block input, then it can be chained.
To chain a block or action (referred to as a node), you can simply next a call to another node in the argument that you pass to the node.
You can do this as many times as you want, creating powerful fullstack payloads!

===== Generic Blocks =====
Generic Blocks are a special type of block that can be used to dynamically instantiate a new block.
Since the system requires rigid input and output schemas, sometimes you will need to instantiate a generic block in order to have the available structure to create your fullstack payload.
When you instantiate a generic block with a tool call, the structured outputs available under the hood will change to include the new block's input and output schemas.

Generic Blocks are instantiated with tool calls. You have access to the following generic blocks:
${createActionDocs({ actions: genericBlocks })}

Your job is to create chains of nodes to create a fullstack payload.
First, consider any generic blocks that you need to instantiate. You can call tools to instantiate them.
When you are ready to generate the fullstack payload, output your final answer.

Thank you for your help, let's get started!`

// console.log(systemPrompt)

const actions = __actions
let blocks = __blocks

const blockSchemas = Object.fromEntries(
	Object.entries(blocks).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof blocks]: (typeof blocks)[K]['schema'] }

const actionSchemas = Object.fromEntries(
	Object.entries(actions).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }

const { drill } = createChain({
	...blockSchemas,
	...actionSchemas
})

function getResponseFormat() {
	const uiRegistry = z.registry<{ id: string }>()

	const blockSchemas = Object.fromEntries(
		Object.entries(blocks).map(([key, { schema }]) => [key, schema])
	) as { [K in keyof typeof blocks]: (typeof blocks)[K]['schema'] }

	const actionSchemas = Object.fromEntries(
		Object.entries(actions).map(([key, { schema }]) => [key, schema])
	) as { [K in keyof typeof actions]: (typeof actions)[K]['schema'] }

	const { definitions, compatabilities } = createChain(
		{
			...blockSchemas,
			...actionSchemas
		},
		{
			strict: true
		}
	)

	for (const definition of definitions) {
		definition.register(uiRegistry, { id: definition.shape.node.value })
	}

	for (const { shape, schema } of compatabilities) {
		schema.register(uiRegistry, { id: JSON.stringify(shape) })
	}

	const responseFormat = createResponseFormat({
		name: 'chain',
		schema: z.strictObject({
			chain: z.union(definitions),
			comments: z
				.string()
				.describe(
					'This is an optional field ONLY available in debug mode. This is a freeform space to provide any feedback or comments to the developer about the chain you have created. If there are parts of the process that felt difficult or unintuitive, or if you have any suggestions for improvements in the schema design or system design, please let the developer know!'
				)
		}),
		registry: uiRegistry
	})
	return responseFormat
}

const instantiateFormTool = createTool({
	schema: genericBlocks.instantiateForm.schema,
	execute: async input => {
		blocks = {
			...blocks,
			...{
				[`instantiateForm_${input.actionName}`]: await genericBlocks.instantiateForm.execute(input)
			}
		}
		return undefined
	}
})

export const {
	executeAgent: executeUIAgent,
	eventTypes: uiAgentEventTypes,
	__Event
} = createAgent({
	systemPrompt,
	tools: { instantiateForm: instantiateFormTool },
	responseFormat: getResponseFormat
})

export type UIEventTypes = typeof __Event

export { drill }
