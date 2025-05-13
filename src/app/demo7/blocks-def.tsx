import React from 'react'
import { z } from 'zod'
import { createBlock } from './blocks'
export const Contact = z.object({ id: z.string(), email: z.string() })

export const blocks = {
	textInput: createBlock({
		schema: {
			input: z.object({ size: z.enum(['small', 'large']).optional() }),
			output: z.string()
		},
		render: ({ size }, { emit }) => (
			<input style={{ fontSize: size === 'large' ? 18 : 14 }} onChange={e => emit(e.target.value)} />
		)
	}),
	select: createBlock({
		schema: {
			input: z.object({ values: z.array(Contact) }),
			output: Contact
		},
		render: ({ values }, { emit }) => (
			<select onChange={e => emit(values.find(v => v.id === e.target.value))}>
				<option value="">-- choose --</option>
				{values.map(v => (
					<option key={v.id}>{v.email}</option>
				))}
			</select>
		)
	}),
	// emailForm: createBlock({
	// 	schema: {
	// 		input: z.object({
	// 			fields: z.object({
	// 				to: z.string(),
	// 				subject: z.string(),
	// 				body: z.string()
	// 			})
	// 		}),
	// 		output: z.object({ to: z.string(), subject: z.string(), body: z.string() })
	// 	},
	// 	render: ({ fields }, { emit }) => {
	// 		const state = { to: '', subject: '', body: '' }
	// 		return (
	// 			<form
	// 				onSubmit={e => {
	// 					e.preventDefault()
	// 					emit(state)
	// 				}}
	// 			>
	// 				{fields.to}
	// 				{fields.subject}
	// 				{fields.body}
	// 				<button type="submit">Send</button>
	// 			</form>
	// 		)
	// 	}
	// }),
	button: createBlock({
		schema: {
			input: z.object({ label: z.string() }),
			output: z.string().describe('The label of the button')
		},
		render: ({ label }, { emit }) => (
			<button type="button" onClick={() => emit(label)}>
				{label}
			</button>
		)
	}),
	tableRow: createBlock({
		schema: {
			input: z.object({ fields: z.array(z.string()) }),
			output: z.void()
		},
		render: ({ row }, { emit }) => (
			<tr>
				{row.map(cell => (
					<td key={cell.id}>{cell.email}</td>
				))}
			</tr>
		)
	}),
	tableField: createBlock({
		schema: {
			input: z.object({ field: z.string() }),
			output: z.string()
		},
		render: ({ field }, { emit }) => <td>{field}</td>
	})
} as const
