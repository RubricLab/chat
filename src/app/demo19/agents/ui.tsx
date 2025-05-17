import { registry, z } from 'zod'
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
})

const [STRING, STRING_INPUT] = uiRegistry.createCompatabilitySlot({
	name: 'string',
	schema: z.string()
})

const [CONTACT, CONTACT_INPUT] = uiRegistry.createCompatabilitySlot({
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

const instantiateForm = createGenericActionExecutorBlock({
	actionOptions: actions,
	instantiate({ action }) {
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
		return createBlock({
			schema: {
				input: {
					hydrate: types[type],
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
		name: 'InstantiationSchema',
		schema: instantiationSchema,
		registry: instantiationRegistry.zodRegistry
	})

	console.dir(instantiationResponseFormat, { depth: null })

	const { instantiations } = await createStructuredOutputInference({
		openAIApiKey: process.env.OPENAI_API_KEY ?? (undefined as never),
		responseFormat: instantiationResponseFormat,
		messages: [{ role: 'user', content: 'instantiate a contact view and a form' }]
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
		name: 'ui_2',
		schema: z.object({
			ui: z.array(uiRegistry.rootSchema)
		}),
		registry: uiRegistry.zodRegistry
	})

	console.dir(uiResponseFormat, { depth: null })

	const { ui } = await createStructuredOutputInference({
		openAIApiKey: process.env.OPENAI_API_KEY ?? (undefined as never),
		responseFormat: uiResponseFormat,
		messages: [{ role: 'user', content: 'show me a form inside a contact view.' }]
	})

	console.dir(ui, { depth: null })
}

buildUI('')
