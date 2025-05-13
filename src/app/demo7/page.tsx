import { createAction, createActionsExecutor } from '@rubriclab/actions'
import { OpenAI } from 'openai'
import { z } from 'zod'
import { actions } from './actions-def'
import { blocks } from './blocks-def'
import { createChainSchema } from './chains'
import { UI } from './client'
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})
// const { response_format } = createChainSchema({ ...blocks, ...actions })

// const { response_format } = createActionsExecutor({
// 	getLeads: createAction({
// 		schema: {
// 			input: z.object({}),
// 			output: z.object({})
// 		},
// 		execute: async () => {
// 			return {}
// 		}
// 	})
// })

const structured = {
	type: 'json_schema',
	name: 'chain_format',
	schema: {
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		properties: {
			chain: {
				anyOf: [{ $ref: '#/definitions/table' }]
			}
		},
		required: ['chain'],
		additionalProperties: false,
		definitions: {
			Schema_String: { type: 'string' },
			Schema_Number: { type: 'number' },

			Schema_Location_7f3e9a4c: {
				type: 'object',
				properties: {
					country: { $ref: '#/definitions/Schema_String' },
					city: { $ref: '#/definitions/Schema_String' },
					address: { $ref: '#/definitions/Schema_String' },
					zip: { $ref: '#/definitions/Schema_String' },
					phone: { $ref: '#/definitions/Schema_String' },
					email: { $ref: '#/definitions/Schema_String' }
				},
				required: ['country', 'city', 'address', 'zip', 'phone', 'email'],
				additionalProperties: false
			},

			Schema_Company_b912d2e0: {
				type: 'object',
				properties: {
					name: { $ref: '#/definitions/Schema_String' },
					industry: {
						type: 'string',
						enum: ['tech', 'finance', 'healthcare', 'education', 'other']
					},
					location: { $ref: '#/definitions/Schema_Location_7f3e9a4c' }
				},
				required: ['name', 'industry', 'location'],
				additionalProperties: false
			},

			Schema_Lead_3c6f2e11: {
				type: 'object',
				properties: {
					id: { $ref: '#/definitions/Schema_Number' },
					name: { $ref: '#/definitions/Schema_String' },
					source: {
						type: 'string',
						enum: ['linkedin', 'website', 'referral']
					},
					position: { $ref: '#/definitions/Schema_String' },
					company: { $ref: '#/definitions/Schema_Company_b912d2e0' }
				},
				required: ['id', 'name', 'source', 'position', 'company'],
				additionalProperties: false
			},

			getLeads: {
				type: 'object',
				properties: {
					action: { type: 'string', const: 'getLeads' },
					params: {
						type: 'object',
						properties: {},
						required: [],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false
			},

			mapper_Lead_STRING: {
				type: 'object',
				properties: {
					action: { type: 'string', const: 'mapper_Lead_STRING' },
					params: {
						type: 'object',
						properties: {
							key: {
								type: 'string',
								enum: ['name', 'source', 'position']
							},
							data: { $ref: '#/definitions/ValueOf_Lead' }
						},
						required: ['key', 'data'],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false
			},

			mapper_Lead_NUMBER: {
				type: 'object',
				properties: {
					action: { type: 'string', const: 'mapper_Lead_NUMBER' },
					params: {
						type: 'object',
						properties: {
							key: { type: 'string', enum: ['id'] },
							data: { $ref: '#/definitions/ValueOf_Lead' }
						},
						required: ['key', 'data'],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false
			},

			mapper_Lead_COMPANY: {
				type: 'object',
				properties: {
					action: { type: 'string', const: 'mapper_Lead_COMPANY' },
					params: {
						type: 'object',
						properties: {
							key: { type: 'string', const: 'company' },
							data: { $ref: '#/definitions/ValueOf_Lead' }
						},
						required: ['key', 'data'],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false
			},

			mapper_Company_STRING: {
				type: 'object',
				properties: {
					action: { type: 'string', const: 'mapper_Company_STRING' },
					params: {
						type: 'object',
						properties: {
							key: {
								type: 'string',
								enum: ['name', 'industry']
							},
							data: { $ref: '#/definitions/ValueOf_Company' }
						},
						required: ['key', 'data'],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false
			},

			mapper_Company_LOCATION: {
				type: 'object',
				properties: {
					action: { type: 'string', const: 'mapper_Company_LOCATION' },
					params: {
						type: 'object',
						properties: {
							key: { type: 'string', const: 'location' },
							data: { $ref: '#/definitions/ValueOf_Company' }
						},
						required: ['key', 'data'],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false
			},

			mapper_Location_STRING: {
				type: 'object',
				properties: {
					action: { type: 'string', const: 'mapper_Location_STRING' },
					params: {
						type: 'object',
						properties: {
							key: {
								type: 'string',
								enum: ['country', 'city', 'address', 'zip', 'phone', 'email']
							},
							data: { $ref: '#/definitions/ValueOf_Location' }
						},
						required: ['key', 'data'],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false
			},

			ValueOf_LeadArray: {
				type: ['array', 'object'],
				anyOf: [
					{
						type: 'array',
						items: { $ref: '#/definitions/Schema_Lead_3c6f2e11' }
					},
					{ $ref: '#/definitions/getLeads' }
				]
			},

			ValueOf_Lead: {
				type: 'object',
				anyOf: [{ $ref: '#/definitions/Schema_Lead_3c6f2e11' }]
			},

			ValueOf_Company: {
				type: 'object',
				anyOf: [
					{ $ref: '#/definitions/Schema_Company_b912d2e0' },
					{ $ref: '#/definitions/mapper_Lead_COMPANY' }
				]
			},

			ValueOf_Location: {
				type: 'object',
				anyOf: [
					{ $ref: '#/definitions/Schema_Location_7f3e9a4c' },
					{ $ref: '#/definitions/mapper_Company_LOCATION' }
				]
			},

			ValueOf_String: {
				type: ['string', 'object'],
				anyOf: [
					{ $ref: '#/definitions/Schema_String' },
					{ $ref: '#/definitions/mapper_Lead_STRING' },
					{ $ref: '#/definitions/mapper_Company_STRING' },
					{ $ref: '#/definitions/mapper_Location_STRING' }
				]
			},

			ValueOf_Number: {
				type: ['number', 'object'],
				anyOf: [{ $ref: '#/definitions/Schema_Number' }, { $ref: '#/definitions/mapper_Lead_NUMBER' }]
			},

			TableColumnString: {
				type: 'object',
				properties: {
					name: { $ref: '#/definitions/Schema_String' },
					data: { $ref: '#/definitions/ValueOf_String' }
				},
				required: ['name', 'data'],
				additionalProperties: false
			},

			TableColumnNumber: {
				type: 'object',
				properties: {
					name: { $ref: '#/definitions/Schema_String' },
					data: { $ref: '#/definitions/ValueOf_Number' }
				},
				required: ['name', 'data'],
				additionalProperties: false
			},

			TableProps: {
				type: 'object',
				properties: {
					rows: { $ref: '#/definitions/ValueOf_LeadArray' },
					columns: {
						type: 'array',
						items: {
							anyOf: [
								{ $ref: '#/definitions/TableColumnString' },
								{ $ref: '#/definitions/TableColumnNumber' }
							]
						}
					}
				},
				required: ['rows', 'columns'],
				additionalProperties: false
			},

			table: {
				type: 'object',
				properties: {
					block: { type: 'string', const: 'table' },
					props: { $ref: '#/definitions/TableProps' }
				},
				required: ['block', 'props'],
				additionalProperties: false
			}
		}
	},
	$brand: 'auto-parseable-response-format'
} as const
// console.dir(structured, { depth: null })

const response = await openai.responses.create({
	model: 'gpt-4.1',
	input: [
		{
			role: 'system',
			content: `You are a fullstack chaining agent.
You are responsible for generating structured payloads that compose blocks (an abstraction of components) and actions (an abstraction of API) into functional fullstack.

In this architecture, all actions and blocks are transformers.

Actions:
- Take as input some type
- Return as output some type
- Some actions return nothing or take nothing
- Actions can be chained together if their outputs are compatible with another actions input.
- For example, given a StringToNumber action and a NumberToString action, you could theoretically chain them together infinitely, since their IO are compatible.
Blocks:
- Similarly, blocks are transformers of data, and take input and output, often with a user interaction in the middle that blocks the transformation.
- Many actions take nothing as input and 'produce' data (awaiting some user action). Others take inputs and 'sink' data — meaning they just display some information.
- Other blocks 'transform data' by providing some UI to the user that asks them to do some interaction that returns something.

Blocks and actions are made to be chained together to create complex and powerful snippets of functionality. To make effective chains, you must consider the full lifecycle of data.

The structured output creates a schema that allows for any input to be either supplied via hardcoding, or nested with an action or block that produces a compatible output. Thus, you should think deeply about whether to supply literal values to actions and blocks, or whether you should nest.

The outputted payload you provide will be programatically rendered and executed, with client/server boundaries solved under the hood — thus your entire role when considering the chain is to think of a solution to the request that transforms data correctly. If you decide to output something with nested blocks, actions, etc. the runtime will cleverly await data. If there is an unblocked action deep in the chain that supplies some block, it will run immediately and hydrate that block with data, but if that block blocks a mutation upstream, then its interaction from the user will be awaited before the top level mutation executes.

Avoid hardcoding literal values unless the user has explicitly identified this value, nest IO and actions to create powerful snippets of data transformation and UI.

Do not submit partial chains, always submit the entire chain.

Good luck, you can do it 🦾`
		},
		{
			role: 'user',
			content: 'show me a very basic example'
		}
	],
	text: {
		format: structured
	}
})

console.dir(response, { depth: null })

// const t = {
// 	type: "json_schema",
// 	name: "chain_format",
// 	schema: {
// 	  $schema: "http://json-schema.org/draft-07/schema#",
// 	  type: "object",
// 	  properties: {
// 		chain: {
// 		  anyOf: [
// 			{
// 			  $ref: "#/definitions/textInput",
// 			}
// 		  ],
// 		},
// 	  },
// 	  required: [ "chain" ],
// 	  additionalProperties: false,
// 	  definitions: {
// 		textInput: {
// 		  type: "object",
// 		  properties: {
// 			block: {
// 			  type: "string",
// 			  const: "textInput",
// 			},
// 			props: {
// 			  type: "object",
// 			  properties: {
// 				size: {
// 				  type: "string",
// 				  enum: [ "small", "large" ],
// 				},
// 			  },
// 			  required: [ "size" ],
// 			  additionalProperties: false,
// 			},
// 		  },
// 		  required: [ "block", "props" ],
// 		  additionalProperties: false,
// 		},
// 		select: {
// 		  type: "object",
// 		  properties: {
// 			block: {
// 			  type: "string",
// 			  const: "select",
// 			},
// 			props: {
// 			  type: "object",
// 			  properties: {
// 				values: {
// 				  anyOf: [
// 					{
// 					  type: "array",
// 					  items: {
// 						type: "object",
// 						properties: {
// 						  id: {
// 							type: "string",
// 						  },
// 						  email: {
// 							type: "string",
// 						  },
// 						},
// 						required: [ "id", "email" ],
// 						additionalProperties: false,
// 					  },
// 					}, {
// 					  $ref: "#/definitions/getContacts",
// 					}
// 				  ],
// 				},
// 			  },
// 			  required: [ "values" ],
// 			  additionalProperties: false,
// 			},
// 		  },
// 		  required: [ "block", "props" ],
// 		  additionalProperties: false,
// 		},
// 		button: {
// 		  type: "object",
// 		  properties: {
// 			block: {
// 			  type: "string",
// 			  const: "button",
// 			},
// 			props: {
// 			  type: "object",
// 			  properties: {
// 				label: {
// 				  anyOf: [
// 					{
// 					  type: "string",
// 					}, {
// 					  $ref: "#/definitions/textInput",
// 					}, {
// 					  $ref: "#/definitions/button",
// 					}, {
// 					  $ref: "#/definitions/tableField",
// 					}
// 				  ],
// 				},
// 			  },
// 			  required: [ "label" ],
// 			  additionalProperties: false,
// 			},
// 		  },
// 		  required: [ "block", "props" ],
// 		  additionalProperties: false,
// 		},
// 		tableRow: {
// 		  type: "object",
// 		  properties: {
// 			block: {
// 			  type: "string",
// 			  const: "tableRow",
// 			},
// 			props: {
// 			  type: "object",
// 			  properties: {
// 				fields: {
// 				  type: "array",
// 				  items: {
// 					type: "string",
// 				  },
// 				},
// 			  },
// 			  required: [ "fields" ],
// 			  additionalProperties: false,
// 			},
// 		  },
// 		  required: [ "block", "props" ],
// 		  additionalProperties: false,
// 		},
// 		tableField: {
// 		  type: "object",
// 		  properties: {
// 			block: {
// 			  type: "string",
// 			  const: "tableField",
// 			},
// 			props: {
// 			  type: "object",
// 			  properties: {
// 				field: {
// 				  anyOf: [
// 					{
// 					  type: "string",
// 					}, {
// 					  $ref: "#/definitions/textInput",
// 					}, {
// 					  $ref: "#/definitions/button",
// 					}, {
// 					  $ref: "#/definitions/tableField",
// 					}
// 				  ],
// 				},
// 			  },
// 			  required: [ "field" ],
// 			  additionalProperties: false,
// 			},
// 		  },
// 		  required: [ "block", "props" ],
// 		  additionalProperties: false,
// 		},
// 		sendEmail: {
// 		  type: "object",
// 		  properties: {
// 			action: {
// 			  type: "string",
// 			  const: "sendEmail",
// 			},
// 			params: {
// 			  type: "object",
// 			  properties: {
// 				to: {
// 				  anyOf: [
// 					{
// 					  type: "object",
// 					  properties: {
// 						id: {
// 						  type: "string",
// 						},
// 						email: {
// 						  type: "string",
// 						},
// 					  },
// 					  required: [ "id", "email" ],
// 					  additionalProperties: false,
// 					}, {
// 					  $ref: "#/definitions/select",
// 					}
// 				  ],
// 				},
// 				subject: {
// 				  anyOf: [
// 					{
// 					  type: "string",
// 					}, {
// 					  $ref: "#/definitions/textInput",
// 					}, {
// 					  $ref: "#/definitions/button",
// 					}, {
// 					  $ref: "#/definitions/tableField",
// 					}
// 				  ],
// 				},
// 				body: {
// 				  anyOf: [
// 					{
// 					  type: "string",
// 					}, {
// 					  $ref: "#/definitions/textInput",
// 					}, {
// 					  $ref: "#/definitions/button",
// 					}, {
// 					  $ref: "#/definitions/tableField",
// 					}
// 				  ],
// 				},
// 			  },
// 			  required: [ "to", "subject", "body" ],
// 			  additionalProperties: false,
// 			},
// 		  },
// 		  required: [ "action", "params" ],
// 		  additionalProperties: false,
// 		},
// 		getContacts: {
// 		  type: "object",
// 		  properties: {
// 			action: {
// 			  type: "string",
// 			  const: "getContacts",
// 			},
// 			params: {
// 			  type: "object",
// 			  properties: {},
// 			  required: [],
// 			  additionalProperties: false,
// 			},
// 		  },
// 		  required: [ "action", "params" ],
// 		  additionalProperties: false,
// 		},
// 	  },
// 	},
// 	$brand: "auto-parseable-response-format",
// 	$parseRaw: [Function: $parseRaw],
//   }

// const VOID_UI = {
// 	block: 'void',
// 	props: {}
// }

// table takes as input an ARRAY of objects, where each key is associated with VOID_UI or a string or something

// const table = {
// 	block: 'table',
// 	props: {
// 		cells: [
// 			{
// 				name: 'name',
// 				data: {
// 					action: 'mapper_LeadKeysThatReturn_STRING',
// 					params: {
// 						key: '$.name',
// 						data: {
// 							action: 'getLeads',
// 							params: {}
// 						}
// 					}
// 				}
// 			},
// 			{
// 				name: 'lat',
// 				data: {
// 					action: 'mapper_LocationKeysThatReturn_NUMBER',
// 					params: {
// 						key: '$.lat',
// 						data: {
// 							action: 'mapper_CompanyKeysThatReturn_LOCATION',
// 							params: {
// 								key: '$.location',
// 								data: {
// 									action: 'mapper_LeadKeysThatReturn_COMPANY',
// 									params: {
// 										key: '$.company',
// 										data: {
// 											action: 'getLeads',
// 											params: {}
// 										}
// 									}
// 								}
// 							}
// 						}
// 					}
// 				}
// 			}
// 		]
// 	}
// }

// const definitions = [
// 	{
// 		name: 'things that output number',
// 		schema: {
// 			anyOf: [
// 				'number',
// 				'mapper_LocationKeysThatReturn_NUMBER',
// 				'mapper_CompanyKeysThatReturn_NUMBER',
// 				'mapper_LeadKeysThatReturn_NUMBER'
// 			]
// 		}
// 	}
// ]

// const mapLeads = createAction({
// 	schema: {
// 		input: z.object({
// 			data: z.array(
// 				z.object({ name: z.string(), location: z.object({ lat: z.number(), lng: z.number() }) })
// 			)
// 		}),
// 		output: z.object({})
// 	},
// 	execute: async ({ input }) => {
// 		return input
// 	}
// })

// const { execute } = createActionsExecutor({ mapLeads })

// execute({
// 	action: 'mapLeads',
// 	params: {
// 		data: {
// 			action: 'getLeads',
// 			params: {},
// 			mapper: {}
// 		}
// 	}
// })

// we have a data type that returns [{name: string, location: {lat: number, lng: number}}]

// we need a mapper that turns the action into the table input

// const table2 = {
// 	props: {
// 		data: {
// 			action: 'mapLeads',
// 			params: {
// 				data: {
// 					action: 'getLeads',
// 					params: {}
// 				},
// 				mapper: {
// 					name: true,
// 					location: {
// 						action: 'mapLocation'
// 					}
// 				}
// 			}
// 		}
// 	}
// }

// PROMBLEMS: - can an LLM take that much BS?

// const t = {
// 	action: 'mapper_LocationKeysThatReturn_NUMBER',
// 	params: {
// 		key: '$.lat',
// 		data: {
// 			action: 'mapper_CompanyKeysThatReturn_LOCATION',
// 			params: {
// 				key: '$.location',
// 				data: {
// 					action: 'mapper_LeadKeysThatReturn_COMPANY',
// 					params: {
// 						key: '$.company',
// 						data: {
// 							action: 'getLeads',
// 							params: {}
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// }
