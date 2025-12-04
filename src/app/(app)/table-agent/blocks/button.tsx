import { createTool } from '@rubriclab/agents'
import { createGenericBlock } from '@rubriclab/blocks'
import { z } from 'zod'
import { actionSchemas } from '~/table-agent/actions'
import { execute } from '../actions/server'
import { raw } from '../brands'
import { addBlock } from '.'

export const button = createGenericBlock({
	description: '',
	getSchema(typeKey) {
		return {
			input: z.object({
				input: actionSchemas[typeKey].input,
				mutation: raw(z.literal(typeKey)),
				text: raw(z.string())
			})
		}
	},
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
	types: actionSchemas
})

export const instantiateButton = createTool({
	async execute(name) {
		addBlock({ block: button.instantiate(name), name: `button<${name}>` })
		return null
	},
	schema: button.schema
})
