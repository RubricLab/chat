import { createBlock, createStatefulBlock, createGenericActionExecutorBlock } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { actions, user } from '../actions'
import { GenericForm } from './genericForm'
import { TextInput } from './textInput'
import { UserSelect } from './userSelect'

// const ReactNode = z.literal('ReactNode')

export const blocks = {
	textInput: createStatefulBlock({
		schema: {
			input: {},
			output: z.string()
		},
		render: (_) => ({ state: '', react: <TextInput emit={() => ""} /> }),
		description: 'Render a text input'
	}),
	userSelect: createStatefulBlock({
		schema: {
			input: { users: z.array(user) },
			output: user
		},
		render: ({ users }) => ({ state: {id: '', email: ''}, react: <UserSelect users={users} emit={(() => '')} /> }),
		description: 'Render a user select'
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
