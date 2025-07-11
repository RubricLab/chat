import { createTool } from '@rubriclab/agents'
import { createGenericBlock, statefulObject } from '@rubriclab/blocks'
import { z } from 'zod/v4'
import type { $strict } from 'zod/v4/core'
import { actionSchemas } from '../../actions'
import { execute } from '../../actions/server'
import { addBlock } from '..'
import { splitReactState } from './helper'

const formTypes = Object.fromEntries(
	Object.entries(actionSchemas)
		.filter(([_, { input }]) => {
			return input instanceof z.ZodObject
		})
		.map(([key, { input }]) => [
			key,
			{
				input: z.strictObject({
					fields: statefulObject(input as z.ZodObject),
					mutation: z.literal(key)
				}),
				output: z.null()
			}
		])
) as {
	[K in keyof typeof actionSchemas as (typeof actionSchemas)[K]['input'] extends z.ZodObject
		? K
		: never]: {
		input: z.ZodObject<
			{
				mutation: z.ZodLiteral<K>
				fields: ReturnType<
					typeof statefulObject<
						(typeof actionSchemas)[K]['input'] extends z.ZodObject
							? (typeof actionSchemas)[K]['input']
							: never
					>
				>
			},
			$strict
		>
		output: z.ZodNull
	}
}

export const genericFormBlock = createGenericBlock({
	description:
		'An action that instantiates a new form block and adds it to the schema. Forms must be instantiated with an action that they are responsible for mutating, before they can be chained and rendered.',
	handleBlock({ type, block }) {
		addBlock({ block, name: `genericForm<${type}>` })
	},
	render({ mutation, fields }) {
		console.log('THE FIELDS')
		console.log(fields, { depth: null })
		const { react, getState } = splitReactState(fields)

		async function ex() {
			const params = getState()
			console.log('THE STATE:')
			console.dir(params, { depth: null })
			console.log(`executing ${mutation} with ${params}`)
			await execute({ action: mutation, params })
		}
		return (
			<form
				onSubmit={e => {
					e.preventDefault()
					ex()
				}}
				className="flex flex-col"
			>
				{react.map(node => (
					<div>{node}</div>
				))}
				<button type={'submit'}>Submit</button>
			</form>
		)
	},
	types: formTypes
})

export const instantiateFormTool = createTool(genericFormBlock)
