import z from 'zod'
import { type AnyAction, createActionProxy } from './actions'
import { type BlockMap, createBlockProxy } from './blocks'

export type ZodRegistry = z.core.$ZodRegistry<{ id: string }>

export function createRegistry() {
	const compatibilityRegistry = new WeakMap<z.ZodType, z.ZodType[]>()

	const zodRegistry = z.registry<{ id: string }>()

	return {
		zodRegistry,
		createCompatabilitySlot<Schema extends z.ZodType>({
			name,
			schema
		}: {
			name: string
			schema: Schema
		}) {
			compatibilityRegistry.set(schema, [schema])
			return [
				schema,
				z
					.lazy(() => z.union(compatibilityRegistry.get(schema) ?? (undefined as never)))
					.register(zodRegistry, { id: name }) as unknown as Schema
			] as const
		},
		pushCompatibility<Schema extends z.ZodType>({
			schema,
			compatibility
		}: { schema: Schema; compatibility: z.ZodType }) {
			const curr = compatibilityRegistry.get(schema) ?? []
			compatibilityRegistry.set(schema, [...curr, compatibility])
		}
	}
}

// Weird bug, idk why we can't use ActionMap...
type ActionMapWithoutExecute = Record<string, Omit<AnyAction, 'execute'>>

export function createSchema<Actions extends ActionMapWithoutExecute, Blocks extends BlockMap>({
	actions,
	blocks,
	registry
}: {
	actions?: Actions
	blocks?: Blocks
	registry: ReturnType<typeof createRegistry>
}) {
	const actionProxies = Object.entries(actions ?? {}).map(([name, action]) => {
		const actionProxy = createActionProxy({
			name,
			input: action.schema.input
		})
		registry.pushCompatibility({ schema: action.schema.output, compatibility: actionProxy })
		registry.zodRegistry.add(actionProxy, { id: `action_${name}` })

		return actionProxy
	})

	const blockProxies = Object.entries(blocks ?? {}).map(([name, block]) => {
		const blockProxy = createBlockProxy({
			name,
			input: block.schema.input
		})
		registry.pushCompatibility({ schema: block.schema.output, compatibility: blockProxy })
		registry.zodRegistry.add(blockProxy, { id: `block_${name}` })

		return blockProxy
	})

	return z.union([...actionProxies, ...blockProxies])
}
