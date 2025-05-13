import { OpenAI } from 'openai'
import z from 'zod'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const Contact = z.object({
	name: z.string(),
	email: z.string()
})
// instantiate select <Contact>

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
								$ref: '#/$defs/Select_CONTACT'
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
					}
				}
			}
		}
	]
})

console.dir(JSON.parse(output[0].arguments), { depth: null })
