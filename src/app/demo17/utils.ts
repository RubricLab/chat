import { OpenAI } from 'openai/index.mjs'
import type { EasyInputMessage } from 'openai/resources/responses/responses.mjs'
import z from 'zod'
import type { ActionMap, AnyAction } from './actions'

type ZodRegistry = z.core.$ZodRegistry<{ id: string }>

export function createTypeRegistry() {
	const registry = new Map<z.ZodType, { id: string }>()

	return {
		register: (type: z.ZodType, name: string) => {
			if (registry.has(type)) {
				throw new Error('Type already registered')
			}

			registry.set(type, { id: `type_${name}` })
			return type
		},
		registry
	}
}

export function createJSONSchema<T extends z.ZodType>({
	schema,
	registry
}: { schema: T; registry?: ZodRegistry }) {
	return z.toJSONSchema(schema, {
		override: ({ jsonSchema }) => {
			if (jsonSchema.type === 'object') {
				jsonSchema.additionalProperties = false
			}
			if ('const' in jsonSchema) {
				jsonSchema.type = 'string'
			}
		},
		...(registry ? { metadata: registry } : undefined)
	})
}

type ResponseFormat<T extends z.ZodObject> = {
	type: 'json_schema'
	name: string
	strict: true
	schema: z.core.JSONSchema.BaseSchema
	$brand: 'auto-parseable-response-format'
	$parseRaw: (args: string) => z.infer<T>
	__output: z.infer<T>
}

export function createResponseFormat<T extends z.ZodObject>({
	name,
	schema,
	registry
}: {
	name: string
	schema: T
	registry?: ZodRegistry
}) {
	return Object.defineProperties(
		{
			type: 'json_schema',
			name,
			strict: true,
			schema: createJSONSchema({
				schema,
				...(registry ? { registry } : {})
			})
		},
		{
			$brand: {
				value: 'auto-parseable-response-format' as const,
				enumerable: false
			},
			$parseRaw: {
				value: (args: string) => {
					try {
						return schema.parse(JSON.parse(args))
					} catch (error) {
						console.error(error)
						throw new Error('Invalid payload')
					}
				},
				enumerable: false
			}
		}
	) as ResponseFormat<T>
}

export async function createStructuredOutputInference<Format extends ResponseFormat<z.ZodObject>>({
	openAIApiKey: apiKey,
	responseFormat,
	messages
}: {
	openAIApiKey: string
	responseFormat: Format
	messages?: [EasyInputMessage, ...EasyInputMessage[]]
}) {
	const openai = new OpenAI({
		apiKey
	})

	const { output_parsed } = await openai.responses.parse({
		model: 'gpt-4.1',
		input: messages ?? [{ role: 'user' as const, content: '' }],
		text: {
			format: responseFormat
		}
	})

	if (!output_parsed) {
		throw new Error('No parsed output')
	}

	return output_parsed
}

export function registerBrandedType<Name extends string, T extends z.ZodType>({
	name,
	type,
	registry
}: {
	name: Name extends `${string}_${string}` ? 'ERROR: Brand name cannot contain underscores' : Name
	type: T
	registry: ZodRegistry
}) {
	if (name.includes('_')) {
		throw new Error('Brand name cannot contain underscores')
	}

	return (type as z.ZodType).register(registry, { id: `type_${name}` }) as T
}

export function buildActionProxy<Action extends AnyAction>({
	name,
	input
}: {
	name: string
	input: Action['schema']['input']
}) {
	return z.strictObject({
		action: z.literal(`action_${name}` as const),
		params: input
	})
}

export function createJoinProducers<A extends ActionMap, T extends Record<string, AnyZod>>({
	actions,
	types
}: { actions: A; types: T }) {
	const entries = Object.entries(actions) as [keyof A & string, A[keyof A]][]

	const joined = Object.fromEntries(
		Object.entries(types).map(([k, base]) => {
			const proxies = entries
				.filter(([, def]) => def.schema.output === base)
				.map(([name, def]) => buildActionProxy({ name, input: def.schema.input }))

			return [k, proxies.length ? z.union([base, ...proxies]) : base]
		})
	) as {
		[K in keyof T]: T[K] | ReturnType<typeof buildActionProxy>
	}

	return joined
}
// type ActionKeys = keyof Actions & string
// type TypeKeys = keyof Types & string

// type Schema = Actions[ActionKeys]['schema']['output'] | Types[TypeKeys]

// const actionKeys = Object.keys(actions) as ActionKeys[]
// const typeKeys = Object.keys(types) as TypeKeys[]

// const schemaMap = new WeakMap<Schema, { actions: z.ZodType[]; types: TypeKeys[] }>()

// typeKeys.map(name => {
// 	const type = types[name] ?? (undefined as never)
// 	if (schemaMap.has(type)) {
// 		console.log('already registered, pushing new type', name)
// 		schemaMap.get(type)?.types.push(name)
// 	} else {
// 		console.log('registering new type', name)
// 		schemaMap.set(type, { actions: [], types: [name] })
// 	}
// })

// actionKeys.map(name => {
// 	const {
// 		schema: { input, output }
// 	} = actions[name] ?? (undefined as never)
// 	console.log(`output of ${name} is ${output}`)
// 	if (schemaMap.has(output)) {
// 		console.log('already registered, pushing new action', name)
// 		schemaMap.get(output)?.actions.push(buildActionProxy({ name, input }))
// 	} else {
// 		console.log('registering new action', name)
// 		schemaMap.set(output, { actions: [buildActionProxy({ name, input })], types: [] })
// 	}
// })

// const thing = Object.fromEntries(
// 	typeKeys.map(key => {
// 		const t = types[key] ?? (undefined as never)
// 		const entry = schemaMap.get(t) ?? (undefined as never)
// 		return [key, entry?.actions.length ? z.union([t, ...entry.actions]) : t]
// 	})
// )
// console.log(thing)
// return thing

export function registerActions<Actions extends ActionMap>({
	actions,
	registry
}: {
	actions: Actions
	registry: ZodRegistry
}) {
	const actionKeys = Object.keys(actions) as (keyof Actions & string)[]

	const registeredActions = actionKeys.map(name => {
		const {
			schema: { input, output }
		} = actions[name] ?? (undefined as never)

		if (!registry.has(input)) {
			input.register(registry, { id: `input_type_${name}` })
		}

		if (!registry.has(output)) {
			output.register(registry, { id: `output_type_${name}` })
		}

		return buildActionProxy({ name, input }).register(registry, {
			id: `action_${name}`
		})
	}) as {
		[K in keyof Actions]: z.ZodObject<
			{
				action: z.ZodLiteral<`action_${K & string}`>
				params: Actions[K]['schema']['input']
			},
			// biome-ignore lint/complexity/noBannedTypes: required for strict objects
			{},
			// biome-ignore lint/complexity/noBannedTypes: required for strict objects
			{}
		>
	}[keyof Actions][]

	return z.union(registeredActions)
}
