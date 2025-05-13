import { OpenAI } from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

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

				/* ─────────────────────────── top level ────────────────────────── */
				type: 'object',
				properties: {
					chain: { $ref: '#/definitions/TableBlock' }
				},
				required: ['chain'],
				additionalProperties: false,

				/* ─────────────────────────── definitions ─────────────────────── */
				definitions: {
					/* 1 ♦ ACTIONS (catalogue) ------------------------------------- */
					getContacts: {
						type: 'object',
						properties: {
							action: { type: 'string', const: 'getContacts' },
							params: { type: 'object', properties: {}, additionalProperties: false }
						},
						required: ['action', 'params'],
						additionalProperties: false
					},
					ActionCall: {
						anyOf: [{ $ref: '#/definitions/getContacts' }]
					},

					/* 2 ♦ HANDLE + DATAREF  (scoped safety) ----------------------- */
					HandleEnum: { enum: ['@contacts', '@row'] },

					DataRef: {
						type: 'object',
						properties: {
							ref: { $ref: '#/definitions/HandleEnum' },
							path: {
								type: 'array',
								items: { type: 'string' }
							}
						},
						required: ['ref', 'path'],
						additionalProperties: false
					},

					/* 3 ♦ ROW PATHS  (every legal dot-path in Contact) ------------ */
					RowPathEnum: {
						enum: ['id', 'name', 'email', 'tags', 'company', 'company.name', 'company.industry']
					},

					/* 4 ♦ COLUMN / CELL spec ------------------------------------- */
					Cell: {
						anyOf: [
							/* key-projection cell */
							{
								type: 'object',
								properties: { key: { $ref: '#/definitions/RowPathEnum' } },
								required: ['key'],
								additionalProperties: false
							}

							/* ←--- nested blocks (list, card, etc.) would be added here
                         via   { "$ref": "#/definitions/AnyBlock" }               */
						]
					},

					ColumnSpec: {
						type: 'object',
						properties: {
							header: { type: 'string' },
							cell: { $ref: '#/definitions/Cell' }
						},
						required: ['cell', 'header'],
						additionalProperties: false
					},

					/* 5 ♦ THE TABLE BLOCK (root) --------------------------------- */
					TableBlock: {
						type: 'object',
						properties: {
							block: { type: 'string', const: 'table' },
							props: {
								type: 'object',
								properties: {
									/* Data source: must be an ActionCall – produces Contact[] */
									rows: { $ref: '#/definitions/ActionCall' },

									columns: {
										type: 'array',
										items: { $ref: '#/definitions/ColumnSpec' }
									}
								},
								required: ['rows', 'columns'],
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
