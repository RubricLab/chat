import z from 'zod'
import env from '~/env'
import { createAction } from './actions'
import { joinProducers } from './dissent2'
import { deepReplace } from './replace'
import {
	buildActionInputUnions,
	createJoinProducers,
	createResponseFormat,
	createStructuredOutputInference,
	makeTypeUnions,
	registerActions
} from './utils'

const ContactId = z.string()

const CompanyId = z.string()

const Contact = z.object({
	id: ContactId,
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	address: z.string(),
	companyId: CompanyId
})

const Company = z.object({
	id: CompanyId,
	name: z.string(),
	industry: z.enum(['tech', 'finance', 'healthcare', 'education', 'other'])
})

const actions = {
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
		execute: ({ id, name, email, phone, address, companyId }) => {
			console.log(id, name, email, phone, address, companyId)
			return null
		}
	})
} as const

const unions = makeTypeUnions({
	actions,
	types: {
		ContactId,
		CompanyId,
		Contact,
		Company
	}
})

const s = deepReplace({
	schema: actions.sendEmail.schema.input,
	oldSchema: Contact,
	newSchema: unions.Contact
})

console.log(
	s.safeParse({
		to: {
			action: 'getContact',
			params: '123'
		},
		subject: 'Hello',
		body: 'Hello, world!'
	})
)

// const unions2 = joinProducers(
// 	{
// 		getCompany: { name: 'getCompany', schema: { input: CompanyId, output: Company } },
// 		getContacts: {
// 			name: 'getContacts',
// 			schema: {
// 				input: z.object({ company: Company }),
// 				output: z.object({ contacts: z.array(Contact) })
// 			}
// 		}
// 	},
// 	{
// 		ContactId,
// 		CompanyId,
// 		Contact,
// 		Company
// 	}
// )

const GetCompanyAction = z.object({
	name: z.literal('getCompany'),
	params: CompanyId
})

const ThingThatProducesCompany = z.union([GetCompanyAction, Company])

const GetContactsAction = z.object({
	name: z.literal('getContacts'),
	params: z.object({ company: ThingThatProducesCompany })
})

// const actions = z.union([GetCompanyAction, GetContactsAction])

function abstractTypes<T extends z.ZodTypeAny>(schema: T) {
	const map = new WeakMap<z.ZodTypeAny, z.ZodTypeAny[]>()

	return map
}
