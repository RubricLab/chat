import { createAgent, createTool } from '@rubriclab/agents'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { z } from 'zod/v4'
import { search } from './search'

const systemPrompt = `You are a research agent. 
Use tools to perform research recursively. 
When satisfied, return the explicit answer as directly and simply as possible.`

const researchTool = createTool({
	schema: {
		input: { query: z.string() },
		output: z.array(z.object({ title: z.string().nullable(), content: z.string(), url: z.string() }))
	},
	execute: search
})

const responseFormat = createResponseFormat({
	name: 'research_results',
	schema: z.object({
		answer: z.string(),
		sources: z.array(z.object({ title: z.string(), url: z.string() }))
	})
})

const { executeAgent, eventTypes, __ToolEvent, __ResponseEvent } = createAgent({
	systemPrompt,
	tools: { research: researchTool },
	responseFormat
})

export { eventTypes as researchAgentEventTypes }
export { executeAgent as executeResearchAgent }

export type ResearchAgentToolEvent = typeof __ToolEvent
export type ResearchAgentResponseEvent = typeof __ResponseEvent
