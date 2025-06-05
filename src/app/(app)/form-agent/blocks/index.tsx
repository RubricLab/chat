import {
	createBlock,
	createGenericActionExecutorBlock,
	createStatefulBlock
} from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { actions } from '../actions'
import { GenericForm } from './genericForm'
import { TextInput } from './textInput'

// const ReactNode = z.literal('ReactNode')

export const blocks = {
	textInput: createStatefulBlock({
		schema: {
			input: {},
			output: z.string()
		},
		render: TextInput,
		description: 'Render a text input'
	})
}

export const genericBlocks = {
	instantiateForm: createGenericActionExecutorBlock({
		actionOptions: actions,
		instantiate: ({ actionName }) => {
			const action = actions[actionName] as (typeof actions)[keyof typeof actions]

			return createBlock({
				schema: {
					input: action.schema.input,
					output: z.undefined()
				},
				// biome-ignore lint/suspicious/noExplicitAny: We should fix this
				render: input => <GenericForm fields={input} onSubmit={action.execute as any} />,
				description: undefined
			})
		},
		description: `Creates a form from for a specific action. By calling this, a new block is created and added to the structured output schema.
The newly created block will have fields that match the action input schema, and a button that will call the action when clicked. This tool must be called before trying to render any form.`
	})
}
