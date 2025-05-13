'use client'
import { createAction } from '@rubriclab/actions'
import type { ReactNode } from 'react'
import React from 'react'
import { z } from 'zod'

function createBlock<T extends z.AnyZodObject>(config: {
	schema: T
	render: (args: z.infer<T>) => ReactNode
}) {
	return config
}

function List<Item extends z.AnyZodObject>(item: Item) {
	return createBlock({
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
		render: ({ items, create, search, child }) => (
			<div>
				{search && <input type="text" onChange={e => search(e.target.value)} />}
				{items.map((item, index) => (
					<div key={index}>{child(item)}</div>
				))}
				{create && (
					<button type="button" onClick={() => create(item)}>
						Create
					</button>
				)}
			</div>
		)
	})
}

function Card<Item extends z.AnyZodObject>(item: Item) {
	return createBlock({
		schema: z.object({
			item: item,
			title: z.enum(Object.keys(item) as [string, ...string[]]),
			content: z.array(z.enum(Object.keys(item) as [string, ...string[]]))
		}),
		render: ({ item, title, content }) => (
			<div>
				<h1>{item?.[title]}</h1>
				<p>{content.map(c => item?.[c]).join(', ')}</p>
			</div>
		)
	})
}

function Table<Item extends z.AnyZodObject>(item: Item) {
	return createBlock({
		schema: z.object({
			data: z.array(item),
			columns: z.array(z.enum(Object.keys(item) as [string, ...string[]]))
		}),
		render: ({ data, columns }) => (
			<table>
				<thead>
					<tr>
						{columns.map(column => (
							<th key={column}>{column}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((row, index) => (
						<tr key={index}>
							{columns.map(column => (
								<td key={column}>{row[column]}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		)
	})
}

const Contact = z.object({
	name: z.string(),
	title: z.string(),
	status: z.enum(['active', 'inactive'])
})

const getContacts = createAction({
	schema: {
		input: z.object({ query: z.string().optional() }),
		output: z.array(Contact)
	},
	execute: async ({ query }) => {
		const data = [
			{
				name: 'John Doe',
				title: 'Software Engineer',
				status: 'active' as const
			},
			{
				name: 'Jane Doe',
				title: 'Software Engineer',
				status: 'inactive' as const
			}
		]
		if (query) {
			return data.filter(contact => contact.name.toLowerCase().includes(query.toLowerCase()))
		}
		return data
	}
})

const createContact = createAction({
	schema: {
		input: Contact,
		output: z.void()
	},
	execute: async item => {
		console.log(item)
	}
})

// const { execute } = createActionsExecutor({
// 	getContacts,
// 	createContact
// })

export default async function FullstackTest() {
	return List(Contact).render({
		items: await getContacts.execute({}),
		search: async query => getContacts.execute({ query }),
		create: async item => createContact.execute(item),
		child: item => Card(Contact).render({ item, title: 'title', content: ['name'] })
	})
}
