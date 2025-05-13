import { createAction, createActionsExecutor } from '@rubriclab/actions'
import { z } from 'zod'

const Location = z.object({
	country: z.string(),
	city: z.string(),
	address: z.string(),
	zip: z.string(),
	phone: z.string(),
	email: z.string()
})

// const CompanyID = z.object({
// 	_: z.literal('company_id'),
// 	id: z.string()
// })

const pixel = z.object({
	_: z.literal('pixel_value'),
	px: z.string()
})

const Company = z.object({
	// id: CompanyID,
	name: z.string(),
	industry: z.enum(['tech', 'finance', 'healthcare', 'education', 'other']),
	location: Location
})

const Lead = z.object({
	id: z.number(),
	name: z.string(),
	source: z.enum(['linkedin', 'website', 'referral']),
	position: z.string(),
	company: Company
})

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`

type DotNestedKeys<T> = (
	T extends object
		? {
				[K in keyof T]: K extends string ? `${K}` | `${K}${DotPrefix<DotNestedKeys<T[K]>>}` : never
			}[keyof T]
		: ''
) extends infer D
	? Extract<D, string>
	: never

const mapper = z.custom<`$.${DotNestedKeys<z.infer<typeof Lead>>}`>()

// const mapperThatOutputsString

const prompt = 'generate a table of leads with their company industry and location city'

const getCompanyById = createAction({
	schema: {
		input: z.object({ id: z.number() }),
		output: Company
	},
	execute: async v => {
		return {
			name: 'Google',
			industry: 'tech' as const,
			location: {
				country: 'USA',
				city: 'Mountain View',
				address: '1600 Amphitheatre Parkway',
				zip: '94043',
				phone: '650-253-0000',
				email: 'contact@google.com'
			}
		}
	}
})

const getLeads = createAction({
	schema: {
		input: z.object({}),
		output: z.array(Lead)
	},
	execute: async v => {
		// TODO: get leads from database
	}
})

const getCompanyById = createAction({
	schema: {
		input: z.object({ id: z.number() }),
		output: Company
	},
	execute: async v => {
		// TODO: get company from database
	}
})

const { execute } = createActionsExecutor({
	getLeads,
	getCompanyById
})

execute({
	action: 'getCompanyById',
	params: {
		id: {
			action: 'getLeads',
			params: {}
		} // .companyId ?!?!? how?
	}
})

render({
	block: 'table',
	params: {
		data: [
			{
				name: {
					action: 'getLeads',
					params: {}
					// .id ?!?!? how?
				}
			}
		]
	}
})




const t = {
	type: "json_schema",
	name: "chain_format",
	schema: {
	  $schema: "http://json-schema.org/draft-07/schema#",
	  type: "object",
	  properties: {
		chain: {
		  anyOf: [
			{
			  $ref: "#/definitions/textInput",
			}, {
			  $ref: "#/definitions/select",
			}, {
			  $ref: "#/definitions/button",
			}, {
			  $ref: "#/definitions/tableRow",
			}, {
			  $ref: "#/definitions/tableField",
			}, {
			  $ref: "#/definitions/sendEmail",
			}, {
			  $ref: "#/definitions/getContacts",
			}
		  ],
		},
	  },
	  required: [ "chain" ],
	  additionalProperties: false,
	  definitions: {
		Schema_3442496b: {
		  type: "string",
		},
		Schema_916b1433: {
		  type: "object",
		  properties: {
			id: {
			  type: "string",
			},
			email: {
			  type: "string",
			},
		  },
		  required: [ "id", "email" ],
		  additionalProperties: false,
		},
		Schema_e9cede9b: {
		  type: "null",
		  description: "void",
		},
		Schema_0551012c: {
		  type: "array",
		  items: {
			type: "object",
			properties: {
			  id: {
				type: "string",
			  },
			  email: {
				type: "string",
			  },
			},
			required: [ "id", "email" ],
			additionalProperties: false,
		  },
		},
		textInput: {
		  type: "object",
		  properties: {
			block: {
			  type: "string",
			  const: "textInput",
			},
			props: {
			  type: "object",
			  properties: {
				size: {
				  type: "string",
				  enum: [ "small", "large" ],
				},
			  },
			  required: [ "size" ],
			  additionalProperties: false,
			},
		  },
		  required: [ "block", "props" ],
		  additionalProperties: false,
		},
		select: {
		  type: "object",
		  properties: {
			block: {
			  type: "string",
			  const: "select",
			},
			props: {
			  type: "object",
			  properties: {
				values: {
				  anyOf: [
					{
					  type: "array",
					  items: {
						type: "object",
						properties: {
						  id: {
							type: "string",
						  },
						  email: {
							type: "string",
						  },
						},
						required: [ "id", "email" ],
						additionalProperties: false,
					  },
					}, {
					  $ref: "#/definitions/getContacts",
					}
				  ],
				},
			  },
			  required: [ "values" ],
			  additionalProperties: false,
			},
		  },
		  required: [ "block", "props" ],
		  additionalProperties: false,
		},
		button: {
		  type: "object",
		  properties: {
			block: {
			  type: "string",
			  const: "button",
			},
			props: {
			  type: "object",
			  properties: {
				label: {
				  anyOf: [
					{
					  type: "string",
					}, {
					  $ref: "#/definitions/textInput",
					}, {
					  $ref: "#/definitions/button",
					}, {
					  $ref: "#/definitions/tableField",
					}
				  ],
				},
			  },
			  required: [ "label" ],
			  additionalProperties: false,
			},
		  },
		  required: [ "block", "props" ],
		  additionalProperties: false,
		},
		tableRow: {
		  type: "object",
		  properties: {
			block: {
			  type: "string",
			  const: "tableRow",
			},
			props: {
			  type: "object",
			  properties: {
				fields: {
				  type: "array",
				  items: {
					type: "string",
				  },
				},
			  },
			  required: [ "fields" ],
			  additionalProperties: false,
			},
		  },
		  required: [ "block", "props" ],
		  additionalProperties: false,
		},
		tableField: {
		  type: "object",
		  properties: {
			block: {
			  type: "string",
			  const: "tableField",
			},
			props: {
			  type: "object",
			  properties: {
				field: {
				  anyOf: [
					{
					  type: "string",
					}, {
					  $ref: "#/definitions/textInput",
					}, {
					  $ref: "#/definitions/button",
					}, {
					  $ref: "#/definitions/tableField",
					}
				  ],
				},
			  },
			  required: [ "field" ],
			  additionalProperties: false,
			},
		  },
		  required: [ "block", "props" ],
		  additionalProperties: false,
		},
		sendEmail: {
		  type: "object",
		  properties: {
			action: {
			  type: "string",
			  const: "sendEmail",
			},
			params: {
			  type: "object",
			  properties: {
				to: {
				  anyOf: [
					{
					  type: "object",
					  properties: {
						id: {
						  type: "string",
						},
						email: {
						  type: "string",
						},
					  },
					  required: [ "id", "email" ],
					  additionalProperties: false,
					}, {
					  $ref: "#/definitions/select",
					}
				  ],
				},
				subject: {
				  anyOf: [
					{
					  type: "string",
					}, {
					  $ref: "#/definitions/textInput",
					}, {
					  $ref: "#/definitions/button",
					}, {
					  $ref: "#/definitions/tableField",
					}
				  ],
				},
				body: {
				  anyOf: [
					{
					  type: "string",
					}, {
					  $ref: "#/definitions/textInput",
					}, {
					  $ref: "#/definitions/button",
					}, {
					  $ref: "#/definitions/tableField",
					}
				  ],
				},
			  },
			  required: [ "to", "subject", "body" ],
			  additionalProperties: false,
			},
		  },
		  required: [ "action", "params" ],
		  additionalProperties: false,
		},
		getContacts: {
		  type: "object",
		  properties: {
			action: {
			  type: "string",
			  const: "getContacts",
			},
			params: {
			  type: "object",
			  properties: {},
			  required: [],
			  additionalProperties: false,
			},
		  },
		  required: [ "action", "params" ],
		  additionalProperties: false,
		},
	  },
	},
	$brand: "auto-parseable-response-format",
	$parseRaw: [Function: $parseRaw],
  }