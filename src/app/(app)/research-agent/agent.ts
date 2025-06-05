import { createAgent, createTool } from '@rubriclab/agents'
import { createResponseFormat } from '@rubriclab/agents/lib/responseFormat'
import { z } from 'zod/v4'
import { getContents, search } from './search'

const systemPrompt = `You are an advanced research agent. 
Use tools recursively to perform research until you have the answer.

Step 1: Use the search tool to find links to relevant sources.
Step 2: Use the getContents tool to get the content of any websites that seem relevant -- Returns the entire page content as HTML.
Step 3: Repeat steps 2 and 3 as you learn more about the topic.

Feel free to go deeper with each search until you have everything you need and are confident you understand the topic well.
When satisfied, return the explicit answer as directly and simply as possible. Make sure it is accurate, up to date and fact checked against multiple sources.

Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`

const searchTool = createTool({
	schema: {
		input: { query: z.string(), numResults: z.number().min(10).max(100) },
		output: z.array(z.object({ title: z.string().nullable(), url: z.string() }))
	},
	execute: search
})

const getContentsTool = createTool({
	schema: {
		input: { url: z.string() },
		output: z.object({ title: z.string().nullable(), content: z.string(), url: z.string() })
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
