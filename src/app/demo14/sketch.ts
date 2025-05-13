import z from 'zod'
const actions = {
	createContact: {
		schema: {
			input: z.object({
				name: z.string(),
				email: z.string()
			}),
			output: z.void()
		},
		execute: ({ name, email }: { name: string; email: string }) => {
			console.log(name, email)
		}
	},
	getContacts: {
		schema: {
			input: z.void(),
			output: z.array(
				z.object({
					name: z.string(),
					email: z.string()
				})
			)
		},
		execute: () => {
			return [
				{
					name: 'John Doe',
					email: 'john.doe@example.com'
				}
			]
		}
	}
}

const blocks = {
	textInput: {
		schema: {
			input: z.void(),
			output: z.string()
		},
		render: (_: never, { emit }: { emit: (data: string) => void }) => {
			emit('hello')
		}
	},
	text: {
		schema: {
			input: z.string(),
			output: z.void()
		},
		render: (input: string) => {}
	}
}

const genericBlocks = {
	instantiateForm<FieldSchema extends z.ZodObject<any>>(fieldSchema: FieldSchema) {
		return {
			schema: {
				input: z.void(),
				output: fieldSchema
			},
			render: (_: never, { emit }: { emit: (data: z.infer<FieldSchema>) => void }) => {
				// form render code here
				emit(fieldSchema)
			}
		}
	},

	instantiateTable<RowSchema extends z.ZodObject<any>>(rowSchema: RowSchema) {
		return {
			schema: {
				input: z.array(rowSchema),
				output: z.void()
			},
			render: (input: z.infer<z.ZodArray<RowSchema>>) => {
				// table render code here
			}
		}
	}
}

const contactForm = genericBlocks.instantiateForm(
	z.object({
		name: z.string(),
		email: z.string()
	})
)

console.log(
	buildResponseFormat({
		actions,
		blocks: { ...blocks }
	})
)
