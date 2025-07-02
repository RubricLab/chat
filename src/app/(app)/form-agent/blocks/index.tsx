import {
	createBlock,
	createGenericActionExecutorBlock,
	createStatefulBlock
} from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { actions, user } from '../actions'
import { GenericForm } from './genericForm'
import { TextInput } from './textInput'
import { UserSelect } from './userSelect'

// const ReactNode = z.literal('ReactNode')

export const blocks = {
	textInput: createStatefulBlock({
		description: 'Render a text input',
		render: _ => ({ react: <TextInput emit={() => ''} />, state: '' }),
		schema: {
			input: z.object({}),
			output: z.string()
		}
	}),
	userSelect: createStatefulBlock({
		description: 'Render a user select',
		render: users => ({
			react: <UserSelect users={users} emit={() => ''} />,
			state: { email: '', id: '' }
		}),
		schema: {
			input: z.array(user),
			output: user
		}
	})
}

export const genericBlocks = {
	instantiateForm: createGenericActionExecutorBlock({
		actionOptions: actions,
		description: `Creates a form from for a specific action. By calling this, a new block is created and added to the structured output schema.
The newly created block will have fields that match the action input schema, and a button that will call the action when clicked. This tool must be called before trying to render any form.`,
		instantiate: ({ actionName }) => {
			const action = actions[actionName] as (typeof actions)[keyof typeof actions]

			return createBlock({
				description: undefined,
				// biome-ignore lint/suspicious/noExplicitAny: We should fix this
				render: input => <GenericForm fields={input} onSubmit={action.execute as any} />,
				schema: {
					input: action.schema.input
				}
			})
		}
	})
}
