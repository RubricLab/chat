import OpenAI from 'openai'
import { actions } from '~/actions'
// import { response_format } from '~/actions'
import { blocks } from '~/blocks'
import { createFullstack } from './fullstack'

const { render, response_format } = createFullstack(actions, blocks)

// render({
// 	block: 'button',
// 	props: {
// 		name: { action: 'getFavouriteColor', params: {} }
// 	}
// })

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

console.dir(response_format, { depth: null })

const response = await openai.responses.create({
	model: 'o4-mini',
	input: [
		{
			role: 'system',
			content:
				"You are a fullstack chaining agent. You are responsible for connecting actions and ui to create a fullstack snippet that solves the user's problem. UI are either Sinks (accepting input) or Sources (outputting data). Often, you will want to use Sources as input for actions. Your final answer should resemble the correct data structure for a chain that can do the task in one go."
		},
		{
			role: 'user',
			content: 'Create a form to send an email. dont use the form block - JUST INPUTS'
		}
	],
	text: {
		format: response_format
	}
})

const event = response.output_text
console.dir(JSON.parse(event), { depth: null })
