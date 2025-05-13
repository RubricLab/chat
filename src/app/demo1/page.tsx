import { createAction } from '@rubriclab/actions'
import type React from 'react'
// page.tsx
import { z } from 'zod'
import { Action, type Block, createOrchestrator } from '~/fullstack2' /* adjust path as needed */

/* ------------------------------------------------------------------ */
/*  1. DEFINE ACTIONS                                                 */
/* ------------------------------------------------------------------ */

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
		/* naive mock db */
		const db = [
			{ name: 'John', title: 'CEO', status: 'active' as const },
			{ name: 'Jane', title: 'CTO', status: 'inactive' as const }
		]
		return query ? db.filter(c => c.name.toLowerCase().includes(query.toLowerCase())) : db
	}
})

const sendEmail = createAction({
	schema: {
		input: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
		output: z.void()
	},
	execute: async ({ to, subject, body }) => {
		console.log(`[mock] email → ${to}: ${subject}\n${body}`)
	}
})

/* ------------------------------------------------------------------ */
/*  2. DEFINE BLOCKS                                                  */
/* ------------------------------------------------------------------ */

// tiny helpers
function createBlock<T extends z.AnyZodObject>(cfg: {
	schema: T
	render: (args: z.infer<T> & { emit?: (val: unknown) => void }) => React.ReactNode
}): Block<T, any> {
	return {
		schema: { input: cfg.schema, output: z.void() },
		render: cfg.render
	}
}

function List<Item extends z.AnyZodObject>(item: Item) {
	return createBlock({
		schema: z.object({
			items: z.array(item),
			child: z.function().args(item).returns(z.void())
		}),
		render: ({ items, child }) => (
			<ul>
				{items.map((i, idx) => (
					<li key={idx}>{child(i)}</li>
				))}
			</ul>
		)
	})
}

function Card<Item extends z.AnyZodObject>(item: Item) {
	return createBlock({
		schema: z.object({
			item,
			title: z.enum(Object.keys(item.shape) as [string, ...string[]]),
			content: z.array(z.enum(Object.keys(item.shape) as [string, ...string[]]))
		}),
		render: ({ item, title, content }) => (
			<div className="rounded border p-4">
				<h3 className="font-bold">{item[title]}</h3>
				<p>{content.map(c => item[c]).join(' • ')}</p>
			</div>
		)
	})
}

/* ------------------------------------------------------------------ */
/*  3. ORCHESTRATOR + CHAIN                                          */
/* ------------------------------------------------------------------ */

const blocks = {
	list: List(Contact),
	card: Card(Contact)
} as const

const actions = { getContacts, sendEmail } as const

const { render } = createOrchestrator({ blocks, actions })

/* ------------------------------------------------------------------ */
/*  4. NEXT.JS PAGE                                                  */
/* ------------------------------------------------------------------ */

export default async function FullstackDemoPage() {
	// build a valid chain (TS enforces it!)
	const ui = await render({
		block: 'list',
		props: {
			items: {
				action: 'getContacts',
				params: {}
			},
			child: item =>
				({
					block: 'card',
					props: { item, title: 'title', content: ['name'] }
				}) as any // inlining block as function return
		}
	})

	return <>{ui}</>
}
