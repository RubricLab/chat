import { createServer } from 'node:http'
import { RealtimeClient } from 'openai-realtime-api'

import WebSocket from 'ws'

const ws = new WebSocket(
	'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
	{
		headers: {
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			'OpenAI-Beta': 'realtime=v1'
		}
	}
)

const t = {
	type: 'json_schema',
	name: 'UI_SCHEMA',
	strict: true,
	schema: {
		type: 'object',
		properties: {
			ui: {
				type: 'array',
				items: {
					$ref: '#/$defs/ROOT'
				}
			}
		},
		required: ['ui'],
		additionalProperties: false,
		$defs: {
			ROOT: {
				id: 'ROOT',
				anyOf: [
					{
						anyOf: [
							{
								$ref: '#/$defs/action_getContactById'
							},
							{
								$ref: '#/$defs/action_getAllContacts'
							},
							{
								$ref: '#/$defs/action_sendEmail'
							},
							{
								$ref: '#/$defs/block_textInput'
							}
						]
					},
					{
						$ref: '#/$defs/block_view_CONTACT'
					},
					{
						$ref: '#/$defs/block_form_sendEmail'
					}
				]
			},
			action_getContactById: {
				type: 'object',
				properties: {
					action: {
						const: 'action_getContactById',
						type: 'string'
					},
					params: {
						type: 'object',
						properties: {
							id: {
								$ref: '#/$defs/contactId'
							}
						},
						required: ['id'],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false,
				id: 'action_getContactById'
			},
			contactId: {
				id: 'contactId',
				anyOf: [
					{
						type: 'string'
					}
				]
			},
			action_getAllContacts: {
				type: 'object',
				properties: {
					action: {
						const: 'action_getAllContacts',
						type: 'string'
					},
					params: {
						type: 'object',
						properties: {},
						required: [],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false,
				id: 'action_getAllContacts'
			},
			action_sendEmail: {
				type: 'object',
				properties: {
					action: {
						const: 'action_sendEmail',
						type: 'string'
					},
					params: {
						type: 'object',
						properties: {
							to: {
								$ref: '#/$defs/contact'
							},
							subject: {
								$ref: '#/$defs/string'
							},
							body: {
								$ref: '#/$defs/string'
							}
						},
						required: ['to', 'subject', 'body'],
						additionalProperties: false
					}
				},
				required: ['action', 'params'],
				additionalProperties: false,
				id: 'action_sendEmail'
			},
			contact: {
				id: 'contact',
				anyOf: [
					{
						type: 'object',
						properties: {
							id: {
								type: 'string'
							},
							name: {
								$ref: '#/$defs/string'
							}
						},
						required: ['id', 'name'],
						additionalProperties: false
					},
					{
						$ref: '#/$defs/action_getContactById'
					}
				]
			},
			string: {
				id: 'string',
				anyOf: [
					{
						type: 'string'
					},
					{
						$ref: '#/$defs/block_textInput'
					}
				]
			},
			block_textInput: {
				type: 'object',
				properties: {
					block: {
						const: 'block_textInput',
						type: 'string'
					},
					props: {
						type: 'object',
						properties: {},
						required: [],
						additionalProperties: false
					}
				},
				required: ['block', 'props'],
				additionalProperties: false,
				id: 'block_textInput'
			},
			block_view_CONTACT: {
				type: 'object',
				properties: {
					block: {
						const: 'block_view_CONTACT',
						type: 'string'
					},
					props: {
						type: 'object',
						properties: {
							hydrate: {
								type: 'object',
								properties: {
									id: {
										type: 'string'
									},
									name: {
										$ref: '#/$defs/string'
									}
								},
								required: ['id', 'name'],
								additionalProperties: false
							},
							children: {
								type: 'array',
								items: {
									$ref: '#/$defs/ROOT'
								}
							},
							name: {
								type: 'string'
							}
						},
						required: ['hydrate', 'children', 'name'],
						additionalProperties: false
					}
				},
				required: ['block', 'props'],
				additionalProperties: false,
				id: 'block_view_CONTACT'
			},
			block_form_sendEmail: {
				type: 'object',
				properties: {
					block: {
						const: 'block_form_sendEmail',
						type: 'string'
					},
					props: {
						type: 'object',
						properties: {
							inputs: {
								type: 'object',
								properties: {
									to: {
										$ref: '#/$defs/contact'
									},
									subject: {
										$ref: '#/$defs/string'
									},
									body: {
										$ref: '#/$defs/string'
									}
								},
								required: ['to', 'subject', 'body'],
								additionalProperties: false
							},
							onExecute: {
								type: 'array',
								items: {
									$ref: '#/$defs/ROOT'
								}
							}
						},
						required: ['inputs', 'onExecute'],
						additionalProperties: false
					}
				},
				required: ['block', 'props'],
				additionalProperties: false,
				id: 'block_form_sendEmail'
			}
		}
	}
}
function addTools() {
	ws.send(
		JSON.stringify({
			type: 'session.update',
			session: {
				tools: [
					{
						type: 'function',
						strict: true,
						name: 'generate_horoscope',
						description: 'generate some dope UI',
						parameters: t.schema
					}
				],
				tool_choice: 'auto'
			}
		})
	)
}

function sendMessage() {
	ws.send(
		JSON.stringify({
			type: 'conversation.item.create',
			item: {
				type: 'message',
				role: 'user',
				content: [
					{
						type: 'input_text',
						text: 'What is my horoscope? I am an aquarius.'
					}
				]
			}
		})
	)
}

function complete() {
	ws.send(
		JSON.stringify({
			type: 'response.create'
		})
	)
}

ws.on('open', function open() {
	console.log('Connected to server.')
})

ws.on('message', function incoming(message) {
	const msg = JSON.parse(message.toString())
	if (msg.type === 'session.created') {
		console.log('session created')
		addTools()
	} else if (msg.type === 'session.updated') {
		console.log('session updated')
		sendMessage()
	} else if (msg.type === 'conversation.item.created') {
		console.log('conversation item created')
		console.log(msg.item.content)
		complete()
	} else if (msg.type === 'response.function_call_arguments.done') {
		console.log('response function call arguments done')
		const fn = {
			name: msg.name,
			args: JSON.parse(msg.arguments)
		}
		console.dir(fn, { depth: null })
	} else {
		console.log(msg)
	}
})

// CONCLUSION: NO - Realtime can't safely do structured out (strict is not supported)
// THIS API FEELS LIKE IT'S NOT GOING TO BE SUPPORTED LONG TERM.
// Streaming outputs is probably a better bet.
