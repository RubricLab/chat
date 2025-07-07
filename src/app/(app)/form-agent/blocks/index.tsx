import { createBlock, createStatefulBlock, REACT_NODE } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { user } from '../actions'
import { execute } from '../actions/server'
import SendEmailForm from './sendEmailForm'
import { TextInput } from './textInput'
import { UserSelect } from './userSelect'

function statefull<Type extends z.ZodType>(type: Type) {
	return z.object({
		react: REACT_NODE,
		state: type
	})
}
export const blocks = {
	sendEmailForm: createBlock({
		description: 'Render a form that sends an email to a user',
		render: fields => (
			<SendEmailForm
				statefullFields={fields}
				mutation={async params => {
					await execute({ action: 'sendEmail', params })
				}}
			/>
		),
		schema: {
			input: z.object({
				body: statefull(z.string()),
				subject: statefull(z.string()),
				to: statefull(
					z.object({
						email: z.string(),
						id: z.string()
					})
				)
			})
		}
	}),
	textInput: createStatefulBlock({
		description: 'Render a text input',
		render: () => {
			let value = ''
			return {
				getState: () => value,
				react: (
					<TextInput
						emit={v => {
							value = v
						}}
					/>
				)
			}
		},
		schema: {
			input: z.null(),
			output: z.string()
		}
	}),
	userSelect: createStatefulBlock({
		description: 'Render a user select',
		render: users => {
			const defaultUser = users[0]
			if (!defaultUser) {
				throw 'no users to select'
			}
			let value = defaultUser
			return {
				getState: () => value,
				react: (
					<UserSelect
						users={users}
						emit={v => {
							value = v
						}}
					/>
				)
			}
		},
		schema: {
			input: z.array(user),
			output: user
		}
	})
}

export const blockSchemas = Object.fromEntries(
	Object.entries(blocks).map(([key, { schema }]) => [key, schema])
) as { [K in keyof typeof blocks]: (typeof blocks)[K]['schema'] }

export type Blocks = {
	[K in keyof typeof blocks]: {
		block: K
		props: z.infer<(typeof blocks)[K]['schema']['input']>
	}
}[keyof typeof blocks]
