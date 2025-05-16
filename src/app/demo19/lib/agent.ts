import { OpenAI } from 'openai/index.mjs'
import type { EasyInputMessage } from 'openai/resources/responses/responses'
import type z from 'zod'
import type { ResponseFormat } from './responseFormat'

export async function createStructuredOutputInference<Format extends ResponseFormat<z.ZodObject>>({
	openAIApiKey: apiKey,
	responseFormat,
	messages
}: {
	openAIApiKey: string
	responseFormat: Format
	messages?: [EasyInputMessage, ...EasyInputMessage[]]
}) {
	const openai = new OpenAI({
		apiKey
	})

	const { output_parsed } = await openai.responses.parse({
		model: 'gpt-4.1',
		input: messages ?? [{ role: 'user' as const, content: '' }],
		text: {
			format: responseFormat
		}
	})

	if (!output_parsed) {
		throw new Error('No parsed output')
	}

	return output_parsed
}
