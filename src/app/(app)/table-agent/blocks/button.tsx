import { createTool } from '@rubriclab/agents'
import { createGenericBlock } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import { actionSchemas } from '~/table-agent/actions'
import { execute } from '../actions/server'
import { type Raw, raw } from '../brands'
import { addBlock } from '.'

const buttonTypes = Object.fromEntries(
	Object.entries(actionSchemas).map(([key, { input }]) => [
		key,
		{
			input: z.object({
				input,
				mutation: raw(z.literal(key)),
				text: raw(z.string())
			})
		}
	])
) as {
	[K in keyof typeof actionSchemas]: {
		input: z.ZodObject<{
			mutation: Raw<z.ZodLiteral<K>>
			text: Raw<z.ZodString>
			input: (typeof actionSchemas)[K]['input']
		}>
	}
}

export const button = createGenericBlock({
	description: '',

	render({ mutation, text, input }) {
		async function exec() {
			await execute({ action: mutation, params: input })
		}
		return (
			<button type="button" onClick={exec}>
				{text}
			</button>
		)
	},
	types: buttonTypes
})

export const instantiateButton = createTool({
	async execute(name) {
		addBlock({ block: button.instantiate(name), name: `button<${name}>` })
		return null
	},
	schema: button.schema
})
