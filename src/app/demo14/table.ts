import { OpenAI } from 'openai'
import z from 'zod'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const Contact = z.object({
	name: z.string(),
	email: z.string()
})

// instantiate table <Contact>

const { output: output2 } = await openai.responses.create({
	model: 'gpt-4.1',
	input: [
		{
			role: 'user',
			content: 'generate a table of leads with their name and companys city'
		}
	],
	tool_choice: 'required',
	parallel_tool_calls: true,
	tools: [
		{
			type: 'function',
			name: 'render_fullstack',
			description: 'renders a fullstack app',
			strict: true,
			parameters: {
				type: 'object',
				properties: {
					payload: { $ref: '#/$defs/Payload' }
				},
				required: ['payload'],
				additionalProperties: false,

				$defs: {
					Payload: {
						anyOf: [
							{
								$ref: '#/$defs/Table_CONTACT'
							}
						]
					},
					Table_CONTACT: {
						type: 'object',
						properties: {
							query: {
								$ref: '#/$defs/Produce_CONTACTARRAY'
							},
							columns: {
								type: 'object',
								properties: {
									name: { $ref: '#/$defs/Consume_STRING_CONTACT_NAME' },
									email: { $ref: '#/$defs/Consume_STRING_CONTACT_EMAIL' }
								},
								required: ['name', 'email'],
								additionalProperties: false
							}
						},
						required: ['query', 'columns'],
						additionalProperties: false
					},
					Produce_CONTACTARRAY: {
						anyOf: [
							{
								$ref: '#/$defs/getContacts'
							}
						]
					},
					getContacts: {
						type: 'object',
						properties: {
							action: { type: 'string', const: 'getContacts' },
							params: {
								type: 'object',
								properties: {},
								additionalProperties: false
							}
						},
						required: ['action', 'params'],
						additionalProperties: false
					},
					// Traditional consume_string. Unused because the instantiated one is more relevant
					Consume_STRING: {
						anyOf: [{ $ref: '#/$defs/Text' }]
					},
					Text: {
						type: 'object',
						properties: {
							block: { type: 'string', const: 'text' },
							params: {
								type: 'object',
								properties: {
									text: { type: 'string' }
								},
								required: ['text'],
								additionalProperties: false
							}
						},
						required: ['block', 'params'],
						additionalProperties: false
					},
					Consume_STRING_CONTACT_NAME: {
						anyOf: [{ $ref: '#/$defs/Text_CONTACT_NAME' }]
					},
					Consume_STRING_CONTACT_EMAIL: {
						anyOf: [{ $ref: '#/$defs/Text_CONTACT_EMAIL' }]
					},
					Text_CONTACT_NAME: {
						type: 'object',
						properties: {
							block: { type: 'string', const: 'text' },
							params: {
								type: 'object',
								properties: {
									text: { type: 'string', const: '$contact.name' }
								},
								required: ['text'],
								additionalProperties: false
							}
						},
						required: ['block', 'params'],
						additionalProperties: false
					},
					Text_CONTACT_EMAIL: {
						type: 'object',
						properties: {
							block: { type: 'string', const: 'text' },
							params: {
								type: 'object',
								properties: {
									text: { type: 'string', const: '$contact.email' }
								},
								required: ['text'],
								additionalProperties: false
							}
						},
						required: ['block', 'params'],
						additionalProperties: false
					},

					// Traditional createContact. Unused because the instantiated one is more relevant
					CreateContact: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							email: { type: 'string' }
						},
						required: ['name', 'email'],
						additionalProperties: false
					},
					// Instantiated from the creation of the form. Only available inside the form
					CreateContact_CONTACT: {
						type: 'object',
						properties: {
							name: { type: 'string', const: '$name' },
							email: { type: 'string', const: '$email' }
						},
						required: ['name', 'email'],
						additionalProperties: false
					}
				}
			}
		}
	]
})

console.dir(JSON.parse(output2[0].arguments), { depth: null })
