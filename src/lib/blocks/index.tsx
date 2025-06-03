import { createBlock, createStatefulBlock } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { contact } from '~/actions'
import { ContactSelect } from './react/contactSelect'
import { NumberInput } from './react/numberInput'
import { TextInput } from './react/textInput'

const heading = createBlock({
	schema: {
		input: {
			message: z.string()
		},
		output: z.string()
	},
	render: ({ message }) => <h1>{message}</h1>,
	description: undefined
})

const textInput = createStatefulBlock({
	schema: {
		input: {},
		output: z.string()
	},
	render: _ => TextInput(),
	description: undefined
})

const numberInput = createStatefulBlock({
	schema: {
		input: {},
		output: z.number()
	},
	render: _ => NumberInput(),
	description: undefined
})

const contactSelect = createStatefulBlock({
	schema: {
		input: {
			contacts: z.array(contact)
		},
		output: contact
	},
	render: ({ contacts }) => ContactSelect({ contacts }),
	description: undefined
})

export const blocks = {
	heading,
	textInput,
	contactSelect,
	numberInput
} as const

export type Blocks = typeof blocks
