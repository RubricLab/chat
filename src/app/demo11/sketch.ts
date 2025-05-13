import { OpenAI } from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const Company = z.object({
	name: z.string(),
	industry: z.string()
})

const Contact = z.object({
	name: z.string(),
	email: z.string(),
	company: Company
})

const actions = {
	getContacts: z.object({
		action: z.literal('getContacts'),
		params: z.object({})
	})
}

const blocks = {
	table: z.object({
		block: z.literal('table'),
		props: z.object({
			data: z.array(z.array(z.union([z.string(), z.number(), z.void()])))
		})
	})
}

const { output_parsed } = await openai.responses.parse({
	model: 'o4-mini',
	input: [
		{
			role: 'user',
			content: 'show me a table of contacts, also include the company data'
		}
	],
	text: {
		format: {
			type: 'json_schema',
			name: 'chain_format',
			schema: {
				$schema: 'http://json-schema.org/draft-07/schema#',
				type: 'object',
				properties: {
					chain: {
						anyOf: [
							{
								$ref: '#/definitions/table'
							}
						]
					}
				},
				required: ['chain'],
				additionalProperties: false,
				definitions: {
					// actions
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

					OUTPUTS_CONTACT_ARRAY: {
						anyOf: [
							{
								$ref: '#/definitions/getContacts'
							}
						]
					},
					MAP_CONTACT_ARRAY_TO_COMPANY_ARRAY: {
						type: 'object',
						properties: {
							map: { type: 'string', const: 'contact_array' },
							key: {
								anyOf: [{ type: 'string', const: 'company' }]
							},
							data: {
								$ref: '#/definitions/OUTPUTS_CONTACT_ARRAY'
							}
						},
						required: ['map', 'key', 'data'],
						additionalProperties: false
					},

					OUTPUTS_COMPANY_ARRAY: {
						anyOf: [
							// {
							// 	type: 'object',
							// 	properties: {
							// 		name: { type: 'string' },
							// 		industry: { type: 'string' }
							// 	},
							// 	required: ['name', 'industry'],
							// 	additionalProperties: false
							// },
							{
								$ref: '#/definitions/MAP_CONTACT_ARRAY_TO_COMPANY_ARRAY'
							}
						]
					},
					MAP_CONTACT_ARRAY_TO_STRING_ARRAY: {
						type: 'object',
						properties: {
							map: { type: 'string', const: 'contact_array' },
							key: {
								anyOf: [
									{ type: 'string', const: 'name' },
									{ type: 'string', const: 'email' }
								]
							},
							data: { $ref: '#/definitions/OUTPUTS_CONTACT_ARRAY' }
						},
						required: ['map', 'key', 'data'],
						additionalProperties: false
					},
					MAP_COMPANY_ARRAY_TO_STRING_ARRAY: {
						type: 'object',
						properties: {
							map: { type: 'string', const: 'company_array' },
							key: {
								anyOf: [
									{ type: 'string', const: 'name' },
									{ type: 'string', const: 'industry' }
								]
							},
							data: {
								$ref: '#/definitions/OUTPUTS_COMPANY_ARRAY'
							}
						},
						required: ['map', 'key', 'data'],
						additionalProperties: false
					},
					OUTPUTS_STRING_ARRAY: {
						anyOf: [
							// {
							// 	type: 'string'
							// },
							{
								$ref: '#/definitions/MAP_COMPANY_ARRAY_TO_STRING_ARRAY'
							},
							{
								$ref: '#/definitions/MAP_CONTACT_ARRAY_TO_STRING_ARRAY'
							}
						]
					},
					table: {
						type: 'object',
						properties: {
							block: {
								type: 'string',
								const: 'table'
							},
							props: {
								type: 'object',
								properties: {
									data: {
										type: 'array',
										items: {
											anyOf: [{ $ref: '#/definitions/OUTPUTS_STRING_ARRAY' }]
										}
									}
								},
								required: ['data'],
								additionalProperties: false
							}
						},
						required: ['block', 'props'],
						additionalProperties: false
					}
				}
			}
		}
	}
})

console.dir(output_parsed, { depth: null })
