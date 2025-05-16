import z from 'zod'
import env from '~/env'
import { createAction } from './actions'
import {
	createJoinProducers,
	createResponseFormat,
	createStructuredOutputInference,
	createTypeRegistry,
	registerActions,
	registerBrandedType
} from './utils'

const { register, registry } = createTypeRegistry()

const contactId = register(z.string(), 'contactId')

const companyId = register(z.string(), 'companyId')

const contact = register(
	z.object({
		id: contactId,
		name: z.string(),
		email: z.string(),
		phone: z.string(),
		address: z.string(),
		companyId: companyId
	}),
	'contact'
)

const actionRegistry = z.registry<{ id: string }>()

const ContactId = registerBrandedType({
	name: 'contactId',
	type: z.string(),
	registry: actionRegistry
})

const CompanyId = registerBrandedType({
	name: 'companyId',
	type: z.string(),
	registry: actionRegistry
})

const Contact = registerBrandedType({
	name: 'contact',
	type: z.object({
		id: ContactId,
		name: z.string(),
		email: z.string(),
		phone: z.string(),
		address: z.string(),
		companyId: CompanyId
	}),
	registry: actionRegistry
})

const Company = registerBrandedType({
	name: 'company',
	type: z.object({
		id: CompanyId,
		name: z.string(),
		industry: z.enum(['tech', 'finance', 'healthcare', 'education', 'other'])
	}),
	registry: actionRegistry
})

const unions = createJoinProducers({
	actions: {
		getContacts: createAction({
			schema: {
				input: z.null(),
				output: z.object({
					contacts: z.array(Contact)
				})
			},
			execute: _ => ({
				contacts: []
			})
		}),
		getContact: createAction({
			schema: {
				input: ContactId,
				output: Contact
			},
			execute: id => ({
				id,
				name: 'John Doe',
				email: 'john.doe@example.com',
				phone: '1234567890',
				address: '123 Main St, Anytown, USA',
				companyId: '123'
			})
		}),
		getCompany: createAction({
			schema: {
				input: CompanyId,
				output: Company
			},
			execute: id => ({
				id,
				name: 'Acme Inc.',
				industry: 'tech' as const
			})
		}),
		sendEmail: createAction({
			schema: {
				input: z.object({
					to: Contact,
					subject: z.string(),
					body: z.string()
				}),
				output: z.null()
			},
			execute: ({ to, subject, body }) => {
				console.log(to, subject, body)
				return null
			}
		})
	},
	types: {
		ContactId,
		CompanyId,
		Contact,
		Company
	}
})

// throw 'up'

const actions = registerActions({
	actions: {
		getContacts: createAction({
			schema: {
				input: z.null(),
				output: z.object({
					contacts: z.array(Contact)
				})
			},
			execute: _ => ({
				contacts: []
			})
		}),
		getContact: createAction({
			schema: {
				input: ContactId,
				output: Contact
			},
			execute: id => ({
				id,
				name: 'John Doe',
				email: 'john.doe@example.com',
				phone: '1234567890',
				address: '123 Main St, Anytown, USA',
				companyId: '123'
			})
		}),
		getCompany: createAction({
			schema: {
				input: CompanyId,
				output: Company
			},
			execute: id => ({
				id,
				name: 'Acme Inc.',
				industry: 'tech' as const
			})
		}),
		sendEmail: createAction({
			schema: {
				input: z.object({
					to: Contact,
					subject: z.string(),
					body: z.string()
				}),
				output: z.null()
			},
			execute: ({ to, subject, body }) => {
				console.log(to, subject, body)
				return null
			}
		})
	},
	registry: actionRegistry
})

const responseFormat = createResponseFormat({
	name: 'thing',
	schema: z.object({
		actions
	}),
	registry: actionRegistry
})

console.dir(responseFormat, { depth: null })

// actionRegistry.add(unions[], { id: 'unions' })

async function main() {
	const responseFormat = createResponseFormat({
		name: 'thing',
		schema: z.object({
			actions
		}),
		registry: actionRegistry
	})

	// console.dir(responseFormat, { depth: null })

	const out = await createStructuredOutputInference({
		openAIApiKey: env.OPENAI_API_KEY,
		responseFormat,
		messages: [
			{
				role: 'user',
				content: 'send an email, make up the contact'
			}
		]
	})
	console.dir(out, { depth: null })
}

main()
