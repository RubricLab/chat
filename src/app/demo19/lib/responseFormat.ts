import z from 'zod/v4'
import type { ZodRegistry } from './schema'

export type ResponseFormat<T extends z.ZodObject> = {
	type: 'json_schema'
	name: string
	strict: true
	schema: z.core.JSONSchema.BaseSchema
	$brand: 'auto-parseable-response-format'
	$parseRaw: (args: string) => z.infer<T>
	__output: z.infer<T>
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
