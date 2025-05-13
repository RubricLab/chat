import OpenAI from 'openai'
import { response_format } from '~/actions'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

console.dir(response_format, { depth: null })

const response = await openai.responses.parse({
	model: 'gpt-4o-2024-08-06',
	input: [
		{ role: 'system', content: 'Extract the event information.' },
		{
			role: 'user',
			content: 'create a clickable thing that has an input field'
		}
	],
	text: {
		format: response_format
	}
})

const event = response.output_parsed
console.dir(event, { depth: null })
