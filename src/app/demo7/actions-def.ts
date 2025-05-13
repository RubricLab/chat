import { z } from 'zod'
import { createAction, createActionsExecutor } from './actions'
import { Contact } from './blocks-def'

// export const Friend = z.object({ name: z.number(), friendId: z.string() })

// export const Contact = z.object({ name: z.string(), friends: z.array(Friend) })

export function createObjectGetter<Item extends z.AnyZodObject>(item: Item) {
	type Key = keyof z.infer<Item> extends string ? keyof z.infer<Item> : never
	return createAction({
		schema: {
			input: z.object({
				item,
				key: z.enum(Object.keys(item) as [Key, ...Key[]])
			}),
			output: z.string()
		},
		execute: async ({ item, key }) => {
			if (!item) throw new Error('Item is required')
			if (!key) throw new Error('Key is required')
			return item[key]
		}
	})
}

// const contactGetter = createObjectGetter(Contact)

// const friendGetter = createObjectGetter(Friend)

export const actions = {
	sendEmail: createAction({
		schema: {
			input: z.object({
				to: Contact,
				subject: z.string(),
				body: z.string()
			}),
			output: z.void()
		},
		execute: async v => {
			console.log('EMAIL:', v)
		}
	}),
	getContacts: createAction({
		schema: {
			input: z.object({}),
			output: z.array(Contact)
		},
		execute: async () => [
			{ id: '1', email: 'alice@test.com' },
			{ id: '2', email: 'bob@test.com' }
		]
	})
	// getContacts: createAction({
	// 	schema: {
	// 		input: z.object({}),
	// 		output: z.array(Contact)
	// 	},

	// 	execute: async () => [
	// 		{ name: 'alice@test.com', friends: [{ name: 'bob@test.com', friendId: '1' }] },
	// 		{ name: 'bob@test.com', friends: [{ name: 'alice@test.com', friendId: '2' }] }
	// 	]
	// }),
	// contactGetter,
	// friendGetter
} as const
