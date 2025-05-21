import z from 'zod/v4'
import { type ActionMap, type AnyAction, createActionProxy } from './actions'
import { type AnyBlock, type BlockMap, createBlockProxy } from './blocks'

export type ZodRegistry = z.core.$ZodRegistry<{ id: string }>

export function createRegistry() {
	const compatibilityRegistry = new Map<z.ZodType, z.ZodType[]>()

	const zodRegistry = z.registry<{ id: string }>()

	let root: z.ZodType[] = []

	const rootSchema = z
		.lazy(() => z.union(root))
		.register(zodRegistry, { id: 'ROOT' as const }) as unknown as z.ZodUnion

	return {
		zodRegistry,
		rootSchema,
		createCompatabilitySlot<Schema extends z.ZodType>({
			name,
			schema,
			excludeSourceSchema = false
		}: {
			name: string
			schema: Schema
			excludeSourceSchema?: boolean
		}) {
			excludeSourceSchema
				? compatibilityRegistry.set(schema, [])
				: compatibilityRegistry.set(schema, [schema])
			return [
				schema,
				z
					.lazy(() => {
						const compat = compatibilityRegistry.get(schema) ?? (undefined as never)
						return compat.length ? z.union(compat) : z.union([schema])
					})
					.register(zodRegistry, { id: name }) as unknown as Schema
			] as const
		},
		pushCompatibility<Schema extends z.ZodType>({
			schema,
			compatibility
		}: { schema: Schema; compatibility: z.ZodType }) {
			const curr = compatibilityRegistry.get(schema) ?? []
			compatibilityRegistry.set(schema, [...curr, compatibility])
		},
		setRootSchema(schema: z.ZodType) {
			root = [schema]
		},
		pushToRootSchema<Schema extends z.ZodType>(schema: Schema) {
			root.push(schema)
		},
		cloneSlot<Schema extends z.ZodType>({
			name,
			schema
		}: {
			name: string
			schema: Schema
		}) {
			const curr = compatibilityRegistry.get(schema) ?? []
			const clone = schema.clone()
			compatibilityRegistry.set(clone, curr)
			return [
				clone,
				z
					.lazy(() => z.union(compatibilityRegistry.get(clone) ?? (undefined as never)))
					.register(zodRegistry, { id: name }) as unknown as Schema
			] as const
		},
		cloneAndReplaceInRoot<Schema extends z.ZodType>({
			name,
			replaceSchema,
			withSchema
		}: {
			name: string
			replaceSchema: Schema
			withSchema: Schema
		}) {
			const rootClone = root
			const compatibilityRegistryClone = new Map<z.ZodType, z.ZodType[]>(compatibilityRegistry)
			// const unionClone = z.lazy(() => z.union(rootClone))
			compatibilityRegistryClone.forEach((e, k) => {
				if (e.includes(replaceSchema)) {
					compatibilityRegistryClone.set(
						k,
						e.map(e => (e === replaceSchema ? withSchema : e))
					)
				}
			})
			return z.lazy(() => z.union(rootClone)).register(zodRegistry, { id: name }) as unknown as Schema
		}
	}
}

export function registerNode<Name extends string, Node extends AnyBlock | AnyAction>({
	name,
	node: { type, schema },
	registry: { pushCompatibility, zodRegistry }
}: {
	name: Name
	node: Node
	registry: ReturnType<typeof createRegistry>
}) {
	switch (type) {
		case 'block': {
			const proxy = createBlockProxy({
				name,
				input: schema.input
			})
			pushCompatibility({ schema: schema.output, compatibility: proxy })
			zodRegistry.add(proxy, { id: `block_${name}` as const })
			return proxy
		}
		case 'action': {
			const proxy = createActionProxy({
				name,
				input: schema.input
			})
			pushCompatibility({ schema: schema.output, compatibility: proxy })
			zodRegistry.add(proxy, { id: `action_${name}` as const })
			return proxy
		}
	}
}

// Weird bug, idk why we can't use ActionMap...
type ActionMapWithoutExecute = Record<string, Omit<AnyAction, 'execute'>>

export function createSchema<Actions extends ActionMapWithoutExecute, Blocks extends BlockMap>({
	name,
	actions,
	blocks,
	registry
}: {
	name: string
	actions?: Actions
	blocks?: Blocks
	registry: ReturnType<typeof createRegistry>
}) {
	type ActionKeys = keyof Actions & string
	type BlockKeys = keyof Blocks & string

	const actionProxies = Object.entries(actions ?? {}).map(([name, action]) => {
		return registerNode({
			name,
			node: action,
			registry
		})
	}) as {
		[K in ActionKeys]: ReturnType<typeof createActionProxy<K, Actions[K] & { execute: never }>>
	}[ActionKeys][]

	const blockProxies = Object.entries(blocks ?? {}).map(([name, block]) => {
		return registerNode({
			name,
			node: block,
			registry
		})
	}) as {
		[K in BlockKeys]: ReturnType<typeof createBlockProxy<K, Blocks[K]>>
	}[BlockKeys][]

	return z.union([...actionProxies, ...blockProxies] as const)
}
