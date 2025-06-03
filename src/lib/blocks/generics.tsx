import {
	createBlock,
	createGenericActionExecutorBlock
	// createGenericActionMapperBlock
} from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { actions } from '~/actions'
import { GenericForm } from './react/genericForm'

const instantiateForm = createGenericActionExecutorBlock({
	actionOptions: actions,
	instantiate: ({ actionName }) => {
		const action = actions[actionName] as (typeof actions)[keyof typeof actions]

		return createBlock({
			schema: {
				input: action.schema.input,
				// onExecute: z.array(z.union([z.undefined()]))
				output: z.undefined()
			},
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			render: input => <GenericForm fields={input} onSubmit={action.execute as any} />,
			description: undefined
		})
	},
	description: `This generic block is used to instantiate a form.
It should be passed the action that you want to execute with the fields the user fills out.
It will produce a block with an input called fields that must be passed all of the actions inputs (or compatibilities). 
It will render a button with these inputs and a button to execute the action with those values.`
})

// const genericTable = createGenericActionMapperBlock({})

// const genericView = createGenericTypeProviderBlock({
// 	typeOptions: {},
// })

// export const genericBlocks = {
// 	genericForm,
// 	genericTable,
// 	genericView
// }

export const genericBlocks = {
	instantiateForm
}
