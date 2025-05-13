import { OpenAI } from 'openai'
import z from 'zod'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const Contact = z.object({
	name: z.string(),
	email: z.string()
})

const Email = z.object({
	to: Contact,
	subject: z.string(),
	body: z.string()
})

// instantiate form<sendEmail>, select <Contact>

const { output } = await openai.responses.create({
	model: 'gpt-4.1',
	input: [
		{
			role: 'user',
			content: 'send an email. the params should be a form. The to should be a select'
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
								$ref: '#/$defs/Select_CONTACT'
							},
							{
								$ref: '#/$defs/Form_EMAIL'
							}
						]
					},
					Select_CONTACT: {
						type: 'object',
						properties: {
							block: { type: 'string', const: 'Select_CONTACT' },
							params: {
								type: 'object',
								properties: {
									data: { $ref: '#/$defs/Produce_CONTACTARRAY' }
								},
								required: ['data'],
								additionalProperties: false
							}
						},
						required: ['block', 'params'],
						additionalProperties: false
					},
					Produce_CONTACTARRAY: {
						anyOf: [{ $ref: '#/$defs/getContacts' }]
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
					Form_EMAIL: {
						type: 'object',
						properties: {
							block: { type: 'string', const: 'Form_EMAIL' },
							params: {
								type: 'object',
								properties: {
									fields: {
										$ref: '#/$defs/Produce_EMAIL'
									},
									onSubmit: {
										type: 'string',
										const: 'sendEmail'
									}
								},
								required: ['fields', 'onSubmit'],
								additionalProperties: false
							}
						},
						required: ['block', 'params'],
						additionalProperties: false
					},
					Produce_EMAIL: {
						type: 'object',
						properties: {
							to: { $ref: '#/$defs/Produce_CONTACT' },
							subject: { $ref: '#/$defs/Produce_STRING' },
							body: { $ref: '#/$defs/Produce_STRING' }
						},
						required: ['to', 'subject', 'body'],
						additionalProperties: false
					},
					Produce_STRING: {
						anyOf: [{ $ref: '#/$defs/TextInput' }]
					},
					TextInput: {
						type: 'object',
						properties: {
							block: { type: 'string', const: 'TextInput' },
							params: {
								type: 'object',
								properties: {},
								additionalProperties: false
							}
						},
						required: ['block', 'params'],
						additionalProperties: false
					},
					Produce_CONTACT: {
						anyOf: [
							{ $ref: '#/$defs/Select_CONTACT' },
							{
								type: 'object',
								properties: {
									name: { $ref: '#/$defs/Produce_STRING' },
									email: { $ref: '#/$defs/Produce_STRING' }
								},
								required: ['name', 'email'],
								additionalProperties: false
							}
						]
					},
					SendEmail: {
						type: 'object',
						properties: {
							action: { type: 'string', const: 'sendEmail' },
							params: {
								type: 'object',
								properties: {
									email: { $ref: '#/$defs/Produce_EMAIL' }
								},
								required: ['email'],
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
