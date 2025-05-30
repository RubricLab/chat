import { createBlock, createBlockRenderer } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { contact } from '~/actions'

const heading = createBlock({
	schema: {
		input: {
			message: z.string()
		},
		output: z.string()
	},
	render: ({ message }) => <h1>{message}</h1>
})

const textInput = createBlock({
	schema: {
		input: {},
		output: z.string()
	},
	render: (_, { emit }) => <input onChange={e => emit(e.target.value)} type="text" />
})

const contactSelect = createBlock({
	schema: {
		input: {
			contacts: z.array(contact)
		},
		output: contact
	},
	render: ({ contacts }, { emit }) => (
		<select
			onChange={e => {
				const contact = contacts.find(c => c.email === e.target.value)
				if (contact) {
					emit(contact)
				}
			}}
		>
			{contacts.map(contact => (
				<option key={contact.email} value={contact.email}>
					{contact.name}
				</option>
			))}
		</select>
	)
})

const contactForm = createBlock({
	schema: {
		input: {
			contact,
			content: z.string()
		},
		output: z.void()
	},
	render: (_, { emit }) => (
		<form>
			<button type="submit">Send</button>
		</form>
	)
})

export const blocks = {
	heading,
	textInput,
	contactSelect,
	contactForm
}

export type Blocks = typeof blocks
