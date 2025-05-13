import { OpenAI } from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

const { output } = await openai.responses.create({
	model: 'gpt-4.1',
	input: [
		{
			role: 'user',
			content: 'subscribe jim@gmail.com to news and sports'
		}
	],
	tool_choice: 'required',
	parallel_tool_calls: true,
	tools: [
		{
			type: 'function',
			name: 'subscribe_to_newsletter',
			description: 'Adds a user to the e-mail list.',
			strict: true,
			parameters: {
				type: 'object',
				properties: {
					user: {
						$ref: '#/$defs/User'
					},
					topics: {
						$ref: '#/$defs/Topics'
					}
				},
				required: ['user', 'topics'],
				additionalProperties: false,

				/* recursion possible !!! */
				$defs: {
					EmailAddress: {
						type: 'string'
					},
					Topics: {
						type: 'array',
						items: {
							anyOf: [
								{ type: 'string', const: 'news ' },
								{ type: 'string', const: 'sports' },
								{ type: 'string', const: 'politics' }
							]
						},
						description: 'News categories the user wants'
					},
					User: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							email: { $ref: '#/$defs/EmailAddress' }
						},
						description: 'User payload',
						required: ['name', 'email'],
						additionalProperties: false
					}
				}
			}
		}
	]
})

console.log(output)
