import { createHash } from 'node:crypto'
import { z } from 'zod'

/* ── stable names / signatures ─────────────────────────────── */

export function generateSignature(schema: z.ZodTypeAny): string {
	const def = schema._def
	/* … exactly the same switch you already use in @rubriclab/actions … */
	switch (def?.typeName) {
		case z.ZodFirstPartyTypeKind.ZodString:
			return 'string'
		/*  (copy the whole switch from your actions package) */
		default:
			return 'unknown'
	}
}

const shortHash = (str: string) => createHash('sha1').update(str).digest('hex').slice(0, 8)

export const stableName = (s: z.ZodTypeAny) => `Schema_${shortHash(generateSignature(s))}`

export const stableDescribe = <T extends z.ZodTypeAny>(s: T): T =>
	s._def.description ? s : s.describe(stableName(s))

/* ── minimal Zod ➜ JSON-Schema (copy from actions) ─────────── */

type J = Record<string, unknown>
type Seen = Map<unknown, string>
type Out = { definitions: Record<string, J>; root: J }

export function zodToJsonSchema(root: z.ZodTypeAny): Out {
	const seen: Seen = new Map()
	const definitions: Record<string, J> = {}

	function walk(type: z.ZodTypeAny): J {
		// ↯ 1. cycle-break: if we've converted this node, just $ref it
		const id = stableId(type)
		if (seen.has(type)) return { $ref: `#/definitions/${id}` }
		seen.set(type, id)

		const js: J = (() => {
			const def = type._def
			switch (def.typeName) {
				case z.ZodFirstPartyTypeKind.ZodString:
					return { type: 'string' }
				case z.ZodFirstPartyTypeKind.ZodNumber:
					return { type: 'number' }
				case z.ZodFirstPartyTypeKind.ZodBoolean:
					return { type: 'boolean' }
				case z.ZodFirstPartyTypeKind.ZodVoid:
					return { type: 'null' }
				case z.ZodFirstPartyTypeKind.ZodLiteral:
					return { const: def.value }
				case z.ZodFirstPartyTypeKind.ZodEnum:
					return { enum: def.values }
				case z.ZodFirstPartyTypeKind.ZodNativeEnum:
					return { enum: Object.values(def.values) }

				/* objects -------------------------------------------------- */
				case z.ZodFirstPartyTypeKind.ZodObject: {
					const props: Record<string, J> = {}
					const req: string[] = []
					for (const [k, v] of Object.entries(def.shape())) {
						props[k] = walk(v)
						req.push(k)
					}
					return {
						type: 'object',
						properties: props,
						required: req,
						additionalProperties: false
					}
				}

				/* arrays --------------------------------------------------- */
				case z.ZodFirstPartyTypeKind.ZodArray:
					return { type: 'array', items: walk(def.type) }

				/* unions --------------------------------------------------- */
				case z.ZodFirstPartyTypeKind.ZodUnion:
					return { anyOf: def.options.map(walk) }

				/* optionals / nullable / default just unwrap --------------- */
				case z.ZodFirstPartyTypeKind.ZodOptional:
				case z.ZodFirstPartyTypeKind.ZodNullable:
				case z.ZodFirstPartyTypeKind.ZodDefault:
					return walk(def.innerType)

				/* lazy  🔑  ----------------------------------------------- */
				case z.ZodFirstPartyTypeKind.ZodLazy:
					return walk(def.getter())

				default:
					throw new Error(`Unsupported Zod type: ${def.typeName}`)
			}
		})()

		// ↯ 3. stash only AFTER producing js to avoid hollow definitions
		definitions[id] = js
		return { $ref: `#/definitions/${id}` }
	}

	const rootSchema = walk(root)
	return { root: rootSchema, definitions }
}

/* --------------------------------------------------------- */
/*  deterministic id per *Zod object*                        */
/* --------------------------------------------------------- */
const idMap: Map<unknown, string> = new Map()
let idCount = 0
function stableId(key: unknown): string {
	let id = idMap.get(key)
	if (!id) {
		id = `def_${++idCount}`
		idMap.set(key, id)
	}
	return id
}
