import { OpenAI } from 'openai/index.mjs'
import type { EasyInputMessage } from 'openai/resources/responses/responses.mjs'
import z from 'zod'
import type { ActionMap } from './actions'

type ZodRegistry = z.core.$ZodRegistry<{ id: string }>

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

		return z
			.strictObject({
				action: z.literal(`action_${name}` as const),
				params: input
			})
			.register(registry, { id: `action_${name}` })
	}) as {
		[K in keyof Actions]: z.ZodObject<
			{
				action: z.ZodLiteral<`action_${K & string}`>
				params: Actions[K]['schema']['input']
			},
			// biome-ignore lint/complexity/noBannedTypes: required for strict objects
			{}
		>
	}[keyof Actions][]

	return z.union(registeredActions)
}

export function createCompatibilities<Actions extends ActionMap>() {}
