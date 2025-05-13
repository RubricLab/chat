import { OpenAI } from 'openai'
import z from 'zod'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const Contact = z.object({
	name: z.string(),
	email: z.string()
})
// instantiate form <Contact>

const { output } = await openai.responses.create({
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
								$ref: '#/$defs/Form_CONTACT'
							}
						]
					},
					Form_CONTACT: {
						type: 'object',
						properties: {
							onSubmit: {
								$ref: '#/$defs/Consume_CONTACT'
							},
							fields: {
								$ref: '#/$defs/Produce_CONTACT'
							}
						},
						required: ['onSubmit', 'fields'],
						additionalProperties: false
					},
					Produce_CONTACT: {
						type: 'object',
						properties: {
							name: {
								$ref: '#/$defs/Produce_STRING'
							},
							email: {
								$ref: '#/$defs/Produce_STRING'
							}
						},
						required: ['name', 'email'],
						additionalProperties: false
					},
					Produce_STRING: {
						anyOf: [
							{
								$ref: '#/$defs/TextInput'
							}
						]
					},
					TextInput: {
						type: 'object',
						properties: {
							block: { type: 'string', const: 'textInput' },
							params: {
								type: 'object',
								properties: {},
								additionalProperties: false
							}
						},
						required: ['block', 'params'],
						additionalProperties: false
					},
					Consume_CONTACT: {
						anyOf: [{ $ref: '#/$defs/CreateContact_CONTACT' }]
					},
					// Traditional createContact. Unused because the instantiated one is more relevant
					CreateContact: {
						type: 'object',
						properties: {
							action: { type: 'string', const: 'createContact' },
							params: {
								type: 'object',
								properties: {
									name: { type: 'string' },
									email: { type: 'string' }
								},
								required: ['name', 'email'],
								additionalProperties: false
							}
						},
						required: ['action', 'params'],
						additionalProperties: false
					},
					// Instantiated from the creation of the form. Only available inside the form
					CreateContact_CONTACT: {
						type: 'object',
						properties: {
							action: { type: 'string', const: 'createContact' },
							params: {
								type: 'object',
								properties: {
									name: { type: 'string', const: '$name' },
									email: { type: 'string', const: '$email' }
								},
								required: ['name', 'email'],
								additionalProperties: false
							}
						},
						required: ['action', 'params'],
						additionalProperties: false
					}
				}
			}
		}
	]
})

console.dir(JSON.parse(output[0].arguments), { depth: null })
