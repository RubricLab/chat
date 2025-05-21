import z from 'zod'

function createRegistry() {
	const registry = new Map<z.ZodType, { name: string; compatabilities: z.ZodType[] }>()

	return {
		registerType<Name extends string, Schema extends z.ZodType>({
			name,
			schema
		}: { name: Name; schema: Schema }) {
			registry.set(schema, { name, compatabilities: [] })
			return [
				schema,
				z.lazy(() => {
					const { compatabilities } = registry.get(schema) ?? (undefined as never)
					return z.union(compatabilities) as z.ZodUnion<[Schema]>
				})
			] as const
		},
		pushCompatabilities<Schema extends z.ZodType, Compatabilities extends z.ZodType[]>({
			schema,
			compatabilities: newCompatabilities
		}: { schema: Schema; compatabilities: Compatabilities }) {
			const { name, compatabilities } = registry.get(schema) ?? (undefined as never)

			registry.set(schema, { name, compatabilities: [...compatabilities, ...newCompatabilities] })
		},
		buildZodRegistry() {
			const zodRegistry = z.registry<{ id: string }>()

			registry.forEach(({ name, compatabilities }, type) => {
				z.union([type, ...compatabilities]).register(zodRegistry, { id: name })
			})

			return zodRegistry
		},
		cloneType<Name extends string, Schema extends z.ZodType>({
			newName,
			schema
		}: { newName: Name; schema: Schema }) {
			const { compatabilities } = registry.get(schema) ?? (undefined as never)
			const cloned = schema.clone()
			const newType = this.registerType({ name: newName, schema: cloned })
			this.pushCompatabilities({ schema: cloned, compatabilities })
			// ?
			registry.forEach(({ name, compatabilities }, k) => {
				if (compatabilities.includes(schema)) {
					this.cloneType({
						newName: `${name}_${newName}`,
						schema: k
					})
				}
			})
			return newType
		}
	}
}
