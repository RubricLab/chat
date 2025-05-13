import { createAction } from '@rubriclab/actions'
import type { ReactNode } from 'react'
import { z } from 'zod'

export function createBlock<T extends z.AnyZodObject>(cfg: {
	schema: T
	render: (props: z.infer<T>) => ReactNode
}) {
	return cfg
}

// Generic builders (need one param first, e.g. <Item>)
export function makeBlockFactory<
	Param, // what the caller passes
	Out extends {
		// must be acceptable to createBlock
		schema: z.AnyZodObject
		render: (p: any) => ReactNode
	}
>(builder: (param: Param) => Out) {
	return (param: Param) => createBlock(builder(param))
}

/* ──────────────────────────────────────────────────────────
     2.  A COUPLE OF REUSABLE BUILDERS
     ────────────────────────────────────────────────────────── */

// 2a.  Card<Item>
export const Card = makeBlockFactory(<Item extends z.AnyZodObject>(item: Item) => {
	const keys = Object.keys(item.shape) as [keyof z.infer<Item>, ...any]
	return {
		schema: z.object({
			item,
			title: z.enum(keys),
			content: z.array(z.enum(keys))
		}),
		render: ({ item, title, content }) => (
			<div className="rounded-lg border p-4 shadow">
				<h2 className="font-bold">{item[title]}</h2>
				<p>{content.map(k => String(item[k])).join(', ')}</p>
			</div>
		)
	}
})

// 2b.  List<Item>
export const List = makeBlockFactory(<Item extends z.AnyZodObject>(item: Item) => ({
	schema: z.object({
		items: z.array(item),
		search: z
			.function()
			.args(z.string())
			.returns(z.promise(z.array(item)))
			.optional(),
		create: z.function().args(item).returns(z.promise(z.void())).optional(),
		child: z.function().args(item).returns(z.void())
	}),
	render: ({ items, search, create, child }) => (
		<div className="space-y-2">
			{search && (
				<input
					className="rounded border px-2 py-1"
					placeholder="Search…"
					onChange={e => search(e.target.value)}
				/>
			)}

			{items.map((it, i) => (
				<div key={i}>{child(it)}</div>
			))}

			{create && (
				<button
					className="rounded bg-blue-600 px-3 py-1 text-white"
					onClick={() => create(items[0]) /* demo only */}
				>
					Create
				</button>
			)}
		</div>
	)
}))

// runtime shape
const Contact = z.object({
	name: z.string(),
	title: z.string(),
	status: z.enum(['active', 'inactive'])
})

// actions
const getContacts = createAction({
	schema: {
		input: z.object({ query: z.string().optional() }),
		output: z.array(Contact)
	},
	execute: async ({ query }) => {
		const data = [
			{ name: 'John Doe', title: 'Engineer', status: 'active' as const },
			{ name: 'Jane Doe', title: 'Designer', status: 'inactive' as const }
		]
		return query ? data.filter(d => d.name.toLowerCase().includes(query.toLowerCase())) : data
	}
})

const createContact = createAction({
	schema: { input: Contact, output: z.void() },
	execute: async c => console.log('create', c)
})

// instantiate concrete blocks ► no generics visible
const { render: ContactCard } = Card(Contact)
const { render: ContactList } = List(Contact)

/* ──────────────────────────────────────────────────────────
     5.  PAGE COMPONENT
     ────────────────────────────────────────────────────────── */

export default async function FullstackDemo() {
	const contacts = await getContacts.execute({})

	return (
		<main className="mx-auto max-w-md space-y-6 p-6">
			<h1 className="font-bold text-2xl">Contacts</h1>

			<ContactList
				items={contacts}
				search={query => getContacts.execute({ query })}
				create={item => createContact.execute(item)}
				child={item => <ContactCard item={item} title="name" content={['title', 'status']} />}
			/>

			<h2 className="pt-8 font-semibold text-xl">Random Video</h2>
			<MediaPlayer src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay={false} />
		</main>
	)
}
