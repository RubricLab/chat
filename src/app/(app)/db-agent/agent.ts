import { createActionDocs } from '@rubriclab/actions'
import { createAgent, createTool, noTabs } from '@rubriclab/agents'
import { actions } from './actions'

const systemPrompt = noTabs`
	You are an action execution. 
	Use tools to perform actions. 
	When satisfied, return the explicit answer as directly and simply as possible.

	You have access to the following tools:
	${createActionDocs({ actions })}
`

const getUsersTool = createTool(actions.getUsers)

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	model: 'gpt-5.1',
	systemPrompt,
	tools: { getUsers: getUsersTool }
})

export { eventTypes as dbAgentEventTypes }
export { executeAgent as executeDbAgent }

export type DbAgentToolEvent = typeof __ToolEvent
export type DbAgentResponseEvent = typeof __ResponseEvent
