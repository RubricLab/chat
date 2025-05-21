import z from 'zod/v4'
import { createAction } from './lib/actions'
import { createBlock } from './lib/blocks'

const ContactId = z.string()
const Contact = z.object({
	id: ContactId,
	name: z.string(),
	email: z.string(),
	phone: z.string()
})

const actions = {
	createContact: createAction({
		schema: {
			input: z.object({
				name: z.string(),
				email: z.string(),
				phone: z.string()
			}),
			output: ContactId
		},
		execute: async ({ name, email, phone }) => {
			console.log(`createContact: ${name} ${email} ${phone}`)
			return '123'
		}
	}),
	getAllContacts: createAction({
		schema: {
			input: z.object({}),
			output: z.array(Contact)
		},
		execute: async () => {
			console.log('getAllContacts')
			return [{ id: '123', name: 'John Doe', email: 'john.doe@example.com', phone: '1234567890' }]
		}
	})
}

function createTable<Schema extends z.ZodArray<z.ZodObject>>(schema: Schema) {
	return createBlock({
		schema: {
			input: z.object({
				data: schema
			}),
			output: z.undefined()
		},
		render: ({ data }, { emit }) => {
			return (
				<div>
					{data.map(item => (
						<div>{item.name}</div>
					))}
				</div>
			)
		}
	})
}

function createChildren<Consumption extends Record<string, z.ZodType>>({
	consume
}: {
	consume: Consumption
}) {
	return z.ZodEnum(Object.keys(consume))
}

function createView<Schema extends z.ZodObject>({
	schema
}: {
	schema: Schema
}) {
	return createBlock({
		schema: {
			input: z.object({
				children: createChildren({ consume: schema })
			}),
			output: z.undefined()
		},
		render: ({ children }, { emit }) => {
			return <div>{children}</div>
		}
	})
}

const teamIdView = createBlock({
	schema: {
		input: z.object({
			in: z.object({
				teamId: z.string()
			}),
			children: createChildren({
				consume: {
					key: '$.teamId'
				}
			})
		}),
		output: z.undefined()
	},
	render: ({ children }, { emit }) => {
		return <div>{children}</div>
	}
})

function createForm<FieldSchema extends z.ZodObject, OutputSchema extends z.ZodType>({
	fieldSchema,
	outputSchema
}: {
	fieldSchema: FieldSchema
	outputSchema: OutputSchema
}) {
	return createBlock({
		schema: {
			input: z.object({
				fields: fieldSchema
			}),
			output: outputSchema
		},
		render: ({ fields }, { emit }) => {
			return <div>{fields}</div>
		}
	})
}

const teamIdView = createView({
	schema: z.object({
		teamId: z.string()
	})
})

const createContactForm = createForm({
	fieldSchema: z.object({
		teamId: z.string(),
		name: z.string()
	}),
	outputSchema: z.object({
		contactId: z.string()
	})
}) // ACTIONS are RIGID TRANSFORMERS. IO schemas are immutable.

// getAllCompaniesAction ({limit: number}) => Company[]

// createContactAction ({teamId: string, name: string, companyId: string}) => ContactId

// BLOCKS are GENERATIVE TRANSFORMERS. They must be instantiated with an ACTION, or a TYPE.

// teamIdView = createView<teamId>
// createContactForm = createForm<createContactAction>
// companySelect = createSelect<getAllCompaniesAction>

// Some blocks output CONTEXT_TOKENS - which are meant to be consumed by nested blocks.
// The CONTEXT_TOKENS they output are generic to the supplied ACTION or TYPE.

// ex. the teamIdView OUTPUTS a CONTEXT_TOKEN called $.teamIdView.teamId -> which is compatible with the teamID type. This token is ONLY available anywhere inside the CHILDREN prop of the teamIdView block.
// ex. the createContactForm OUTPUTS a CONTEXT_TOKEN called $.createContactForm.contactId -> which is compatible with the contactId type. This token is ONLY available anywhere inside the ON_SUBMIT prop of the createContactForm block.

// there are also BLOCKS that are not generic (such as textInput which always outputs a string, or heading which always consumes a string) - we can call these UI_PRIMITIVES.

const formPayload = {
	block: 'teamIdView',
	props: {
		children: [
			{
				block: 'createContactForm',
				props: {
					fields: {
						teamId: '$.teamIdView.teamId',
						name: {
							block: 'textInput',
							props: {}
						},
						company: {
							block: 'companySelect',
							props: {
								limit: 10
							}
						}
					},
					onSubmit: {
						block: 'modal',
						props: {
							children: [
								{
									block: 'text',
									props: {
										text: '$.createContactForm.contactId'
									}
								}
							]
						}
					}
				}
			}
		]
	}
}

// contactTable = createTable<getAllContactsAction>

const payload2 = {
	block: 'contactTable',
	props: {
		columns: [
			{
				title: 'Name',
				data: '$.contactTable.name'
			},
			{
				title: 'Email',
				data: '$.contactTable.email'
			},
			{
				title: 'Phone',
				data: '$.contactTable.phone'
			},
			{
				title: 'Delete Contact',
				data: {
					block: 'button',
					props: {
						onClick: {
							action: 'deleteContact',
							params: {
								contactId: '$.contactTable.contactId'
							}
						}
					}
				}
			}
		]
	}
}
