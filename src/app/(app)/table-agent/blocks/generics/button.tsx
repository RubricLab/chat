import { createTool } from '@rubriclab/agents'
import { createGenericBlock } from '@rubriclab/blocks'
import { actionSchemas } from '~/table-agent/actions'
import { addBlock } from '..'

export const genericButtonBlock = createGenericBlock({
	description: '',
	getSchema(actionKey) {
		const action = actionSchemas[actionKey]
		return { input: action.input }
	},
	render(_props) {
		return (
			<button type="button" onClick={() => {}}>
				do
			</button>
		)
	},
	types: actionSchemas
})

export const instantiateButtonTool = createTool({
	async execute(name) {
		addBlock({ block: genericButtonBlock.instantiate(name), name })
		return null
	},
	schema: genericButtonBlock.schema
})
