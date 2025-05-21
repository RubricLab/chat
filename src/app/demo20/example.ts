// instantiate view<CONTACT>, form<SENDEMAIL>

import z from 'zod'
import { createBlock } from '~/demo19/lib/blocks'

const blocks = {
	heading: createBlock({
		schema: {
			input: { text: z.string() },
			output: z.void()
		},
		render: (_, { emit }) => {
			return ''
		}
	})
}

const ex0 = [
	{
		block: 'heading',
		props: {
			text: 'hello world'
		}
	}
]

function render<Payload extends any[]>(payload: Payload) {
	payload.map(fragment => {
		if ('block' in fragment) {
			const { block, props } = fragment
			const { render } = blocks[block] as (typeof blocks)[keyof typeof blocks]
			return render(props)
		}
	})
}

const ex1 = [
	{
		block: 'block_view_CONTACT',
		props: {
			hydrate: {
				id: '0rjnbjd-rjdn-qiej',
				name: 'test'
			},
			name: 'Contact Details',
			children: [
				{
					block: 'block_form_SENDEMAIL',
					props: {
						inputs: {
							to: '$.view_CONTACT.CONTACT',
							subject: {
								block: 'block_textInput',
								props: {}
							},
							body: {
								block: 'block_textInput',
								props: {}
							}
						},
						onExecute: [
							{
								block: 'modal',
								children: [
									{
										block: 'heading',
										props: {
											text: '$.form_SENDEMAIL.EMAILID'
										}
									}
								]
							}
						]
					}
				}
			]
		}
	}
]

// instantiate: form<SENDEMAIL>, select<CONTACT>

const ex2 = [
	{
		block: 'block_form_SENDEMAIL',
		props: {
			inputs: {
				to: {
					block: 'select_CONTACT',
					props: {}
				},
				subject: {
					block: 'block_textInput',
					props: {}
				},
				body: {
					block: 'block_textInput',
					props: {}
				}
			},
			onExecute: []
		}
	}
]
