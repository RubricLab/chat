import { z } from 'zod'
import { createAction } from '../lib/actions'
import { createStructuredOutputInference } from '../lib/agent'
import { createBlock, createBlockProxy, createGenericBlock } from '../lib/blocks'
import { createResponseFormat } from '../lib/responseFormat'
import { createRegistry, createSchema } from '../lib/schema'

const registry = createRegistry()

const { createCompatabilitySlot, zodRegistry } = createRegistry()

/*
 *   --------------
 *   |   TYPES    |
 *   --------------
 */

const [CONTACT_ID, CONTACT_ID_INPUT] = createCompatabilitySlot({
	name: 'contactId',
	schema: z.string()
})

const [STRING, STRING_INPUT] = createCompatabilitySlot({
	name: 'string',
	schema: z.string()
})

const [CONTACT, CONTACT_INPUT] = createCompatabilitySlot({
	name: 'contact',
	schema: z.object({
		id: CONTACT_ID,
		name: STRING_INPUT
	})
})

const types = {
	CONTACT_ID,
	STRING,
	CONTACT
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

const schema = createSchema({
	actions,
	blocks,
	registry
})

/*
 *   ----------------------
 *   |   GENERIC BLOCKS   |
 *   ----------------------
 */

const instantiateView = createGenericBlock({
	typeOptions: {},
	instantiate({ type }) {
		return createBlock({
			schema: {
				input: {
					hydrate: types[type],
					children: schema
				},
				output: z.void()
			},
			render: ({ hydrate, children }) => {
				console.log(children)
				return (
					<>
						{/* {children.map((child, index) => {
							// return child({ hydrate })
						})} */}
					</>
				)
			}
		})
	}
})

const instantiateForm = createGenericBlock({
	typeOptions: Object.fromEntries(
		Object.entries(actions).map(([name, action]) => [name, action.schema.input])
	),
	instantiate({ type }) {
		return createBlock({
			schema: { input: { hydrate: types[type], children: schema }, output: z.void() }
		})
	}
})

// const renderViewTool = buildBlockProxy({ name: 'renderView', input: renderView.schema.input })

// const schema = z.object({
// 	toolCalls: z.array(z.union([renderViewTool]))
// })

async function buildUI(prompt: string) {
	const instantiationSchema = z.object({
		instantiations: z.array(
			createSchema({
				actions: {
					instantiateView,
					instantiateForm
				},
				blocks: {},
				registry
			})
		)
	})

	const { instantiations } = await createStructuredOutputInference({
		openAIApiKey: process.env.OPENAI_API_KEY ?? (undefined as never),
		responseFormat: createResponseFormat({
			name: 'InstantiationSchema',
			schema: instantiationSchema,
			registry: zodRegistry
		}),
		messages: [{ role: 'user', content: 'render a contact view' }]
	})

	const instantiated = instantiations.map(instantiation => {
		if ('action' in instantiation) {
			const { action, params } = instantiation
			switch (action) {
				case 'action_renderView': {
					const newBlock = renderView.instantiate(params)
					return createBlockProxy({ name: `view_${params.type}`, input: newBlock.schema.input })
				}
			}
		}
	})

	const responseFormat2 = createResponseFormat({
		name: 'ui_2',
		schema: z.object({
			ui: z.array(z.union([...instantiated]))
		}),
		registry
	})

	// console.dir(responseFormat2, { depth: null })

	const { ui } = await createStructuredOutputInference({
		openAIApiKey: process.env.OPENAI_API_KEY ?? (undefined as never),
		responseFormat: responseFormat2,
		messages: [{ role: 'user', content: 'render a contact view' }]
	})

	console.dir(ui, { depth: null })
}

buildUI('')
