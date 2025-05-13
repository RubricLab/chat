import { OpenAI } from 'openai'
import z from 'zod'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const ContactId = z.object({
	_brand: z.literal('ContactId'),
	id: z.string()
})
const LocationId = z.object({
	_brand: z.literal('LocationId'),
	id: z.string()
})

const Contact = z.object({
	id: ContactId,
	name: z.string(),
	email: z.string(),
	company: z.string(),
	locationId: LocationId
})

const Location = z.object({
	id: LocationId,
	name: z.string(),
	address: z.string()
})

const mutations = {}

const actions = {
	getContacts: {
		schema: {
			input: z.void(),
			output: z.array(Contact)
		}
	},
	getContact: {
		schema: {
			input: z.object({
				id: ContactId
			}),
			output: Contact
		}
	},
	createContact: {
		schema: {
			input: Contact,
			output: z.void()
		}
	},
	deleteContact: {
		schema: {
			input: z.object({
				id: ContactId
			}),
			output: z.void()
		}
	},
	getLocations: {
		schema: {
			input: z.void(),
			output: z.array(Location)
		}
	},
	getLocation: {
		schema: {
			input: z.object({
				id: LocationId
			}),
			output: Location
		}
	},
	createLocation: {
		schema: {
			input: Location,
			output: z.void()
		}
	},
	deleteLocation: {
		schema: {
			input: z.object({
				id: LocationId
			}),
			output: z.void()
		}
	}
}

const topLevelTypes = {
	contact: Contact,
	location: Location,
	contactId: ContactId,
	locationId: LocationId,
	string: z.string()
}

// YOU are a 3 step agent. Instantiate Compound Actions, Instantiate Generic Components, Assemble UI
const { output } = await openai.responses.create({
	model: 'gpt-4.1',
	input: [
		{
			role: 'user',
			content: 'do something cool'
		}
	],
	tool_choice: 'required',
	parallel_tool_calls: true,
	tools: [
		{
			type: 'function',
			name: 'create_compound_action',
			description: 'instantiates a compound action chain',
			strict: true,
			parameters: {
				type: 'object',
				properties: {
					payload: { $ref: '#/$defs/Payload' }
				},
				required: ['payload'],
				additionalProperties: false
			}
		}
	]
})

// instantiated ContactWithLocation

const { output: output2 } = await openai.responses.create({
	model: 'gpt-4.1',
	input: [
		{
			role: 'user',
			content: 'do something cool'
		}
	],
	tool_choice: 'required',
	parallel_tool_calls: true,
	tools: [
		{
			type: 'function',
			name: 'create_compound_action',
			description: 'instantiates a compound action chain',
			strict: true,
			parameters: {
				type: 'object',
				properties: {
					payload: { $ref: '#/$defs/Payload' }
				},
				required: ['payload'],
				additionalProperties: false
			}
		},
		{
			type: 'function',
			name: 'instantiate_form',
			description: 'instantiates a form with a given field schema',
			strict: true,
			parameters: {
				type: 'object',
				properties: {
					field_schema: {
						type: 'string',
						enum: ['Contact', 'Location', 'ContactWithLocation']
					}
				},
				required: ['field_schema'],
				additionalProperties: false
			}
		},
		{
			type: 'function',
			name: 'instantiate_table',
			description: 'instantiates a table with a given row schema',
			strict: true,
			parameters: {
				type: 'object',
				properties: {
					row_schema: {
						type: 'string',
						enum: ['Contact', 'Location', 'ContactWithLocation']
					}
				},
				required: ['row_schema'],
				additionalProperties: false
			}
		},
		{
			type: 'function',
			name: 'instantiate_select',
			description: 'instantiates a select with a given option schema',
			strict: true,
			parameters: {
				type: 'object',
				properties: {
					option_schema: {
						type: 'string',
						enum: ['Contact', 'Location', 'ContactWithLocation']
					}
				},
				required: ['option_schema'],
				additionalProperties: false
			}
		}
	]
})

// instantated table with ContactWithLocation

const { output: output3 } = await openai.responses.create({
	model: 'gpt-4.1',
	input: [
		{
			role: 'user',
			content: 'do something cool'
		}
	],
	tool_choice: 'required',
	parallel_tool_calls: true,
	tools: [
		{
			type: 'function',
			name: 'assemble_ui',
			description: 'assembles a ui with a given component schema',
			strict: true,
			parameters: {
				type: 'object',
				properties: {
					ui: {
						anyOf: [
							{
								$ref: '#/$defs/Table'
							}
						]
					}
				},
				required: ['component_schema'],
				additionalProperties: false,
				$defs: {
					Table: {
						type: 'object',
						properties: {
							columns: {}
						}
					}
				}
			}
		}
	]
})
