import { OpenAI } from 'openai'
import { chainFormat } from './sketch'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const { output_parsed } = await openai.responses.parse({
	model: 'gpt-4.1',
	input: [
		{
			role: 'user',
			content: 'show me a very basic example'
		}
	],
	text: {
		format: chainFormat
	}
})

console.dir(output_parsed, { depth: null })
