import z from 'zod'
import { actions } from '../actions'
import { blocks } from '../blocks'

export function Enabled() {
	return (
		<div style={{ maxWidth: '500px' }}>
			<h1>Blocks</h1>
			{Object.entries(blocks).map(([key, value]) => {
				return (
					<div key={`block_${key}`}>
						<h2>{key}</h2>
						<div>Input: {JSON.stringify(z.toJSONSchema(z.object(value.schema.input)))}</div>
						<div>Output: {JSON.stringify(z.toJSONSchema(value.schema.output))}</div>
					</div>
				)
			})}
			<h1>Actions</h1>
			{Object.entries(actions).map(([key, value]) => {
				return (
					<div key={`block_${key}`}>
						<h2>{key}</h2>
						<div>Input: {JSON.stringify(z.toJSONSchema(z.object(value.schema.input)))}</div>
						<div>Output: {JSON.stringify(z.toJSONSchema(value.schema.output))}</div>
					</div>
				)
			})}
		</div>
	)
}
