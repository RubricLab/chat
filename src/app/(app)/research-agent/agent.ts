import { createAgent, createTool } from '@rubriclab/agents'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { z } from 'zod/v4'
import { getContents, search } from './search'

const systemPrompt = `You are a research agent. 
Use tools to perform research until you have the answer.
You can call the search tool as many times as you need to find links.
You can call the getContents tool to get the content of the links.
You can use the tools as many times as you need to get the answer, feel free to go deeper with each search until you have everything you need.
When satisfied, return the explicit answer as directly and simply as possible. Make sure it is accurate, up to date and fact checked against multiple sources.

Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`

const searchTool = createTool({
	schema: {
		input: { query: z.string(), numResults: z.number() },
		output: z.array(z.object({ title: z.string().nullable(), url: z.string() }))
	},
	execute: search
})

const getContentsTool = createTool({
	schema: {
		input: { url: z.string() },
		output: z.array(z.object({ title: z.string().nullable(), content: z.string(), url: z.string() }))
	},
	execute: getContents
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
	tools: { search: searchTool, getContents: getContentsTool },
	responseFormat
})

export { eventTypes as researchAgentEventTypes }
export { executeAgent as executeResearchAgent }

export type ResearchAgentToolEvent = typeof __ToolEvent
export type ResearchAgentResponseEvent = typeof __ResponseEvent
