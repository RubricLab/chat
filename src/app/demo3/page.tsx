import { createAction } from '@rubriclab/actions'
/* demo.ts ---------------------------------------------------- */
import { z } from 'zod'
import { createBlock } from './blocks'
import { createFullstackExecutor } from './fullstack'

/* 1. actions */
const Contact = z.object({ name: z.string(), email: z.string() })

const getContacts = createAction({
	schema: { input: z.object({}), output: z.array(Contact) },
	execute: async () => [{ name: 'John', email: 'john@acme.com' }]
})

/* 2. blocks */
const List = createBlock(<T extends z.AnyZodObject>(item: T) => ({
	schema: {
		input: z.object({ items: z.array(item) }),
		output: z.void()
	},
	render: ({ items }) => (
		<ul>
			{items.map(i => (
				<li key={i.name}>{i.name}</li>
			))}
		</ul>
	)
}))

/* 3. executor */
const { render, response_format } = createFullstackExecutor(
	{ getContacts },
	{ list: List(Contact) }
)

/* 4. dev-time safety */
await render({
	block: 'list',
	props: { items: await getContacts.execute({}) }
})

/* 5. model-time safety — send response_format to the LLM */
console.log(response_format)
