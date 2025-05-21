import { registry, z } from 'zod/v4'
import { createAction } from '../lib/actions'
import { createStructuredOutputInference } from '../lib/agent'
import {
	createBlock,
	createBlockProxy,
	createGenericActionExecutorBlock,
	createGenericTypeProviderBlock
} from '../lib/blocks'
import { createResponseFormat } from '../lib/responseFormat'
import { createRegistry, createSchema, registerNode } from '../lib/schema'

const uiRegistry = createRegistry()

const instantiationRegistry = createRegistry()

/*
 *   --------------
 *   |   TYPES    |
 *   --------------
 */

const [CONTACT_ID, CONTACT_ID_INPUT] = uiRegistry.createCompatabilitySlot({
	name: 'contactId',
	schema: z.string()
	// excludeSourceSchema: true
})

const [STRING, STRING_INPUT] = uiRegistry.createCompatabilitySlot({
	name: 'string',
	schema: z.string(),
	excludeSourceSchema: true
})

const [CONTACT, CONTACT_INPUT] = uiRegistry.createCompatabilitySlot({
	name: 'contact',
	schema: z.object({
		id: CONTACT_ID,
		name: STRING_INPUT
	}),
	excludeSourceSchema: true
})

const types = {
	CONTACT_ID: { type: CONTACT_ID, compatabilities: CONTACT_ID_INPUT },
	STRING: { type: STRING, compatabilities: STRING_INPUT },
	CONTACT: { type: CONTACT, compatabilities: CONTACT_INPUT }
}

/*
 *   ---------------
 *   |   ACTIONS   |
 *   ---------------
 */

const getContactById = createAction({
	schema: {
		input: {
			id: CONTACT_ID_INPUT
		},
		output: CONTACT
	},
	execute: async ({ id }) => {
		return { id, name: 'John Doe' }
	}
})

const getAllContacts = createAction({
	schema: {
		input: {},
		output: z.array(CONTACT)
	},
	execute: async () => {
		return [{ id: '1', name: 'John Doe' }]
	}
})

const sendEmail = createAction({
	schema: {
		input: {
			to: CONTACT_INPUT,
			subject: STRING_INPUT,
			body: STRING_INPUT
		},
		output: z.object({ emailId: z.string() })
	},
	execute: async _ => {
		return { emailId: '1' }
	}
})

const actions = {
	getContactById,
	getAllContacts,
	sendEmail
}

/*
 *   --------------
 *   |   BLOCKS   |
 *   --------------
 */

const textInput = createBlock({
	schema: {
		input: {},
		output: STRING
	},
	render: (_, { emit }) => {
		return <input type="text" onChange={e => emit(e.target.value)} />
	}
})

const blocks = {
	textInput
}

/*
 *   --------------
 *   |   SCHEMA   |
 *   --------------
 */

uiRegistry.setRootSchema(
	createSchema({
		name: 'UI',
		actions,
		blocks,
		registry: uiRegistry
	})
)

/*
 *   ----------------------
 *   |   GENERIC BLOCKS   |
 *   ----------------------
 */

// function cloneRootSchemaAndShootInTheLiteralAsACompatibilityWithActionOut({
// 	actionOutSchema,
// 	literal
// }: {
// 	actionOutSchema: z.ZodType
// 	literal: z.ZodLiteral<string>
// }) {
// 	// const [CLONED, CLONED_COMPATIBILITIES] = uiRegistry.cloneSlot({
// 	// 	name: 'CLONED_ACTION_OUT_SCHEMA',
// 	// 	schema: actionOutSchema
// 	// })

// 	uiRegistry.pushCompatibility({
// 		schema: actionOutSchema,
// 		compatibility: literal
// 	})

// 	// return [CLONED, CLONED_COMPATIBILITIES] as const
// }

// const createMap = {
// 	type: 'action' as const,
// 	schema: {
// 		input: {
// 			actionChain: z.enum(keys)
// 		},
// 		output: z.void()
// 	},
// 	execute: async ({ action }: { action: Keys }) => {
// 		return instantiate({ action })
// 	}
// }

