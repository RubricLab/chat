import type { ReactNode } from 'react'

export function createList<Item extends z.ZodTypeAny>(item: Item) {
	return createBlock({
		schema: {
			input: z.object({
				items: z.array(item),
				search: z.function().args(z.string()).returns(z.array(item)),
				create: z.function().args(item).returns(z.void()),
				child: z.function().args(item).returns(z.custom<ReactNode>())
			}),
			output: z.undefined()
		},
		render: ({ items, create, search, child }, _) => {
			return (
				<div>
					{items.map((item, index: number) => (
						<div key={index}>{child(item)}</div>
					))}
				</div>
			)
		}
	})
}

export function createForm<Fields extends z.AnyZodObject>(fields: Fields) {
	return createBlock({
		schema: {
			input: z.object({}),
			output: fields
		},
		render: (_, { emit }) => {
			return (
				<form onSubmit={e => emit(e.target)}>
					{Object.entries(fields.shape).map(([key, field]) => (
						<div key={key}>{field}</div>
					))}
				</form>
			)
		}
	})
}

const ContactForm = createForm(Contact)

import { createBlock, createBlocksRenderer } from '@rubriclab/blocks'
import { z } from 'zod'
import { Contact } from './actions'

const buttonBlock = createBlock({
	schema: {
		input: z.object({
			name: z.string()
		}),
		output: z.void()
	},
	render: ({ name }, { emit }) => {
		return (
			<button type="button" onClick={() => emit()}>
				{name}
			</button>
		)
	}
})

const inputBlock = createBlock({
	schema: {
		input: z.object({}),
		output: z.string()
	},
	render: (_, { emit }) => {
		return <input type="text" onChange={e => emit(e.target.value)} />
	}
})

const imageBlock = createBlock({
	schema: {
		input: z.object({ url: z.string(), alt: z.string().optional() }),
		output: z.void()
	},
	render: ({ url, alt }, _) => {
		return <img src={url} alt={alt} />
	}
})

const contactSelectBlock = createBlock({
	schema: {
		input: z.object({ values: z.array(Contact) }),
		output: Contact
	},
	render: ({ values }, { emit }) => {
		return (
			<select onSelect={e => emit(values[e.target.value] ?? ({} as never))}>
				{values.map(value => (
					<option key={value.name}>{value.name}</option>
				))}
			</select>
		)
	}
})

export const blocks = {
	button: buttonBlock,
	input: inputBlock,
	form: ContactForm,
	image: imageBlock,
	select: selectBlock
}

export const { render, response_format } = createBlocksRenderer(blocks)

render({
	block: 'button',
	props: {
		name: {
			block: 'input',
			props: {}
		}
	}
})

render({
	block: 'form',
	props: {
		fields: {
			name: {
				block: 'input',
				props: {}
			},
			email: {
				block: 'select',
				props: {
					values: {
						action: 'getContacts',
						params: {}
					}
				}
			}
		}
	}
})
