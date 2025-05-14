import z from 'zod'
import type { ActionMap, AnyAction } from './actions'

export function buildActionProxy<Action extends AnyAction, Name extends string>({
	name,
	input
}: {
	name: Name
	input: Action['schema']['input']
}) {
	return z.strictObject({
		action: z.literal(`action_${name}` as const),
		params: input
	})
}

function makeOutputUnion<Action extends AnyAction, Name extends string>({
	action,
	name
}: { action: Action; name: Name }) {
	return z.union([
		action.schema.output,
		buildActionProxy({
			name,
			input: action.schema.input
		})
	])
}

export function createTypeCompatibilityMap<
	Actions extends ActionMap,
	Types extends Record<string, z.ZodType>
>({
	actions,
	types
}: {
	actions: Actions
	types: Types
}) {
	type ActionKeys = keyof Actions & string

	type TypeKeys = keyof Types & string

	const map = new Map<z.ZodType, { types: TypeKeys[]; input: ActionKeys[]; output: ActionKeys[] }>()

	const actionKeys = Object.keys(actions) as ActionKeys[]

	const typeKeys = Object.keys(types) as TypeKeys[]

	typeKeys.map(key => {
		const type = types[key] ?? (undefined as never)
		map.set(type, { types: [key], input: [], output: [] })
	})

	actionKeys.map(key => {
		const action = actions[key] ?? (undefined as never)
		const output = action.schema.output

		if (map.has(output)) {
			const curr = map.get(output) ?? (undefined as never)
			map.set(output, { ...curr, output: [...curr.output, `outputOf_action_${key}`] })
		}
	})

	actionKeys.map(key => {
		const action = actions[key] ?? (undefined as never)
		const input = action.schema.input

		if (map.has(input)) {
			const curr = map.get(input) ?? (undefined as never)
			map.set(input, { ...curr, input: [...curr.input, `inputOf_action_${key}`] })
		}
	})

	// biome-ignore lint/complexity/noForEach: specific map property
	map.forEach(({ types, input, output }) => {
		if (output.length) {
			const union = z.union([...types, ...buildActionProxy])
			map.set(union, { types, input, output })
		}
	})

	return map
}

const CompanyId = z.string()

const map = createTypeCompatibilityMap({
	actions: {
		getCompanyId: {
			type: 'action',
			schema: { input: z.string(), output: CompanyId },
			execute: _ => ''
		}
	},
	types: {
		CompanyId,
		CompanyNumber: z.number()
	}
})