const instantiateForm = createGenericActionExecutorBlock({
	actionOptions: actions,
	instantiate({ action }) {
		const outSchema = actions[action].schema.output
		uiRegistry.pushCompatibility({
			schema: outSchema,
			compatibility: z.literal(`$.CONTEXT_KEY.${action}`)
		})
		// const [CLONED, CLONED_COMPATIBILITIES] =
		// cloneRootSchemaAndShootInTheLiteralAsACompatibilityWithActionOut({
		// 	actionOutSchema: outSchema,
		// 	literal: z.literal(`$.${action}_output`)
		// })
		return createBlock({
			schema: {
				input: {
					inputs: z.object(actions[action].schema.input),
					onExecute: z.array(uiRegistry.rootSchema)
				},
				output: z.void()
			},
			render: ({ inputs, onExecute }) => {
				return (
					<div>
						<div>
							<p>Action</p>
							{action}: {JSON.stringify(inputs)}
						</div>
						<div>
							<p>On Execute</p>
							{JSON.stringify(onExecute)}
						</div>
					</div>
				)
			}
		})
	}
})

const instantiateView = createGenericTypeProviderBlock({
	typeOptions: types,
	instantiate({ type }) {
		const outSchema = types[type]
		// cloneRootSchemaAndShootInTheLiteralAsACompatibilityWithActionOut({
		// 	actionOutSchema: outSchema,
		// 	literal: z.literal(`$.${type}_output`)
		// })
		uiRegistry.pushCompatibility({
			schema: outSchema.type,
			compatibility: z.literal(`$.CONTEXT_KEY.${type}`)
		})
		return createBlock({
			schema: {
				input: {
					hydrate: outSchema.compatabilities,
					children: z.array(uiRegistry.rootSchema),
					name: z.string()
				},
				output: z.void()
			},
			render: ({ hydrate, children, name }) => {
				console.log(children)
				return (
					<div>
						<h1>{name}</h1>
						<div>
							<p>Hydrate</p>
							{JSON.stringify(hydrate)}
						</div>
						<div>
							<p>Children</p>
							{JSON.stringify(children)}
						</div>
					</div>
				)
			}
		})
	}
})

async function buildUI(prompt: string) {
	const instantiationSchema = z.object({
		instantiations: z.array(
			createSchema({
				name: 'instantiationSchema',
				actions: {
					instantiateView,
					instantiateForm
				},
				blocks: {},
				registry: instantiationRegistry
			})
		)
	})

	const instantiationResponseFormat = createResponseFormat({
		name: 'INSTANTIATION_SCHEMA',
		schema: instantiationSchema,
		registry: instantiationRegistry.zodRegistry
	})

	// console.dir(instantiationResponseFormat, { depth: null })

	const { instantiations } = await createStructuredOutputInference({
		openAIApiKey: process.env.OPENAI_API_KEY ?? (undefined as never),
		responseFormat: instantiationResponseFormat,
		messages: [
			{ role: 'user', content: 'instantiate a contact view (Contact Type) and a send emailform' }
		]
	})

	console.dir(instantiations, { depth: null })

	const instantiated = await Promise.all(
		instantiations.map(async ({ action, params }) => {
			switch (action) {
				case 'action_instantiateView': {
					const instantiatedView = await registerNode({
						name: `view_${params.type}`,
						node: await instantiateView.execute(params),
						registry: uiRegistry
					})

					uiRegistry.pushToRootSchema(instantiatedView)
					return instantiatedView
				}
				case 'action_instantiateForm': {
					const instantiatedForm = await registerNode({
						name: `form_${params.action}`,
						node: await instantiateForm.execute(params),
						registry: uiRegistry
					})

					uiRegistry.pushToRootSchema(instantiatedForm)
					return instantiatedForm
				}
			}
		})
	)

	const uiResponseFormat = createResponseFormat({
		name: 'UI_SCHEMA',
		schema: z.object({
			ui: z.array(uiRegistry.rootSchema)
		}),
		registry: uiRegistry.zodRegistry
	})

	// console.dir(uiResponseFormat, { depth: null })

	const { ui } = await createStructuredOutputInference({
		openAIApiKey: process.env.OPENAI_API_KEY ?? (undefined as never),
		responseFormat: uiResponseFormat,
		messages: [
			{
				role: 'system',
				content:
					'you are a UI generation bot. In a previous step, generic blocks may have been instantiated such as views, forms. These blocks will allow the use of context keys inside their children. Context keys begin with "$". You can consume context keys inside hydrated children.'
			},
			{
				role: 'user',
				content:
					'show me a send email form inside a contact view. hydrate the contact view with the getContact for the id: The contact ID is 0rjnbjd-rjdn-qiej. You can get the contact using the find By id action.'
			}
		]
	})

	console.dir(ui, { depth: null })
}

buildUI('')
