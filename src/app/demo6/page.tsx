import { OpenAI } from 'openai'
import { z } from 'zod'

import { createAction, createActionsExecutor } from './actions'
import { createAgent } from './agent'
import { createBlock, createBlocksRenderer } from './blocks'

/*  actions  */
const sendEmail = createAction({
	schema: {
		input: z.object({
			to: z.string(),
			subject: z.string(),
			body: z.string()
		}),
		output: z.void()
	},
	execute: async v => {
		console.log('EMAIL:', v)
	}
})

const actions = { sendEmail }
const act = createActionsExecutor(actions)

/*  blocks  */
const button = createBlock({
	schema: {
		input: z.object({ label: z.string() }),
		output: z.string()
	},
	render: ({ label }, { emit }) => <button onClick={() => emit(label)}>{label}</button>
})

const blocks = { button }
const blk = createBlocksRenderer(blocks)

/*  agent  */
const { response_format } = createAgent({ actions: act, blocks: blk })

console.dir(response_format, { depth: null })

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

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
			content: 'Create a maximally complex action+blocks chain'
		}
	],
	text: {
		format: response_format
	}
})

const event = response.output_text
console.dir(JSON.parse(event), { depth: null })
