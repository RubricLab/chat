import { createHash } from 'node:crypto'
// schemaBuilder.ts
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/* ── helpers ───────────────────────────────────────────────────── */
const sha8 = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 8)
const sign = (s: z.ZodTypeAny) => sha8(JSON.stringify(s._def))
const strict = <T extends z.ZodRawShape>(shape: T) => z.object(shape).strict()

/* ── 1. domain ─────────────────────────────────────────────────── */
const Location = strict({
	country: z.string(),
	city: z.string(),
	address: z.string(),
	zip: z.string(),
	phone: z.string(),
	email: z.string()
})

const Company = strict({
	name: z.string(),
	industry: z.enum(['tech', 'finance', 'healthcare', 'education', 'other']),
	location: Location
})

const Lead = strict({
	id: z.number(),
	name: z.string(),
	source: z.enum(['linkedin', 'website', 'referral']),
	position: z.string(),
	company: Company
})

/* ── 2. fetch actions ──────────────────────────────────────────── */
const GetLeads = strict({
	action: z.literal('getLeads'),
	params: z.object({}).strict()
})

/* ── 3. mapper generation (dedup by output-hash) ──────────────── */
type Primitive = 'STRING' | 'NUMBER' | 'BOOLEAN'
const prim = (t: z.ZodTypeAny): Primitive | undefined =>
	t instanceof z.ZodString
		? 'STRING'
		: t instanceof z.ZodNumber
			? 'NUMBER'
			: t instanceof z.ZodBoolean
				? 'BOOLEAN'
				: undefined

interface Mapper {
	schema: z.ZodTypeAny
	kind?: Primitive
	outHash: string
}
const mappers: Mapper[] = []

function walk(obj: z.ZodObject<any>, root: string, path: string[] = []) {
	Object.entries(obj.shape).forEach(([key, raw]) => {
		const val = raw as z.ZodTypeAny
		const snake = [...path, key].map(k => k.toUpperCase()).join('_')
		const p = prim(val)

		if (p) {
			const name = `mapper_${root}_${snake}_${p}`
			mappers.push({
				kind: p,
				outHash: sign(val),
				schema: strict({
					action: z.literal(name),
					params: strict({ key: z.literal(key), data: z.lazy(() => obj) })
				})
			})
		} else if (val instanceof z.ZodObject) {
			const name = `mapper_${root}_${snake}`
			mappers.push({
				outHash: sign(val),
				schema: strict({
					action: z.literal(name),
					params: strict({ key: z.literal(key), data: z.lazy(() => obj) })
				})
			})
			walk(val, root, [...path, key])
		}
	})
}
walk(Lead, 'LEAD')

/* ── 4. value-slots (dedup) ───────────────────────────────────── */
const byHash: Record<string, z.ZodTypeAny[]> = {}
mappers.forEach(m => (byHash[m.outHash] ||= []).push(m.schema))

const value = (lit: z.ZodTypeAny) =>
	byHash[sign(lit)] ? z.union([lit, ...byHash[sign(lit)]]) : lit

const V_String = value(z.string())
const V_Number = value(z.number())
const V_LeadArr = z.union([z.array(Lead), GetLeads])

/* ── 5. block: table (cells) ──────────────────────────────────── */
const CellStr = strict({ name: z.string(), data: V_String })
const CellNum = strict({ name: z.string(), data: V_Number })

const Table = strict({
	block: z.literal('table'),
	props: strict({
		rows: V_LeadArr,
		cells: z.array(z.union([CellStr, CellNum]))
	})
})

/* ── 6. unions + root (root uses z.lazy, not getter) ──────────── */
const ActionU = z.union([GetLeads, ...mappers.map(m => m.schema)] as [
	z.ZodTypeAny,
	...z.ZodTypeAny[]
])
const BlockU = z.union([Table])

const Root = strict({
	chain: z.lazy(() => z.union([BlockU, ActionU]))
})

/* ── 7. OpenAI wrapper (zod-to-json-schema) ───────────────────── */
export const chainFormat = {
	type: 'json_schema',
	name: 'chain_format',
	strict: true,
	schema: zodToJsonSchema(Root, {
		openaiStrictMode: true,
		$refStrategy: 'extract-to-root',
		nameStrategy: 'hash',
		name: 'chain_format'
	}),
	$brand: 'auto-parseable-response-format',
	$parseRaw: (raw: string) => Root.parse(JSON.parse(raw))
} as const

/* ── self-test ────────────────────────────────────────────────── */
if (import.meta.url === `file://${process.argv[1]}`) {
	console.log('schema bytes:', JSON.stringify(chainFormat.schema).length)

	const payload = {
		chain: {
			block: 'table',
			props: {
				rows: { action: 'getLeads', params: {} },
				cells: [
					{
						name: 'Lead',
						data: {
							action: 'mapper_LEAD_NAME_STRING',
							params: { key: 'name', data: { action: 'getLeads', params: {} } }
						}
					},
					{
						name: 'City',
						data: {
							action: 'mapper_LEAD_COMPANY_LOCATION_CITY_STRING',
							params: {
								key: 'city',
								data: {
									action: 'mapper_LEAD_COMPANY_LOCATION',
									params: {
										key: 'location',
										data: {
											action: 'mapper_LEAD_COMPANY',
											params: { key: 'company', data: { action: 'getLeads', params: {} } }
										}
									}
								}
							}
						}
					}
				]
			}
		}
	}

	console.log('validation OK →', chainFormat.$parseRaw(JSON.stringify(payload)))
}
