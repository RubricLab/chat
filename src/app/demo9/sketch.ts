import { OpenAI } from 'openai'
import { zodToJsonSchema } from 'openai/_vendor/zod-to-json-schema/zodToJsonSchema.mjs'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const Location = z.object({
	country: z.string(),
	city: z.string(),
	address: z.string(),
	zip: z.string(),
	phone: z.string(),
	email: z.string()
})

const Company = z.object({
	name: z.string(),
	industry: z.string(),
	location: Location
})

const Lead = z.object({
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	company: Company
})

const actions = {
	getLeads: z.object({
		action: z.literal('getLeads'),
		params: z.object({})
	})
}

const blocks = {
	table: z.object({
		block: z.literal('table'),
		props: z.object({
			data: z.array(z.array(z.string()))
		})
	})
}

// function createMappers(actions) {}

function createChainFormat(schema: Record<string, z.ZodTypeAny>) {}

const zodSchema = z
	.object({ name: z.string() })(
		// Comment out this code since it's not being properly used
		// function makeResponseFormat(schema: z.ZodObject<any>) {
		// 	const obj = {
		// 		type: 'json_schema' as const,
		// 		name: 'chain_format',
		// 		strict: true,
		// 		schema: createChainFormat({ ...actions, ...blocks, ...mappers })
		// 	}
		// 	Object.defineProperties(obj, {
		// 		$brand: {
		// 			value: 'auto-parseable-response-format',
		// 			enumerable: false
		// 		},
		// 		$parseRaw: {
		// 			value: (content: string) => zodSchema.parse(JSON.parse(content)),
		// 			enumerable: false
		// 		}
		// 	})

		// 	return obj
		// }

		// const structured_output = makeResponseFormat(zodSchema)
		// console.dir(structured_output, { depth: null })

		// Fix for top-level await - wrap in an IIFE
		async () => {
			const { output_parsed } = await openai.responses.parse({
				model: 'gpt-4.1',
				input: [
					{
						role: 'user',
						content: 'show me a very basic example'
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
											$ref: '#/definitions/getLeads'
										},
										{
											$ref: '#/definitions/table'
										}
									]
								}
							},
							required: ['chain'],
							additionalProperties: false,
							definitions: {
								MAPPER_THAT_OUTPUTS_LOCATION: {
									type: 'object',
									properties: {
										map: { type: 'string', const: 'location' },
										key: {
											anyOf: [{ type: 'string', const: 'location' }]
										}
									},
									required: ['map', 'key'],
									additionalProperties: false
								},
								RETURNS_COMPANY: {
									type: 'object',
									properties: {
										name: { type: 'string' },
										industry: { type: 'string' }
									},
									required: ['name', 'industry'],
									additionalProperties: false
								},
								MAP_COMPANY_TO_STRING: {
									type: 'object',
									properties: {
										map: { type: 'string', const: 'company' },
										key: {
											anyOf: [
												{ type: 'string', const: 'name' },
												{ type: 'string', const: 'industry' }
											]
										},
										data: { $ref: '#/definitions/RETURNS_COMPANY' }
									},
									required: ['map', 'key', 'data'],
									additionalProperties: false
								},
								RETURNS_LOCATION: {
									anyOf: [{ $ref: '#/definitions/MAPPER_THAT_OUTPUTS_LOCATION' }]
								},
								MAP_LOCATION_TO_STRING: {
									type: 'object',
									properties: {
										map: { type: 'string', const: 'location' },
										key: {
											anyOf: [
												{ type: 'string', const: 'country' },
												{ type: 'string', const: 'city' },
												{ type: 'string', const: 'address' },
												{ type: 'string', const: 'zip' },
												{ type: 'string', const: 'phone' },
												{ type: 'string', const: 'email' }
											]
										},
										data: { $ref: '#/definitions/RETURNS_LOCATION' }
									},
									required: ['map', 'key', 'data'],
									additionalProperties: false
								},
								MAP_LEAD_TO_STRING: {
									type: 'object',
									properties: {
										map: { type: 'string', const: 'lead' },
										key: {
											anyOf: [
												{ type: 'string', const: 'name' },
												{ type: 'string', const: 'email' },
												{ type: 'string', const: 'phone' }
											]
										},
										data: { $ref: '#/definitions/LEAD' }
									},
									required: ['map', 'key', 'data'],
									additionalProperties: false
								},
								MAPPER_THAT_OUTPUTS_STRING: {
									anyOf: [
										{
											$ref: '#/definitions/MAP_LOCATION_TO_STRING'
										},
										{
											$ref: '#/definitions/MAP_LEAD_TO_STRING'
										},
										{
											$ref: '#/definitions/MAP_COMPANY_TO_STRING'
										}
									]
								},
								RETURNS_STRING: {
									anyOf: [
										{
											type: 'string'
										},
										{
											$ref: '#/definitions/MAPPER_THAT_OUTPUTS_STRING'
										}
									]
								},

								LEAD: {
									type: 'object',
									properties: {
										name: {
											type: 'string'
										},
										email: {
											type: 'string'
										},
										phone: {
											type: 'string'
										}
									},
									required: ['name'],
									additionalProperties: false
								},
								TABLE: {
									type: 'array',
									items: {
										type: 'array',
										items: {
											$ref: '#/definitions/RETURNS_STRING'
										}
									}
								},
								getLeads: {
									type: 'object',
									properties: {
										action: {
											type: 'string',
											const: 'getLeads'
										},
										params: {
											$ref: '#/definitions/LEAD'
										}
									},
									required: ['action', 'params'],
									additionalProperties: false
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
													$ref: '#/definitions/TABLE'
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
		}
	)()
	.catch(console.error)
